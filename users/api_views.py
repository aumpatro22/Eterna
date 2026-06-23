from django.contrib.auth import authenticate, login, logout, get_user_model
User = get_user_model()
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from django.middleware.csrf import get_token

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, throttle_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import Profile, Reaction, DirectMessage, Conversation, CircleConnection, ProfileTimelineEvent, Report
from .serializers import (
    UserSerializer,
    UserPublicSerializer,
    ProfileSerializer,
    RegisterSerializer,
    LoginSerializer,
    DirectMessageSerializer,
    ConversationSerializer,
    CircleConnectionSerializer,
    ProfileTimelineEventSerializer,
)
from .throttles import AuthThrottle, MessageThrottle, ReportThrottle
from memorials.models import Memorial
from memorials.serializers import MemorialListSerializer
from tales.models import Tale
from tales.serializers import TaleListSerializer


@api_view(['POST'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
@throttle_classes([AuthThrottle])
def register_view(request):
    """POST /api/auth/register/ — register and auto-login."""
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()
    login(request, user)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'status': 'ok',
        'user': UserSerializer(user).data,
        'token': token.key,
        'csrfToken': get_token(request)
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
@throttle_classes([AuthThrottle])
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
    if getattr(user, 'is_banned', False):
        return Response({'error': f'Your account has been banned: {user.ban_reason or "No reason provided."}'}, status=status.HTTP_403_FORBIDDEN)
    login(request, user)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'status': 'ok',
        'user': UserSerializer(user).data,
        'token': token.key,
        'csrfToken': get_token(request)
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """POST /api/auth/logout/ — session logout."""
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    logout(request)
    return Response({'status': 'ok'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def me_view(request):
    """GET /api/auth/me/ — current user info."""
    if not request.user.is_authenticated:
        return Response({
            'authenticated': False,
            'csrfToken': get_token(request)
        })
    return Response({
        'authenticated': True,
        'user': UserSerializer(request.user).data,
        'csrfToken': get_token(request)
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


def get_connection_status(user_a, user_b):
    if not user_a or not user_b or not user_a.is_authenticated or not user_b.is_authenticated:
        return None, False
    conn = CircleConnection.objects.filter(
        (Q(sender=user_a) & Q(receiver=user_b)) |
        (Q(sender=user_b) & Q(receiver=user_a))
    ).first()
    if conn:
        return conn.status, conn.sender == user_a
    return None, False


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def profile_detail(request, username):
    """GET /api/users/<username>/ — profile with memorials, tales, reaction counts, timeline."""
    profile_user = User.objects.filter(username=username).first()
    if not profile_user:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    is_owner = request.user.is_authenticated and request.user == profile_user
    privacy = profile_user.profile.privacy_setting
    
    conn_obj = None
    if request.user.is_authenticated and profile_user.is_authenticated and request.user != profile_user:
        conn_obj = CircleConnection.objects.filter(
            (Q(sender=request.user) & Q(receiver=profile_user)) |
            (Q(sender=profile_user) & Q(receiver=request.user))
        ).first()

    conn_status = conn_obj.status if conn_obj else None
    is_my_req = conn_obj.sender == request.user if conn_obj else False
    conn_id = conn_obj.id if conn_obj else None

    # Privacy enforcement
    if not is_owner:
        if privacy == 'PRIVATE':
            return Response({
                'error': 'This profile is private.',
                'privacy_setting': 'PRIVATE'
            }, status=status.HTTP_403_FORBIDDEN)
        elif privacy == 'CONNECTIONS_ONLY' and conn_status != 'ACCEPTED':
            return Response({
                'error': 'This profile is connections-only.',
                'privacy_setting': 'CONNECTIONS_ONLY',
                'connection_status': conn_status,
                'is_my_connection_request': is_my_req,
                'connection_id': conn_id
            }, status=status.HTTP_403_FORBIDDEN)

    profile_data = ProfileSerializer(profile_user.profile, context={'request': request}).data
    profile_data['connection_status'] = conn_status
    profile_data['is_my_connection_request'] = is_my_req
    profile_data['is_connection'] = conn_status == 'ACCEPTED'
    profile_data['connection_id'] = conn_id

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
        'profile': profile_data,
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_conversations(request):
    """GET /api/conversations/ — list conversations for current user."""
    qs = Conversation.objects.filter(participants=request.user).order_by('-created_at').prefetch_related('participants', 'messages', 'messages__sender')
    # Serialize conversations
    serializer = ConversationSerializer(qs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def get_or_create_conversation(request):
    """POST /api/conversations/ — get or create a conversation with a participant."""
    username = request.data.get('username')
    if not username:
        return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if username == request.user.username:
        return Response({'error': 'Cannot start a conversation with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

    other_user = get_object_or_404(User, username=username)

    # Check if conversation already exists with exactly these two participants
    conversations = Conversation.objects.filter(participants=request.user).filter(participants=other_user)
    
    if conversations.exists():
        conv = conversations.first()
    else:
        conv = Conversation.objects.create()
        conv.participants.add(request.user, other_user)

    serializer = ConversationSerializer(conv, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conversation_messages(request, pk):
    """GET /api/conversations/<pk>/messages/ — get message history for conversation."""
    conv = get_object_or_404(Conversation, pk=pk)
    if not conv.participants.filter(id=request.user.id).exists():
        return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

    since = request.query_params.get('since')
    qs = conv.messages.select_related('sender').order_by('created_at')
    if since:
        dt = parse_datetime(since)
        if dt:
            qs = qs.filter(created_at__gt=dt)

    data = DirectMessageSerializer(qs[:100], many=True, context={'request': request}).data
    return Response({'results': data})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@throttle_classes([MessageThrottle])
def send_direct_message(request, pk):
    """POST /api/conversations/<pk>/messages/ — send message in conversation."""
    conv = get_object_or_404(Conversation, pk=pk)
    if not conv.participants.filter(id=request.user.id).exists():
        return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

    # Check daily DM limit
    import datetime
    from django.utils import timezone
    from django.conf import settings
    start_time = timezone.now() - datetime.timedelta(days=1)
    sent_count = DirectMessage.objects.filter(
        sender=request.user,
        created_at__gte=start_time
    ).count()
    if sent_count >= getattr(settings, 'FREE_TIER_DAILY_DM_LIMIT', 30):
        return Response(
            {'error': 'Daily direct message limit reached (30 messages/day).'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    if conv.is_blocked:
        return Response(
            {'error': 'This conversation is blocked and new messages cannot be sent.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    content = (request.data.get('content') or '').strip()
    image = request.data.get('image')

    if not content and not image:
        return Response({'error': 'Message content or image is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        dm = DirectMessage.objects.create(
            conversation=conv,
            sender=request.user,
            content=content,
            image=image
        )
    except Exception as e:
        from django.core.exceptions import ValidationError
        if isinstance(e, ValidationError):
            return Response({'error': str(e.messages[0] if hasattr(e, 'messages') else e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Failed to send message. Ensure the image is valid.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(DirectMessageSerializer(dm, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_block_conversation(request, pk):
    """POST /api/conversations/<pk>/block/ — block or unblock conversation."""
    conv = get_object_or_404(Conversation, pk=pk)
    if not conv.participants.filter(id=request.user.id).exists():
        return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

    if conv.is_blocked:
        # Only the user who blocked can unblock
        if conv.blocked_by != request.user:
            return Response(
                {'error': 'Only the user who initiated the block can unblock the conversation.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        conv.is_blocked = False
        conv.blocked_by = None
        conv.save()
        return Response({'status': 'unblocked'})
    else:
        conv.is_blocked = True
        conv.blocked_by = request.user
        conv.save()
        return Response({'status': 'blocked'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def profile_update(request):
    """POST /api/users/profile/update/ — update current user's profile."""
    profile = request.user.profile
    display_name = request.data.get('display_name')
    bio = request.data.get('bio')
    privacy_setting = request.data.get('privacy_setting')
    profile_image = request.FILES.get('profile_image')
    tags = request.data.get('tags')

    if display_name is not None:
        profile.display_name = display_name
    if bio is not None:
        profile.bio = bio
    if privacy_setting is not None:
        if privacy_setting not in ('PUBLIC', 'CONNECTIONS_ONLY', 'PRIVATE'):
            return Response({'error': 'Invalid privacy setting.'}, status=status.HTTP_400_BAD_REQUEST)
        profile.privacy_setting = privacy_setting
    if profile_image is not None:
        profile.profile_image = profile_image
    if tags is not None:
        profile.tags = tags

    try:
        profile.save()
    except Exception as e:
        from django.core.exceptions import ValidationError
        if isinstance(e, ValidationError):
            return Response({'error': str(e.messages[0] if hasattr(e, 'messages') else e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Failed to save profile. The image may be invalid or corrupted.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    serializer = ProfileSerializer(profile, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_profile_timeline_event(request):
    """POST /api/profiles/timeline/ — add timeline milestone for current user."""
    profile = request.user.profile
    title = request.data.get('title')
    event_date = request.data.get('event_date')
    description = request.data.get('description', '')

    if not title or not event_date:
        return Response({'error': 'Title and Event Date are required.'}, status=status.HTTP_400_BAD_REQUEST)

    ev = ProfileTimelineEvent.objects.create(
        profile=profile,
        title=title,
        event_date=event_date,
        description=description
    )
    return Response(ProfileTimelineEventSerializer(ev).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def delete_profile_timeline_event(request, pk):
    """DELETE or POST /api/profiles/timeline/<pk>/delete/ — delete user timeline event."""
    ev = get_object_or_404(ProfileTimelineEvent, pk=pk)
    if ev.profile != request.user.profile:
        return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
    ev.delete()
    return Response({'status': 'deleted'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_connection(request):
    """POST /api/connections/request/ — send or update Circle Connection request."""
    username = request.data.get('username')
    connection_type = request.data.get('connection_type', 'FRIEND')

    if not username:
        return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if username == request.user.username:
        return Response({'error': 'Cannot connect with yourself.'}, status=status.HTTP_400_BAD_REQUEST)
    if connection_type not in ('FRIEND', 'FAMILY', 'SUPPORTER'):
        return Response({'error': 'Invalid connection type.'}, status=status.HTTP_400_BAD_REQUEST)

    receiver = get_object_or_404(User, username=username)

    # Check if connection already exists
    conn = CircleConnection.objects.filter(
        (Q(sender=request.user) & Q(receiver=receiver)) |
        (Q(sender=receiver) & Q(receiver=request.user))
    ).first()

    if conn:
        if conn.status == 'BLOCKED':
            return Response({'error': 'Connection is blocked.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # If it was PENDING or DECLINED, update it to PENDING with request.user as sender
        if conn.status in ('PENDING', 'DECLINED'):
            conn.sender = request.user
            conn.receiver = receiver
            conn.status = 'PENDING'
            conn.connection_type = connection_type
            conn.save()
        return Response(CircleConnectionSerializer(conn).data)
    else:
        conn = CircleConnection.objects.create(
            sender=request.user,
            receiver=receiver,
            status='PENDING',
            connection_type=connection_type
        )
        return Response(CircleConnectionSerializer(conn).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_connections(request):
    """GET /api/connections/ — list accepted, pending incoming, and pending outgoing connections."""
    conns = CircleConnection.objects.filter(
        Q(sender=request.user) | Q(receiver=request.user)
    )

    accepted = conns.filter(status='ACCEPTED')
    pending_incoming = conns.filter(status='PENDING', receiver=request.user)
    pending_outgoing = conns.filter(status='PENDING', sender=request.user)

    return Response({
        'accepted': CircleConnectionSerializer(accepted, many=True).data,
        'pending_incoming': CircleConnectionSerializer(pending_incoming, many=True).data,
        'pending_outgoing': CircleConnectionSerializer(pending_outgoing, many=True).data,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def respond_connection(request, pk):
    """POST /api/connections/<pk>/respond/ — Accept, Decline, or Block a connection request."""
    conn = get_object_or_404(CircleConnection, pk=pk)
    resp_status = request.data.get('status')

    if resp_status not in ('ACCEPTED', 'DECLINED', 'BLOCKED'):
        return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

    # Only receiver can accept or decline a pending request
    if conn.status == 'PENDING' and conn.receiver != request.user and resp_status != 'BLOCKED':
        return Response({'error': 'Only the receiver can respond to this request.'}, status=status.HTTP_403_FORBIDDEN)

    conn.status = resp_status
    conn.save()
    return Response(CircleConnectionSerializer(conn).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def block_user_directly(request):
    """POST /api/connections/block/ — block user directly by username."""
    username = request.data.get('username')
    if not username:
        return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if username == request.user.username:
        return Response({'error': 'Cannot block yourself.'}, status=status.HTTP_400_BAD_REQUEST)

    target_user = get_object_or_404(User, username=username)

    conn = CircleConnection.objects.filter(
        (Q(sender=request.user) & Q(receiver=target_user)) |
        (Q(sender=target_user) & Q(receiver=request.user))
    ).first()

    if conn:
        conn.status = 'BLOCKED'
        conn.save()
    else:
        conn = CircleConnection.objects.create(
            sender=request.user,
            receiver=target_user,
            status='BLOCKED'
        )

    return Response(CircleConnectionSerializer(conn).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@throttle_classes([ReportThrottle])
def file_report(request):
    """POST /api/reports/ — file a safety report on content/users."""
    target_type = request.data.get('target_type')  # USER, MEMORIAL, MEMORY, TALE, COMMUNITY, MESSAGE
    target_id = request.data.get('target_id')
    reason = request.data.get('reason')
    description = request.data.get('description', '')

    if not target_type or not target_id or not reason:
        return Response({'error': 'target_type, target_id, and reason are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if reason not in ('SPAM', 'HARASSMENT', 'FAKE_ACCOUNT', 'INAPPROPRIATE_CONTENT'):
        return Response({'error': 'Invalid reason.'}, status=status.HTTP_400_BAD_REQUEST)

    from django.contrib.contenttypes.models import ContentType
    from communities.models import Community, CommunityMessage
    from memorials.models import Memorial, Memory, Message as MemorialMessage
    from tales.models import Tale

    type_mapping = {
        'USER': User,
        'MEMORIAL': Memorial,
        'MEMORY': Memory,
        'TALE': Tale,
        'COMMUNITY': Community,
        'MESSAGE': CommunityMessage,
    }

    model_cls = type_mapping.get(target_type.upper())
    if not model_cls:
        if target_type.upper() == 'MEMORIAL_MESSAGE':
            model_cls = MemorialMessage
        else:
            return Response({'error': 'Invalid target type.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        target_obj = model_cls.objects.get(id=int(target_id))
    except (ValueError, TypeError, model_cls.DoesNotExist):
        return Response({'error': 'Target object not found.'}, status=status.HTTP_404_NOT_FOUND)

    ct = ContentType.objects.get_for_model(model_cls)

    report = Report.objects.create(
        reporter=request.user,
        content_type=ct,
        object_id=target_obj.id,
        reason=reason,
        description=description
    )

    return Response({
        'status': 'reported',
        'report_id': report.id
    }, status=status.HTTP_201_CREATED)


