import logging
import requests as http_requests

from django.conf import settings
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import AnonRateThrottle
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from .models import (
    Memorial, Message, Candle, MemorialPhoto, TimelineEvent,
    Memory, ExperienceTag, Contributor, ContributorInvitation
)
from .serializers import (
    MemorialListSerializer,
    MemorialDetailSerializer,
    MemorialCreateSerializer,
    MessageSerializer,
    CandleSerializer,
    MemorialPhotoSerializer,
    TimelineEventSerializer,
    ExperienceTagSerializer,
    MemorySerializer,
    ContributorSerializer,
    ContributorInvitationSerializer,
)
from .services import GroqService, AIHordeService

logger = logging.getLogger(__name__)


class MemorialPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 24


class MemorialListView(generics.ListAPIView):
    """GET /api/memorials/ — paginated list with search, visibility filter."""
    serializer_class = MemorialListSerializer
    pagination_class = MemorialPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # Show public memorials, owned memorials, or contributor memorials
            try:
                from .models import Contributor
                contrib_ids = Contributor.objects.filter(user=user).values_list('memorial_id', flat=True)
                qs = Memorial.objects.filter(
                    Q(visibility='PUBLIC') | Q(owner=user) | Q(id__in=contrib_ids)
                )
            except Exception as e:
                logger.warning("Error filtering memorials by contributor status: %s", e)
                qs = Memorial.objects.filter(Q(visibility='PUBLIC') | Q(owner=user))
        else:
            qs = Memorial.objects.filter(visibility='PUBLIC')

        from django.db.models import Count
        qs = qs.select_related('owner').prefetch_related('tags').order_by('-created_at')
        qs = qs.annotate(
            candle_count_annotated=Count('candles', distinct=True),
            message_count_annotated=Count('messages', distinct=True)
        )
        
        search = (self.request.query_params.get('search') or '').strip()
        owner_id = (self.request.query_params.get('owner') or '').strip()

        if owner_id.isdigit():
            qs = qs.filter(owner__id=int(owner_id))
        if search:
            qs = qs.filter(
                Q(public_id__iexact=search) |
                Q(full_name__icontains=search) |
                Q(biography__icontains=search) |
                Q(tribute__icontains=search) |
                Q(owner__username__icontains=search) |
                Q(owner__first_name__icontains=search) |
                Q(owner__last_name__icontains=search)
            )
        return qs


class MemorialDetailView(generics.RetrieveAPIView):
    """GET /api/memorials/<pk>/ — full detail with visibility check."""
    # ⚡ Bolt: Fixed N+1 query issue by prefetching related objects
    # This prevents additional database queries when serializing memories, tags, messages, candles, photos, and timeline events
    queryset = Memorial.objects.select_related('owner').prefetch_related('memories__author', 'tags', 'messages', 'candles', 'photos', 'timeline_events')
    serializer_class = MemorialDetailSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj.visibility == 'PUBLIC':
            return obj
        if user.is_authenticated:
            if obj.owner == user:
                return obj
            try:
                from .models import Contributor
                if Contributor.objects.filter(memorial=obj, user=user).exists():
                    return obj
            except Exception as e:
                logger.warning("Error checking contributor status in MemorialDetailView: %s", e)
        raise PermissionDenied("This memorial is private.")


class MemorialByPublicIdView(generics.RetrieveAPIView):
    """GET /api/memorials/by-id/<public_id>/ — detail by public ID."""
    serializer_class = MemorialDetailSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        pid = self.kwargs['public_id']
        # ⚡ Bolt: Fixed N+1 query issue by prefetching related objects
        # This prevents additional database queries when serializing memories, tags, messages, candles, photos, and timeline events
        obj = get_object_or_404(Memorial.objects.select_related('owner').prefetch_related('memories__author', 'tags', 'messages', 'candles', 'photos', 'timeline_events'), public_id=pid)
        user = self.request.user
        if obj.visibility == 'PUBLIC':
            return obj
        if user.is_authenticated:
            if obj.owner == user:
                return obj
            try:
                from .models import Contributor
                if Contributor.objects.filter(memorial=obj, user=user).exists():
                    return obj
            except Exception as e:
                logger.warning("Error checking contributor status in MemorialByPublicIdView: %s", e)
        raise PermissionDenied("This memorial is private.")


