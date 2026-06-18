from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.db.models import Q

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Community, Channel, Membership, CommunityMessage
from .serializers import (
    CommunityListSerializer,
    CommunityDetailSerializer,
    CommunityCreateSerializer,
    ChannelSerializer,
    CommunityMessageSerializer,
    MembershipSerializer,
)


class CommunityListView(generics.ListAPIView):
    """GET /api/communities/ — list communities with search."""
    serializer_class = CommunityListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        q = (self.request.query_params.get('q') or '').strip()
        qs = Community.objects.select_related('owner').order_by('-created_at')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_public=True)
        return qs


class CommunityDetailView(generics.RetrieveAPIView):
    """GET /api/communities/<slug>/ — detail with channels and membership info."""
    serializer_class = CommunityDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    queryset = Community.objects.select_related('owner')

    def retrieve(self, request, *args, **kwargs):
        community = self.get_object()

        # Membership info
        mem = None
        if request.user.is_authenticated:
            mem = Membership.objects.filter(community=community, user=request.user).first()
        is_member = bool(mem)
        is_owner = bool(mem and mem.role == 'owner')
        is_admin = bool(mem and mem.role in ('owner', 'admin'))

        if not community.is_public and not is_member:
            return Response({'error': 'This community is private.'}, status=status.HTTP_403_FORBIDDEN)

        data = self.get_serializer(community).data
        data['is_member'] = is_member
        data['is_owner'] = is_owner
        data['is_admin'] = is_admin
        data['my_role'] = mem.role if mem else None

        return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def community_create(request):
    """POST /api/communities/ — create a community."""
    serializer = CommunityCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    community = serializer.save(owner=request.user)
    Membership.objects.create(community=community, user=request.user, role='owner')
    Channel.objects.create(community=community, name='general', is_public=True)
    result = CommunityDetailSerializer(community)
    return Response(result.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_community(request, slug):
    """POST /api/communities/<slug>/join/ — join."""
    community = get_object_or_404(Community, slug=slug)
    Membership.objects.get_or_create(community=community, user=request.user, defaults={'role': 'member'})
    return Response({'status': 'joined'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_community(request, slug):
    """POST /api/communities/<slug>/leave/ — leave (non-owners only)."""
    community = get_object_or_404(Community, slug=slug)
    Membership.objects.filter(community=community, user=request.user).exclude(role='owner').delete()
    return Response({'status': 'left'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def channel_create(request, slug):
    """POST /api/communities/<slug>/channels/ — create channel (admin/owner)."""
    community = get_object_or_404(Community, slug=slug)
    mem = Membership.objects.filter(community=community, user=request.user).first()
    if not mem or mem.role not in ('owner', 'admin'):
        return Response({'error': 'Only admins can create channels.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ChannelSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save(community=community)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def post_message(request, slug, channel_slug):
    """POST /api/communities/<slug>/c/<channel_slug>/post/ — post message."""
    community = get_object_or_404(Community, slug=slug)
    channel = get_object_or_404(Channel, community=community, slug=channel_slug)
    if not Membership.objects.filter(community=community, user=request.user).exists():
        return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)

    serializer = CommunityMessageSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save(channel=channel, author=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def messages_feed(request, slug, channel_slug):
    """GET /api/communities/<slug>/c/<channel_slug>/feed/?since= — polling feed."""
    community = get_object_or_404(Community, slug=slug)
    channel = get_object_or_404(Channel, community=community, slug=channel_slug)

    is_member = request.user.is_authenticated and Membership.objects.filter(
        community=community, user=request.user).exists()
    if not (community.is_public or is_member):
        return Response({'results': []}, status=status.HTTP_403_FORBIDDEN)

    since = request.query_params.get('since')
    qs = channel.messages.select_related('author').order_by('created_at')
    if since:
        dt = parse_datetime(since)
        if dt:
            qs = qs.filter(created_at__gt=dt)

    data = CommunityMessageSerializer(qs[:50], many=True).data
    return Response({'results': data})
