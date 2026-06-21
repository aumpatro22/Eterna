from .models import Notification

class NotificationService:
    @staticmethod
    def notify(user, title, message):
        try:
            return Notification.objects.create(
                user=user,
                title=title,
                message=message
            )
        except Exception as e:
            # Prevent failures in notifications from breaking main business flows
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create notification: {e}")
            return None
