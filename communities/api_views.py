from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.db.models import Q
from django.conf import settings
from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from users.throttles import MessageThrottle

from .models import Community, Membership, CommunityJoinRequest, CommunityMessage, CommunityBan
from .serializers import (
    CommunityListSerializer,
    CommunityDetailSerializer,
    CommunityCreateSerializer,
    CommunityMessageSerializer,
    MembershipSerializer,
    CommunityJoinRequestSerializer,
)


def get_user_role(community, user):
    if not user or not user.is_authenticated:
        return None
    mem = Membership.objects.filter(community=community, user=user).first()
    return mem.role if mem else None


class CommunityListView(generics.ListAPIView):
    """GET /api/communities/ — list communities.
    Public communities are visible to everyone.
    Private communities are visible only to members.
    """
    serializer_class = CommunityListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        q = (self.request.query_params.get('q') or '').strip()
        
        # Base filter: visible communities
        if user.is_authenticated:
            # User can see public communities, or private ones where they are a member
            member_community_ids = Membership.objects.filter(user=user).values_list('community_id', flat=True)
            qs = Community.objects.filter(
                Q(community_type='PUBLIC') | Q(id__in=member_community_ids)
            )
        else:
            # Anonymous users can only see public communities
            qs = Community.objects.filter(community_type='PUBLIC')

        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))
            
        from django.db.models import Count
        return qs.select_related('owner').order_by('-created_at').annotate(
            member_count_annotated=Count('memberships')
        )


