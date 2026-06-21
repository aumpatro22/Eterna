from rest_framework import permissions

class IsNotBanned(permissions.BasePermission):
    """
    Allows access only to users who are not banned.
    """
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            if getattr(request.user, 'is_banned', False):
                return False
        return True