def _save_image_from_url(memorial, url, filename_prefix='ai_memorial'):
    """Download and save a remote image to a memorial."""
    try:
        resp = http_requests.get(url, timeout=20, stream=True)
        resp.raise_for_status()
        ctype = resp.headers.get('Content-Type', '')
        if 'image' not in ctype:
            return False, f"Non-image content received ({ctype or 'unknown type'})"
        ext = 'png'
        if 'jpeg' in ctype or 'jpg' in ctype:
            ext = 'jpg'
        elif 'webp' in ctype:
            ext = 'webp'
        image_name = f"{filename_prefix}_{memorial.full_name.replace(' ', '_')}.{ext}"
        memorial.profile_image.save(image_name, ContentFile(resp.content), save=False)
        memorial.is_ai_generated_image = True
        return True, None
    except Exception as e:
        logger.exception("Failed to download AI image from %s: %s", url, e)
        return False, str(e)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def memorial_create(request):
    """POST /api/memorials/ — create a memorial."""
    existing_count = Memorial.objects.filter(owner=request.user).count()
    if existing_count >= 1:
        return Response(
            {'error': 'Free tier users are limited to 1 memorial.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = MemorialCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    memorial = Memorial(
        owner=request.user,
        full_name=data['full_name'],
        birth_date=data.get('birth_date'),
        passing_date=data.get('passing_date'),
        biography=data.get('biography', ''),
        tribute=data.get('tribute', ''),
        visibility=data.get('visibility', 'PUBLIC'),
    )

    # Handle uploaded images
    if 'profile_image' in request.FILES:
        memorial.profile_image = request.FILES['profile_image']
    if 'cover_image' in request.FILES:
        memorial.cover_image = request.FILES['cover_image']

    # AI image generation
    if data.get('use_ai_image'):
        prompt = (data.get('image_prompt') or '').strip()
        if prompt and getattr(settings, 'AI_HORDE_API_KEY', ''):
            try:
                image_payload = AIHordeService.generate_memorial_image(prompt)
                if image_payload:
                    if isinstance(image_payload, (bytes, bytearray)):
                        image_name = f"ai_memorial_{memorial.full_name.replace(' ', '_')}.png"
                        memorial.profile_image.save(image_name, ContentFile(image_payload), save=False)
                        memorial.is_ai_generated_image = True
                    elif isinstance(image_payload, str) and image_payload.startswith('http'):
                        _save_image_from_url(memorial, image_payload)
            except Exception as e:
                logger.exception("AI image generation failed: %s", e)

    # AI tribute generation
    if data.get('generate_tribute') and data.get('memories'):
        tribute = GroqService.generate_tribute(
            data['full_name'],
            data.get('relationship', ''),
            data['memories']
        )
        memorial.tribute = tribute

    memorial.save()

    result = MemorialDetailSerializer(memorial, context={'request': request})
    return Response(result.data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def memorial_update(request, pk):
    """PUT/PATCH /api/memorials/<pk>/ — update (owner only)."""
    memorial = get_object_or_404(Memorial, pk=pk, owner=request.user)
    serializer = MemorialCreateSerializer(memorial, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Pop extra non-model fields
    validated = serializer.validated_data
    for key in ('use_ai_image', 'image_prompt', 'generate_tribute', 'relationship', 'memories'):
        validated.pop(key, None)

    for attr, value in validated.items():
        setattr(memorial, attr, value)

    if 'profile_image' in request.FILES:
        memorial.profile_image = request.FILES['profile_image']
    if 'cover_image' in request.FILES:
        memorial.cover_image = request.FILES['cover_image']

    memorial.save()
    result = MemorialDetailSerializer(memorial, context={'request': request})
    return Response(result.data)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def memorial_delete(request, pk):
    """DELETE /api/memorials/<pk>/ — delete (owner only)."""
    memorial = get_object_or_404(Memorial, pk=pk, owner=request.user)
    memorial.delete()
    return Response({'status': 'deleted'}, status=status.HTTP_204_NO_CONTENT)


def check_memorial_access(memorial, user):
    if memorial.visibility == 'PUBLIC':
        return True
    if user.is_authenticated:
        if memorial.owner == user:
            return True
        try:
            from .models import Contributor
            if Contributor.objects.filter(memorial=memorial, user=user).exists():
                return True
        except Exception as e:
            logger.warning("Error checking contributor status in check_memorial_access: %s", e)
    return False


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AnonRateThrottle])
def add_message(request, pk):
    """POST /api/memorials/<pk>/messages/ — leave a message."""
    memorial = get_object_or_404(Memorial, pk=pk)
    if not check_memorial_access(memorial, request.user):
        raise PermissionDenied("This memorial is private.")
        
    data = request.data.copy()
    if request.user.is_authenticated:
        if not data.get('author_name'):
            # Use display_name if exists, else username
            try:
                display_name = request.user.profile.display_name
                data['author_name'] = display_name if display_name else request.user.username
            except Exception as e:
                logger.warning("Error retrieving user profile for author_name: %s", e)
                data['author_name'] = request.user.username
        if not data.get('author_email'):
            data['author_email'] = request.user.email

    serializer = MessageSerializer(data=data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save(memorial=memorial)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AnonRateThrottle])