class CommunityDetailView(generics.RetrieveAPIView):
    """GET /api/communities/<slug>/ — detail view with membership state."""
    serializer_class = CommunityDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    from django.db.models import Count
    queryset = Community.objects.select_related('owner').annotate(
        member_count_annotated=Count('memberships')
    )

    def retrieve(self, request, *args, **kwargs):
        community = self.get_object()
        user = request.user

        role = get_user_role(community, user)
        is_member = role is not None
        is_owner = role == 'ADMIN'
        is_admin = role in ('ADMIN', 'CO_ADMIN')

        # Check if user has pending join request or invite
        has_pending_request = False
        has_pending_invite = False
        if user.is_authenticated and not is_member:
            has_pending_request = CommunityJoinRequest.objects.filter(
                community=community, user=user, status='PENDING', is_invite=False
            ).exists()
            has_pending_invite = CommunityJoinRequest.objects.filter(
                community=community, user=user, status='PENDING', is_invite=True
            ).exists()

        # Enforce private community visibility check
        # A private community is accessible only to members or pending invitees (to allow them to view it to accept)
        if community.community_type == 'PRIVATE':
            if not is_member and not has_pending_invite:
                return Response({'error': 'This community is private.'}, status=status.HTTP_403_FORBIDDEN)

        data = self.get_serializer(community).data
        data['is_member'] = is_member
        data['is_owner'] = is_owner
        data['is_admin'] = is_admin
        data['my_role'] = role
        data['has_pending_request'] = has_pending_request
        data['has_pending_invite'] = has_pending_invite

        return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def community_create(request):
    """POST /api/communities/ — create a community."""
    serializer = CommunityCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    community = serializer.save(owner=request.user)
    # Creator is automatically the single ADMIN
    Membership.objects.create(community=community, user=request.user, role='ADMIN')
    
    result = CommunityDetailSerializer(community)
    return Response(result.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def archive_community(request, slug):
    """POST /api/communities/<slug>/archive/ — archive community (ADMIN only)."""
    community = get_object_or_404(Community, slug=slug)
    if get_user_role(community, request.user) != 'ADMIN':
        return Response({'error': 'Only the ADMIN can archive this community.'}, status=status.HTTP_403_FORBIDDEN)
    
    community.is_archived = True
    community.save()
    return Response({'status': 'archived'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_community(request, slug):
    """POST /api/communities/<slug>/join/ — request access (PUBLIC only)."""
    community = get_object_or_404(Community, slug=slug)
    
    if CommunityBan.objects.filter(community=community, user=request.user).exists():
        return Response({'error': 'You are banned from this community.'}, status=status.HTTP_403_FORBIDDEN)
        
    if community.community_type == 'PRIVATE':
        return Response({'error': 'Private communities are invitation only.'}, status=status.HTTP_403_FORBIDDEN)

    role = get_user_role(community, request.user)
    if role:
        return Response({'status': 'already_member'})

    # For PUBLIC communities, request to join (requires approval)
    if community.community_type == 'PUBLIC':
        join_req, created = CommunityJoinRequest.objects.get_or_create(
            community=community,
            user=request.user,
            is_invite=False,
            defaults={'status': 'PENDING'}
        )
        if not created and join_req.status != 'PENDING':
            join_req.status = 'PENDING'
            join_req.save()
            
        return Response({'status': 'request_sent'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def invite_member(request, slug):
    """POST /api/communities/<slug>/invite/ — invite user (ADMIN or CO_ADMIN)."""
    community = get_object_or_404(Community, slug=slug)
    role = get_user_role(community, request.user)
    if role not in ('ADMIN', 'CO_ADMIN'):
        return Response({'error': 'Only moderators can invite members.'}, status=status.HTTP_403_FORBIDDEN)

    username = request.data.get('username')
    if not username:
        return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

    target_user = get_object_or_404(User, username=username)
    
    if CommunityBan.objects.filter(community=community, user=target_user).exists():
        return Response({'error': 'This user is banned from this community.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if Membership.objects.filter(community=community, user=target_user).exists():
        return Response({'error': 'User is already a member.'}, status=status.HTTP_400_BAD_REQUEST)

    invite_req, created = CommunityJoinRequest.objects.get_or_create(
        community=community,
        user=target_user,
        is_invite=True,
        defaults={'status': 'PENDING'}
    )

    if not created and invite_req.status == 'REJECTED':
        invite_req.status = 'PENDING'
        invite_req.save()

    return Response({'status': 'invite_sent', 'request_id': invite_req.id})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_join_requests(request, slug):
    """GET /api/communities/<slug>/requests/ — list pending requests (ADMIN or CO_ADMIN)."""
    community = get_object_or_404(Community, slug=slug)
    role = get_user_role(community, request.user)
    if role not in ('ADMIN', 'CO_ADMIN'):
        return Response({'error': 'Only moderators can view requests.'}, status=status.HTTP_403_FORBIDDEN)

    reqs = CommunityJoinRequest.objects.filter(community=community, status='PENDING', is_invite=False).select_related('user')
    serializer = CommunityJoinRequestSerializer(reqs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def respond_join_request(request, pk):
    """POST /api/communities/requests/<pk>/respond/ — Approve/Reject join request or invitation."""
    join_req = get_object_or_404(CommunityJoinRequest, pk=pk)
    community = join_req.community
    user = request.user
    
    resp_status = request.data.get('status')
    if resp_status not in ('APPROVED', 'REJECTED'):
        return Response({'error': 'Status must be APPROVED or REJECTED.'}, status=status.HTTP_400_BAD_REQUEST)

    if join_req.is_invite:
        # Invitation: only the target user can accept/decline
        if join_req.user != user:
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
    else:
        # Request to join: only ADMIN or CO_ADMIN can approve/reject
        role = get_user_role(community, user)
        if role not in ('ADMIN', 'CO_ADMIN'):
            return Response({'error': 'Only moderators can respond to requests.'}, status=status.HTTP_403_FORBIDDEN)

    join_req.status = resp_status
    join_req.save()

    if resp_status == 'APPROVED':
        Membership.objects.get_or_create(
            community=community,
            user=join_req.user,
            defaults={'role': 'MEMBER'}
        )
        if not join_req.is_invite:
            from notifications.services import NotificationService
            NotificationService.notify(
                user=join_req.user,
                title="Join Request Approved",
                message=f"Your request to join the community '{community.title}' has been approved."
            )

    return Response({'status': resp_status})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@throttle_classes([MessageThrottle])
def post_message(request, slug):
    """POST /api/communities/<slug>/post/ — post message to community chat."""
    community = get_object_or_404(Community, slug=slug)
    
    if community.is_archived:
        return Response({'error': 'This community is archived. Writing is disabled.'}, status=status.HTTP_400_BAD_REQUEST)

    role = get_user_role(community, request.user)
    if not role:
        return Response({'error': 'You must be a member to post.'}, status=status.HTTP_403_FORBIDDEN)

    # Check daily community post limit
    import datetime
    from django.utils import timezone
    from django.conf import settings
    start_time = timezone.now() - datetime.timedelta(days=1)
    posts_count = CommunityMessage.objects.filter(
        author=request.user,
        created_at__gte=start_time
    ).count()
    if posts_count >= getattr(settings, 'FREE_TIER_DAILY_COMMUNITY_LIMIT', 30):
        return Response(
            {'error': 'Daily community post limit reached (30 posts/day).'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = CommunityMessageSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer.save(community=community, author=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def messages_feed(request, slug):
    """GET /api/communities/<slug>/feed/ — get chat message history (members only)."""
    community = get_object_or_404(Community, slug=slug)
    user = request.user

    role = get_user_role(community, user)
    is_member = role is not None

    # Only members of the community can view the chat feed
    if not is_member:
        return Response({'error': 'Access denied. You must join this community to view the chat.'}, status=status.HTTP_403_FORBIDDEN)

    since = request.query_params.get('since')
    qs = community.messages.select_related('author').order_by('created_at')
    
    if since:
        dt = parse_datetime(since)
        if dt:
            qs = qs.filter(created_at__gt=dt)

    # Cap messages at 100
    data = CommunityMessageSerializer(qs[:100], many=True).data
    return Response({'results': data})


@api_view(['DELETE', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def delete_message(request, pk):
    """DELETE or POST /api/communities/messages/<pk>/delete/ — soft delete message (author or moderators)."""
    msg = get_object_or_404(CommunityMessage, pk=pk)
    community = msg.community
    role = get_user_role(community, request.user)
    
    is_author = msg.author == request.user
    is_moderator = role in ('ADMIN', 'CO_ADMIN')

    if not is_author and not is_moderator:
        return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    msg.is_deleted = True
    msg.deleted_by = request.user
    msg.save()

    return Response({'status': 'deleted'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_members(request, slug):
    """GET /api/communities/<slug>/members/ — list members of a community."""
    community = get_object_or_404(Community, slug=slug)
    role = get_user_role(community, request.user)
    
    if community.community_type == 'PRIVATE' and not role:
        return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

    mems = community.memberships.select_related('user').order_by('joined_at')
    serializer = MembershipSerializer(mems, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_member_role(request, slug, username):
    """POST /api/communities/<slug>/members/<username>/role/ — assign/remove co-admin role (ADMIN only)."""
    community = get_object_or_404(Community, slug=slug)
    if get_user_role(community, request.user) != 'ADMIN':
        return Response({'error': 'Only the ADMIN can manage member roles.'}, status=status.HTTP_403_FORBIDDEN)

    target_user = get_object_or_404(User, username=username)
    membership = get_object_or_404(Membership, community=community, user=target_user)

    new_role = request.data.get('role')
    if new_role not in ('CO_ADMIN', 'MEMBER'):
        return Response({'error': 'Role must be CO_ADMIN or MEMBER.'}, status=status.HTTP_400_BAD_REQUEST)

    if new_role == 'CO_ADMIN':
        # Check settings.MAX_COMMUNITY_COADMINS limit
        max_coadmins = getattr(settings, 'MAX_COMMUNITY_COADMINS', 3)
        current_coadmins = Membership.objects.filter(community=community, role='CO_ADMIN').count()
        if current_coadmins >= max_coadmins:
            return Response({'error': f'Maximum limit of {max_coadmins} co-admins has been reached.'}, status=status.HTTP_400_BAD_REQUEST)

    # Admin cannot lose ADMIN role here (target_user is not ADMIN since admin is owner and unique)
    if membership.role == 'ADMIN':
        return Response({'error': 'The ADMIN role cannot be modified.'}, status=status.HTTP_400_BAD_REQUEST)

    membership.role = new_role
    membership.save()

    return Response(MembershipSerializer(membership).data)


@api_view(['DELETE', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def remove_member(request, slug, username):
    """DELETE/POST /api/communities/<slug>/members/<username>/remove/ — remove member."""
    community = get_object_or_404(Community, slug=slug)
    actor_role = get_user_role(community, request.user)
    
    if actor_role not in ('ADMIN', 'CO_ADMIN'):
        return Response({'error': 'Only moderators can remove members.'}, status=status.HTTP_403_FORBIDDEN)

    target_user = get_object_or_404(User, username=username)
    membership = get_object_or_404(Membership, community=community, user=target_user)

    # ADMIN cannot be removed
    if membership.role == 'ADMIN':
        return Response({'error': 'The ADMIN cannot be removed.'}, status=status.HTTP_400_BAD_REQUEST)

    # CO_ADMIN can only remove regular MEMBERs
    if actor_role == 'CO_ADMIN' and membership.role in ('ADMIN', 'CO_ADMIN'):
        return Response({'error': 'Co-admins can only remove regular members.'}, status=status.HTTP_403_FORBIDDEN)

    membership.delete()
    return Response({'status': 'removed'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_community(request, slug):
    """POST /api/communities/<slug>/leave/ — leave community (non-ADMINs only)."""
    community = get_object_or_404(Community, slug=slug)
    # ADMIN cannot leave (they must delete/archive or transfer ownership first)
    mems = Membership.objects.filter(community=community, user=request.user)
    if mems.filter(role='ADMIN').exists():
        return Response({'error': 'The ADMIN cannot leave the community. Archive instead.'}, status=status.HTTP_400_BAD_REQUEST)
        
    mems.delete()
    return Response({'status': 'left'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ban_user(request, slug, username):
    """POST /api/communities/<slug>/ban/<username>/ — ban a user from the community."""
    community = get_object_or_404(Community, slug=slug)
    role = get_user_role(community, request.user)
    if role not in ('ADMIN', 'CO_ADMIN'):
        return Response({'error': 'Only moderators can ban users.'}, status=status.HTTP_403_FORBIDDEN)
    
    target_user = get_object_or_404(User, username=username)
    if target_user == community.owner:
        return Response({'error': 'Cannot ban the community owner.'}, status=status.HTTP_400_BAD_REQUEST)
    
    target_role = get_user_role(community, target_user)
    if role == 'CO_ADMIN' and target_role in ('ADMIN', 'CO_ADMIN'):
        return Response({'error': 'Co-admins cannot ban other moderators.'}, status=status.HTTP_403_FORBIDDEN)
    
    reason = request.data.get('reason', '')
    
    ban, created = CommunityBan.objects.get_or_create(
        community=community,
        user=target_user,
        defaults={'banned_by': request.user, 'reason': reason}
    )
    
    Membership.objects.filter(community=community, user=target_user).delete()
    CommunityJoinRequest.objects.filter(community=community, user=target_user).delete()
    
    return Response({'status': 'banned'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unban_user(request, slug, username):
    """POST /api/communities/<slug>/unban/<username>/ — unban a user."""
    community = get_object_or_404(Community, slug=slug)
    role = get_user_role(community, request.user)
    if role not in ('ADMIN', 'CO_ADMIN'):
        return Response({'error': 'Only moderators can unban users.'}, status=status.HTTP_403_FORBIDDEN)
    
    target_user = get_object_or_404(User, username=username)
    CommunityBan.objects.filter(community=community, user=target_user).delete()
    
    return Response({'status': 'unbanned'})

