from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    created_at_display = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at', 'created_at_display']
        read_only_fields = ['id', 'created_at']

    def get_created_at_display(self, obj):
        return obj.created_at.strftime('%b %d, %Y, %I:%M %p')
