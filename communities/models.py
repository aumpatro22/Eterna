from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Community(models.Model):
    COMMUNITY_TYPE_CHOICES = (
        ('PUBLIC', 'Public'),
        ('PRIVATE', 'Private'),
    )
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_communities')
    title = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    
    rules = models.TextField(
        default="1. Be respectful.\n2. No harassment.\n3. Support others kindly.\n4. No spam."
    )
    welcome_message = models.TextField(
        default="We're sorry you're here, but you're not alone."
    )
    
    cover_image = models.ImageField(upload_to='communities/covers/', null=True, blank=True)
    icon_image = models.ImageField(upload_to='communities/icons/', null=True, blank=True)
    
    community_type = models.CharField(
        max_length=10, 
        choices=COMMUNITY_TYPE_CHOICES, 
        default='PUBLIC'
    )
    
    is_archived = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        import bleach
        from users.validators import validate_image_file, optimize_image
        if not self.slug:
            self.slug = slugify(self.title)[:95]
        if self.title:
            self.title = bleach.clean(self.title, tags=[], strip=True)
        if self.description:
            self.description = bleach.clean(self.description, tags=[], strip=True)
        if self.rules:
            self.rules = bleach.clean(self.rules, tags=[], strip=True)
        if self.welcome_message:
            self.welcome_message = bleach.clean(self.welcome_message, tags=[], strip=True)
        if self.cover_image:
            validate_image_file(self.cover_image)
            optimize_image(self.cover_image)
        if self.icon_image:
            validate_image_file(self.icon_image)
            optimize_image(self.icon_image)
            
        from users.storage_utils import handle_storage_pre_save, add_user_storage
        delta = handle_storage_pre_save(self, ['cover_image', 'icon_image'], self.owner)
        
        super().save(*args, **kwargs)
        
        if delta != 0:
            add_user_storage(self.owner, delta)

    def delete(self, *args, **kwargs):
        from users.storage_utils import handle_storage_delete
        handle_storage_delete(self, ['cover_image', 'icon_image'], self.owner)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.title


class Membership(models.Model):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'), 
        ('CO_ADMIN', 'Co-Admin'), 
        ('MEMBER', 'Member')
    )
    
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MEMBER')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('community', 'user')

    def __str__(self):
        return f"{self.user.username} ({self.role}) in {self.community.title}"


class CommunityJoinRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_join_requests')
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='join_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    is_invite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'community', 'is_invite')

    def __str__(self):
        direction = "Invite to" if self.is_invite else "Request from"
        return f"{direction} {self.user.username} for {self.community.title} ({self.status})"


class CommunityMessage(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_messages')
    content = models.TextField()
    image = models.ImageField(upload_to='community_messages/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        related_name='deleted_community_messages'
    )

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        deleted_status = " (Deleted)" if self.is_deleted else ""
        return f"{self.author.username} in {self.community.title}: {self.content[:30]}{deleted_status}"

    def save(self, *args, **kwargs):
        import bleach
        from users.validators import validate_image_file, optimize_image
        if self.content:
            self.content = bleach.clean(self.content, tags=[], strip=True)
        if self.image:
            validate_image_file(self.image)
            optimize_image(self.image)
            
        from users.storage_utils import handle_storage_pre_save, add_user_storage
        delta = handle_storage_pre_save(self, ['image'], self.author)
        
        super().save(*args, **kwargs)
        
        if delta != 0:
            add_user_storage(self.author, delta)

    def delete(self, *args, **kwargs):
        from users.storage_utils import handle_storage_delete
        handle_storage_delete(self, ['image'], self.author)
        super().delete(*args, **kwargs)


class CommunityBan(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='bans')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_bans')
    banned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bans_issued')
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('community', 'user')

    def __str__(self):
        return f"{self.user.username} banned from {self.community.title} by {self.banned_by.username}"
