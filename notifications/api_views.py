from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Notification
from .serializers import NotificationSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_notifications(request):
    """GET /api/notifications/ — list notifications for current user."""
    qs = Notification.objects.filter(user=request.user).order_by('-created_at')
    # Limit to last 50 notifications
    serializer = NotificationSerializer(qs[:50], many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_as_read(request, pk):
    """POST /api/notifications/<pk>/read/ — mark notification as read."""
    notification = get_object_or_404(Notification, pk=pk, user=request.user)
    notification.is_read = True
    notification.save(update_fields=['is_read'])
    return Response({'status': 'read'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_as_read(request):
    """POST /api/notifications/read-all/ — mark all notifications as read."""
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'status': 'all_read'})
