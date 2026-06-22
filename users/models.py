from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

class User(AbstractUser):
    is_banned = models.BooleanField(default=False)
    ban_reason = models.TextField(blank=True)

    def __str__(self):
        return self.username

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    public_search = models.BooleanField(default=True)
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags")
    last_seen = models.DateTimeField(null=True, blank=True)
    
    PRIVACY_CHOICES = (
        ('PUBLIC', 'Public'),
        ('CONNECTIONS_ONLY', 'Connections Only'),
        ('PRIVATE', 'Private'),
    )
    privacy_setting = models.CharField(max_length=20, choices=PRIVACY_CHOICES, default='PUBLIC')
    
    # Storage management
    storage_used = models.BigIntegerField(default=0)  # in bytes
    storage_limit = models.BigIntegerField(default=52428800)  # 50 MB default

    def tags_list(self):
        return [t.strip() for t in (self.tags or '').split(',') if t.strip()]

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def save(self, *args, **kwargs):
        import bleach
        from .validators import validate_image_file, optimize_image
        if self.bio:
            self.bio = bleach.clean(self.bio, tags=[], strip=True)
        if self.display_name:
            self.display_name = bleach.clean(self.display_name, tags=[], strip=True)
        
        # Avoid recursion when only updating storage_used
        update_fields = kwargs.get('update_fields')
        if update_fields and list(update_fields) == ['storage_used']:
            super().save(*args, **kwargs)
            return

        if self.profile_image:
            validate_image_file(self.profile_image)
            optimize_image(self.profile_image)
            
        from users.storage_utils import handle_storage_pre_save, add_user_storage
        delta = handle_storage_pre_save(self, ['profile_image'], self.user)
        
        super().save(*args, **kwargs)
        
        if delta != 0:
            add_user_storage(self.user, delta)

    def delete(self, *args, **kwargs):
        from users.storage_utils import handle_storage_delete
        handle_storage_delete(self, ['profile_image'], self.user)
        super().delete(*args, **kwargs)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        Profile.objects.create(user=instance)


class Reaction(models.Model):
    REACTION_CHOICES = (
        ('like', 'Like'),
        ('love', 'Love'),
        ('support', 'Support'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reactions')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')

    def __str__(self):
        return f"{self.user.username} {self.reaction_type} {self.content_type.model}:{self.object_id}"

class Conversation(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    is_blocked = models.BooleanField(default=False)
    blocked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='blocked_conversations'
    )

    def __str__(self):
        return f"Conversation {self.pk}"


class DirectMessage(models.Model):
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name='messages',
        null=True, 
        blank=True
    )
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_direct_messages')
    content = models.TextField()
    image = models.ImageField(upload_to='dm_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"DM from {self.sender.username} in Conv {self.conversation_id}: {self.content[:24]}"

    def save(self, *args, **kwargs):
        import bleach
        from .validators import validate_image_file, optimize_image
        if self.content:
            self.content = bleach.clean(self.content, tags=[], strip=True)
        if self.image:
            validate_image_file(self.image)
            optimize_image(self.image)
            
        from users.storage_utils import handle_storage_pre_save, add_user_storage
        delta = handle_storage_pre_save(self, ['image'], self.sender)
        
        super().save(*args, **kwargs)
        
        if delta != 0:
            add_user_storage(self.sender, delta)

    def delete(self, *args, **kwargs):
        from users.storage_utils import handle_storage_delete
        handle_storage_delete(self, ['image'], self.sender)
        super().delete(*args, **kwargs)


class CircleConnection(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined'),
        ('BLOCKED', 'Blocked'),
    )
    CONNECTION_TYPE_CHOICES = (
        ('FRIEND', 'Friend'),
        ('FAMILY', 'Family'),
        ('SUPPORTER', 'Supporter'),
    )

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_connections')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_connections')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    connection_type = models.CharField(max_length=10, choices=CONNECTION_TYPE_CHOICES, default='FRIEND')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver')

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.connection_type}: {self.status})"


class ProfileTimelineEvent(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='timeline_events')
    title = models.CharField(max_length=100)
    event_date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['event_date']

    def __str__(self):
        return f"{self.title} on {self.event_date}"


class Report(models.Model):
    REASON_CHOICES = (
        ('SPAM', 'Spam'),
        ('HARASSMENT', 'Harassment'),
        ('FAKE_ACCOUNT', 'Fake Account'),
        ('INAPPROPRIATE_CONTENT', 'Inappropriate Content'),
    )

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_submitted')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    reason = models.CharField(max_length=25, choices=REASON_CHOICES)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by {self.reporter.username} on {self.content_type.model}:{self.object_id} ({self.reason})"