def light_candle(request, pk):
    """POST /api/memorials/<pk>/candles/ — light a candle."""
    memorial = get_object_or_404(Memorial, pk=pk)
    if not check_memorial_access(memorial, request.user):
        raise PermissionDenied("This memorial is private.")
        
    serializer = CandleSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save(memorial=memorial)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_memorial_photo(request, pk):
    """POST /api/memorials/<pk>/photos/ — upload a photo."""
    memorial = get_object_or_404(Memorial, pk=pk)
    is_contributor = False
    try:
        from .models import Contributor
        is_contributor = Contributor.objects.filter(memorial=memorial, user=request.user).exists()
    except Exception as e:
        logger.warning("Error checking contributor status in add_memorial_photo: %s", e)

    if memorial.owner != request.user and not is_contributor:
        return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    if 'image' not in request.FILES:
        return Response({'detail': 'No image file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

    photo = MemorialPhoto.objects.create(
        memorial=memorial,
        image=request.FILES['image'],
        caption=request.data.get('caption', '')
    )
    serializer = MemorialPhotoSerializer(photo, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_timeline_event(request, pk):
    """POST /api/memorials/<pk>/timeline/ — add timeline event."""
    memorial = get_object_or_404(Memorial, pk=pk)
    is_contributor = False
    try:
        from .models import Contributor
        is_contributor = Contributor.objects.filter(
            memorial=memorial, user=request.user, role__in=['OWNER', 'FAMILY_MEMBER', 'EDITOR']
        ).exists()
    except Exception as e:
        logger.warning("Error checking contributor status in add_timeline_event: %s", e)

    if memorial.owner != request.user and not is_contributor:
        return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    event_date = request.data.get('event_date')
    title = request.data.get('title')
    if not event_date or not title:
        return Response({'detail': 'event_date and title are required.'}, status=status.HTTP_400_BAD_REQUEST)

    event = TimelineEvent(
        memorial=memorial,
        event_date=event_date,
        title=title,
        description=request.data.get('description', '')
    )
    if 'image' in request.FILES:
        event.image = request.FILES['image']
    event.save()

    serializer = TimelineEventSerializer(event, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
def memorial_memories(request, pk):
    """GET /api/memorials/<pk>/memories/ — list memories.
    POST /api/memorials/<pk>/memories/ — add a memory.
    """
    memorial = get_object_or_404(Memorial, pk=pk)
    user = request.user
    
    # Check if user can view this memorial (privacy)
    if memorial.visibility != 'PUBLIC':
        if not user.is_authenticated:
            raise PermissionDenied("This memorial is private.")
        if memorial.owner != user:
            is_contributor = False
            try:
                from .models import Contributor
                is_contributor = Contributor.objects.filter(memorial=memorial, user=user).exists()
            except Exception as e:
                logger.warning("Error checking contributor status in memorial_memories (privacy check): %s", e)
            if not is_contributor:
                raise PermissionDenied("This memorial is private.")

    if request.method == 'GET':
        if user.is_authenticated:
            is_owner_or_contributor = (memorial.owner == user)
            if not is_owner_or_contributor:
                try:
                    from .models import Contributor
                    is_owner_or_contributor = Contributor.objects.filter(memorial=memorial, user=user).exists()
                except Exception as e:
                    logger.warning("Error checking contributor status in memorial_memories (GET): %s", e)

            if is_owner_or_contributor:
                qs = memorial.memories.all()
            else:
                qs = memorial.memories.filter(visibility__in=['PUBLIC', 'FAMILY_ONLY'])
        else:
            qs = memorial.memories.filter(visibility='PUBLIC')

        serializer = MemorySerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        if not user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        is_owner_or_contributor = (memorial.owner == user)
        if not is_owner_or_contributor:
            try:
                from .models import Contributor
                is_owner_or_contributor = Contributor.objects.filter(memorial=memorial, user=user).exists()
            except Exception as e:
                logger.warning("Error checking contributor status in memorial_memories (POST): %s", e)
        if not is_owner_or_contributor:
            return Response({'detail': 'Only owner and contributors can add memories.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = MemorySerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        memory = serializer.save(memorial=memorial, author=user)
        if 'image' in request.FILES:
            memory.image = request.FILES['image']
        if 'voice_note' in request.FILES:
            memory.voice_note = request.FILES['voice_note']
        memory.save()

        return Response(MemorySerializer(memory, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def list_tags(request):
    """GET /api/memorials/tags/ — list all experience tags."""
    tags = ExperienceTag.objects.all()
    serializer = ExperienceTagSerializer(tags, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_contributors(request, pk):
    """GET /api/memorials/<pk>/contributors/ — list all contributors."""
    memorial = get_object_or_404(Memorial, pk=pk)
    user = request.user
    if memorial.visibility != 'PUBLIC' and memorial.owner != user:
        is_contributor = Contributor.objects.filter(memorial=memorial, user=user).exists()
        if not is_contributor:
            raise PermissionDenied("Not authorized to view contributors.")

    contributors = Contributor.objects.filter(memorial=memorial).select_related('user')
    serializer = ContributorSerializer(contributors, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def invite_contributor(request, pk):
    """POST /api/memorials/<pk>/contributors/invite/ — invite a contributor."""
    memorial = get_object_or_404(Memorial, pk=pk, owner=request.user)
    username = request.data.get('username')
    role = request.data.get('role', 'FAMILY_MEMBER')

    if not username:
        return Response({'detail': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        invited_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'detail': f"User with username '{username}' does not exist."}, status=status.HTTP_404_NOT_FOUND)

    if Contributor.objects.filter(memorial=memorial, user=invited_user).exists():
        return Response({'detail': 'User is already a contributor.'}, status=status.HTTP_400_BAD_REQUEST)

    invitation, created = ContributorInvitation.objects.update_or_create(
        memorial=memorial,
        invited_user=invited_user,
        defaults={'status': 'PENDING', 'role': role}
    )

    if created:
        from notifications.services import NotificationService
        NotificationService.notify(
            user=invited_user,
            title="Contributor Invitation",
            message=f"You have been invited by {request.user.username} to contribute to the memorial '{memorial.full_name}'."
        )

    serializer = ContributorInvitationSerializer(invitation, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_invitations(request):
    """GET /api/invitations/ — list pending invitations for the logged-in user."""
    invitations = ContributorInvitation.objects.filter(invited_user=request.user, status='PENDING').select_related('memorial', 'invited_user')
    serializer = ContributorInvitationSerializer(invitations, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def respond_invitation(request, pk):
    """POST /api/invitations/<pk>/respond/ — accept/decline an invitation."""
    invitation = get_object_or_404(ContributorInvitation, pk=pk, invited_user=request.user, status='PENDING')
    response_status = request.data.get('status')

    if response_status not in ['ACCEPTED', 'DECLINED']:
        return Response({'detail': 'Status must be ACCEPTED or DECLINED.'}, status=status.HTTP_400_BAD_REQUEST)

    invitation.status = response_status
    invitation.save()

    if response_status == 'ACCEPTED':
        Contributor.objects.update_or_create(
            memorial=invitation.memorial,
            user=request.user,
            defaults={'role': invitation.role}
        )
        from notifications.services import NotificationService
        NotificationService.notify(
            user=invitation.memorial.owner,
            title="Invitation Accepted",
            message=f"{request.user.username} has accepted your invitation to contribute to the memorial '{invitation.memorial.full_name}'."
        )

    return Response({'status': response_status})


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_timeline_event(request, pk):
    event = get_object_or_404(TimelineEvent, pk=pk)
    memorial = event.memorial
    user = request.user

    is_contributor = False
    try:
        from .models import Contributor
        is_contributor = Contributor.objects.filter(memorial=memorial, user=user).exists()
    except Exception as e:
        logger.warning("Error checking contributor status in delete_timeline_event: %s", e)

    if memorial.owner != user and not is_contributor:
        return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    event.delete()
    return Response({'status': 'deleted'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_memory(request, pk):
    memory = get_object_or_404(Memory, pk=pk)
    memorial = memory.memorial
    user = request.user

    if memorial.owner != user and memory.author != user:
        return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    memory.delete()
    return Response({'status': 'deleted'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_message(request, pk):
    message = get_object_or_404(Message, pk=pk)
    memorial = message.memorial
    user = request.user

    is_contributor = False
    try:
        from .models import Contributor
        is_contributor = Contributor.objects.filter(memorial=memorial, user=user).exists()
    except Exception as e:
        logger.warning("Error checking contributor status in delete_message: %s", e)

    if memorial.owner != user and not is_contributor:
        return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    message.delete()
    return Response({'status': 'deleted'}, status=status.HTTP_200_OK)
