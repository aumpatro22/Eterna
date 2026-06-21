from django.db.models import Max
from django.shortcuts import get_object_or_404

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q

from .models import Tale, Chapter
from .serializers import TaleListSerializer, TaleDetailSerializer, TaleCreateSerializer, ChapterSerializer


class TaleListView(generics.ListAPIView):
    """GET /api/tales/ — list tales with optional search."""
    serializer_class = TaleListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        q = (self.request.query_params.get('q') or '').strip()
        from django.db.models import Count, Q
        qs = Tale.objects.select_related('author').order_by('-created_at')
        qs = qs.annotate(
            chapter_count_annotated=Count('chapters', filter=Q(chapters__published=True))
        )
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_public=True)
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))
        return qs


class TaleDetailView(generics.RetrieveAPIView):
    """GET /api/tales/<slug>/ — tale detail with chapters."""
    serializer_class = TaleDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Tale.objects.select_related('author')

    def get_object(self):
        slug = self.kwargs['slug']
        # Case-insensitive lookup
        tale = Tale.objects.filter(slug__iexact=slug).select_related('author').first()
        if not tale:
            # Fallback: title guess
            title_guess = slug.replace('-', ' ')
            tale = Tale.objects.filter(title__iexact=title_guess).select_related('author').first()
        if not tale:
            from rest_framework.exceptions import NotFound
            raise NotFound("Tale not found.")
        if not tale.is_public and (not self.request.user.is_authenticated or tale.author != self.request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("This tale is private.")
        return tale


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def tale_create(request):
    """POST /api/tales/ — create a tale."""
    serializer = TaleCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    tale = serializer.save(author=request.user)
    result = TaleDetailSerializer(tale, context={'request': request})
    return Response(result.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def tale_delete(request, slug):
    """DELETE /api/tales/<slug>/ — delete (author only)."""
    tale = get_object_or_404(Tale, slug=slug)
    if request.user != tale.author:
        return Response({'error': 'Only the author can delete this tale.'}, status=status.HTTP_403_FORBIDDEN)
    tale.delete()
    return Response({'status': 'deleted'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chapter_create(request, slug):
    """POST /api/tales/<slug>/chapters/ — add a chapter."""
    tale = get_object_or_404(Tale, slug=slug)
    if tale.author != request.user:
        return Response({'error': 'Only the author can add chapters.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ChapterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    ch = serializer.save(tale=tale)
    # If order conflict, append to end
    if Chapter.objects.filter(tale=tale, order=ch.order).exclude(pk=ch.pk).exists():
        max_order = tale.chapters.aggregate(Max('order'))['order__max'] or 0
        ch.order = max_order + 1
        ch.save(update_fields=['order'])

    return Response(ChapterSerializer(ch).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chapter_publish(request, slug, chapter_id):
    """POST /api/tales/<slug>/chapters/<id>/publish/ — publish a chapter."""
    tale = get_object_or_404(Tale, slug=slug)
    if request.user != tale.author:
        return Response({'error': 'Only the author can publish.'}, status=status.HTTP_403_FORBIDDEN)
    ch = get_object_or_404(Chapter, pk=chapter_id, tale=tale)
    if not ch.published:
        ch.published = True
        ch.save(update_fields=['published'])
    return Response(ChapterSerializer(ch).data)
