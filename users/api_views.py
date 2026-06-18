from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q, Count
from django.utils.dateparse import parse_datetime

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Profile, Reaction, DirectMessage
from .serializers import (
    UserSerializer,
    ProfileSerializer,
    RegisterSerializer,
    LoginSerializer,
    DirectMessageSerializer,
)
from memorials.models import Memorial
from memorials.serializers import MemorialListSerializer
from tales.models import Tale
from tales.serializers import TaleListSerializer


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """POST /api/auth/register/ — register and auto-login."""
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()
    login(request, user)
    return Response({
        'status': 'ok',
        'user': UserSerializer(user).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """POST /api/auth/login/ — session login."""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(
        request,
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )
    if user is None:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    login(request, user)
    return Response({
        'status': 'ok',
        'user': UserSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """POST /api/auth/logout/ — session logout."""
    logout(request)
    return Response({'status': 'ok'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def me_view(request):
    """GET /api/auth/me/ — current user info."""
    if not request.user.is_authenticated:
        return Response({'authenticated': False})
    return Response({
        'authenticated': True,
        'user': UserSerializer(request.user).data,
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_profiles(request):
    """GET /api/users/search/?q=&limit= — search profiles."""
    q = request.query_params.get('q', '').strip()
    limit = min(int(request.query_params.get('limit', 10)), 20)

    qs = Profile.objects.select_related('user').filter(public_search=True)
    if q:
        qs = qs.filter(
            Q(user__username__icontains=q) |
            Q(user__first_name__icontains=q) |
            Q(user__last_name__icontains=q) |
            Q(display_name__icontains=q) |
            Q(bio__icontains=q) |
            Q(tags__icontains=q)
        )
    qs = qs.order_by('user__username')[:max(1, limit)]

    results = ProfileSerializer(qs, many=True, context={'request': request}).data
    return Response({'results': results})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def profile_detail(request, username):
    """GET /api/users/<username>/ — profile with memorials, tales, reaction counts."""
    profile_user = User.objects.filter(username=username).first()
    if not profile_user:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    profile = ProfileSerializer(profile_user.profile, context={'request': request}).data
    memorials = Memorial.objects.filter(owner=profile_user).select_related('owner')
    tales = Tale.objects.filter(author=profile_user)

    # Reaction counts for memorials
    ct_mem = ContentType.objects.get_for_model(Memorial)
    mem_ids = list(memorials.values_list('id', flat=True))
    mem_reacts = (Reaction.objects.filter(content_type=ct_mem, object_id__in=mem_ids)
                  .values('object_id', 'reaction_type').annotate(c=Count('id')))
    mem_counts = {mid: {'like': 0, 'love': 0, 'support': 0} for mid in mem_ids}
    for r in mem_reacts:
        mem_counts[r['object_id']][r['reaction_type']] = r['c']

    user_mem_react = {}
    if request.user.is_authenticated and mem_ids:
        user_rs = Reaction.objects.filter(user=request.user, content_type=ct_mem, object_id__in=mem_ids)
        user_mem_react = {r.object_id: r.reaction_type for r in user_rs}

    # Reaction counts for tales
    ct_tale = ContentType.objects.get_for_model(Tale)
    tale_ids = list(tales.values_list('id', flat=True))
    tale_reacts = (Reaction.objects.filter(content_type=ct_tale, object_id__in=tale_ids)
                   .values('object_id', 'reaction_type').annotate(c=Count('id')))
    tale_counts = {tid: {'like': 0, 'love': 0, 'support': 0} for tid in tale_ids}
    for r in tale_reacts:
        tale_counts[r['object_id']][r['reaction_type']] = r['c']

    user_tale_react = {}
    if request.user.is_authenticated and tale_ids:
        user_rs = Reaction.objects.filter(user=request.user, content_type=ct_tale, object_id__in=tale_ids)
        user_tale_react = {r.object_id: r.reaction_type for r in user_rs}

    memorials_data = MemorialListSerializer(memorials, many=True, context={'request': request}).data
    tales_data = TaleListSerializer(tales, many=True, context={'request': request}).data

    # Attach reaction data
    for m in memorials_data:
        mid = m['id']
        m['reactions'] = mem_counts.get(mid, {'like': 0, 'love': 0, 'support': 0})
        m['my_reaction'] = user_mem_react.get(mid)

    for t in tales_data:
        tid = t['id']
        t['reactions'] = tale_counts.get(tid, {'like': 0, 'love': 0, 'support': 0})
        t['my_reaction'] = user_tale_react.get(tid)

    return Response({
        'profile': profile,
        'memorials': memorials_data,
        'tales': tales_data,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def react_toggle(request):
    """POST /api/react/ — toggle reaction on a memorial or tale."""
    target_type = (request.data.get('model') or '').strip()
    target_id = request.data.get('id')
    rtype = (request.data.get('reaction') or '').strip()

    if rtype not in ('like', 'love', 'support'):
        return Response({'error': 'Invalid reaction'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        obj_id = int(target_id)
    except (TypeError, ValueError):
        return Response({'error': 'Bad target'}, status=status.HTTP_400_BAD_REQUEST)

    if target_type not in ('memorial', 'tale'):
        return Response({'error': 'Bad target type'}, status=status.HTTP_400_BAD_REQUEST)

    model_cls = Memorial if target_type == 'memorial' else Tale
    ct = ContentType.objects.get_for_model(model_cls)

    if not model_cls.objects.filter(id=obj_id).exists():
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    existing = Reaction.objects.filter(user=request.user, content_type=ct, object_id=obj_id).first()
    active = False
    if existing and existing.reaction_type == rtype:
        existing.delete()
    else:
        if existing:
            existing.reaction_type = rtype
            existing.save(update_fields=['reaction_type'])
        else:
            Reaction.objects.create(user=request.user, content_type=ct, object_id=obj_id, reaction_type=rtype)
        active = True

    counts_qs = Reaction.objects.filter(content_type=ct, object_id=obj_id).values('reaction_type').annotate(c=Count('id'))
    counts = {'like': 0, 'love': 0, 'support': 0}
    for r in counts_qs:
        counts[r['reaction_type']] = r['c']

    return Response({'status': 'ok', 'counts': counts, 'active': active, 'type': rtype})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_dm(request, username):
    """POST /api/users/<username>/dm/ — send a direct message."""
    receiver = User.objects.filter(username=username).first()
    if not receiver:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    if receiver == request.user:
        return Response({'error': "Can't message yourself"}, status=status.HTTP_400_BAD_REQUEST)

    content = (request.data.get('message') or '').strip()
    if not content:
        return Response({'error': 'Empty message'}, status=status.HTTP_400_BAD_REQUEST)

    dm = DirectMessage.objects.create(sender=request.user, receiver=receiver, content=content)
    return Response(DirectMessageSerializer(dm).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dm_feed(request, username):
    """GET /api/users/<username>/dm/feed/?since= — DM feed for polling."""
    other = User.objects.filter(username=username).first()
    if not other:
        return Response({'results': []}, status=status.HTTP_404_NOT_FOUND)

    since = request.query_params.get('since')
    qs = DirectMessage.objects.filter(
        Q(sender=request.user, receiver=other) | Q(sender=other, receiver=request.user)
    ).order_by('created_at')

    if since:
        dt = parse_datetime(since)
        if dt:
            qs = qs.filter(created_at__gt=dt)

    data = DirectMessageSerializer(qs[:100], many=True).data

    # Mark received messages as read
    DirectMessage.objects.filter(receiver=request.user, sender=other, is_read=False).update(is_read=True)

    return Response({'results': data})
