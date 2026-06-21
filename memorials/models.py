import uuid
from django.db import models
from django.conf import settings
from django.urls import reverse
from django.utils import timezone

class Memorial(models.Model):
    VISIBILITY_CHOICES = (
        ('PRIVATE', 'Private'),
        ('FAMILY_ONLY', 'Family Only'),
        ('PUBLIC', 'Public'),
    )
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memorials')
    full_name = models.CharField(max_length=255)
    birth_date = models.DateField(null=True, blank=True)
    passing_date = models.DateField(null=True, blank=True)
    biography = models.TextField()
    tribute = models.TextField(blank=True)
    
    profile_image = models.ImageField(upload_to='memorial_profiles/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='memorial_covers/', null=True, blank=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='PUBLIC')
    is_ai_generated_image = models.BooleanField(default=False)
    tags = models.ManyToManyField("ExperienceTag", related_name='memorials', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    public_id = models.CharField(max_length=22, unique=True, db_index=True, blank=True)
    
    def __str__(self):
        return f"Memorial for {self.full_name}"
        
    def save(self, *args, **kwargs):
        import bleach
        from users.validators import validate_image_file, optimize_image
        if not self.public_id:
            self.public_id = uuid.uuid4().hex[:22]
        if self.biography:
            self.biography = bleach.clean(self.biography, tags=[], strip=True)
        if self.tribute:
            self.tribute = bleach.clean(self.tribute, tags=[], strip=True)
        if self.full_name:
            self.full_name = bleach.clean(self.full_name, tags=[], strip=True)
        if self.profile_image:
            validate_image_file(self.profile_image)
            optimize_image(self.profile_image)
        if self.cover_image:
            validate_image_file(self.cover_image)
            optimize_image(self.cover_image)
            
        from users.storage_utils import handle_storage_pre_save, add_user_storage
        delta = handle_storage_pre_save(self, ['profile_image', 'cover_image'], self.owner)
        
        super().save(*args, **kwargs)
        
        if delta != 0:
            add_user_storage(self.owner, delta)

    def delete(self, *args, **kwargs):
        from users.storage_utils import handle_storage_delete
        handle_storage_delete(self, ['profile_image', 'cover_image'], self.owner)
        super().delete(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('memorial_detail_by_id', kwargs={'public_id': self.public_id})

class MemorialPhoto(models.Model):
    memorial = models.ForeignKey(Memorial, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='memorial_photos/')
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.memorial.full_name} ({self.id})"

    def save(self, *args, **kwargs):
        import bleach
        from users.validators import validate_image_file, optimize_image
        if self.caption:
            self.caption = bleach.clean(self.caption, tags=[], strip=True)
        if self.image:
            validate_image_file(self.image)
            optimize_image(self.image)
            
        from users.storage_utils import handle_storage_pre_save, add_user_storage
        delta = handle_storage_pre_save(self, ['image'], self.memorial.owner)
        
        super().save(*args, **kwargs)
        
        if delta != 0:
            add_user_storage(self.memorial.owner, delta)

    def delete(self, *args, **kwargs):
        from users.storage_utils import handle_storage_delete
        handle_storage_delete(self, ['image'], self.memorial.owner)
        super().delete(*args, **kwargs)

class TimelineEvent(models.Model):
    memorial = models.ForeignKey(Memorial, on_delete=models.CASCADE, related_name='timeline_events')
    event_date = models.DateField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='timeline_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['event_date']

    def __str__(self):
        return f"Event '{self.title}' on {self.memorial.full_name}"

    def save(self, *args, **kwargs):
        import bleach
        from users.validators import validate_image_file, optimize_image
        if self.title:
            self.title = bleach.clean(self.title, tags=[], strip=True)
        if self.description:
            self.description = bleach.clean(self.description, tags=[], strip=True)
        if self.image:
            validate_image_file(self.image)
            optimize_image(self.image)
            
        from users.storage_utils import handle_storage_pre_save, add_user_storage
        delta = handle_storage_pre_save(self, ['image'], self.memorial.owner)
        
        super().save(*args, **kwargs)
        
        if delta != 0:
            add_user_storage(self.memorial.owner, delta)

    def delete(self, *args, **kwargs):
        from users.storage_utils import handle_storage_delete
        handle_storage_delete(self, ['image'], self.memorial.owner)
        super().delete(*args, **kwargs)

class Message(models.Model):
    memorial = models.ForeignKey(Memorial, on_delete=models.CASCADE, related_name='messages')
    author_name = models.CharField(max_length=255)
    author_email = models.EmailField(blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Message from {self.author_name} on {self.memorial.full_name}'s memorial"

    def save(self, *args, **kwargs):
        import bleach
        if self.content:
            self.content = bleach.clean(self.content, tags=[], strip=True)
        if self.author_name:
            self.author_name = bleach.clean(self.author_name, tags=[], strip=True)
        super().save(*args, **kwargs)

class Candle(models.Model):
    memorial = models.ForeignKey(Memorial, on_delete=models.CASCADE, related_name='candles')
    lit_by = models.CharField(max_length=255)
    lit_at = models.DateTimeField(default=timezone.now)
    message = models.TextField(blank=True)
    
    def __str__(self):
        return f"Candle lit by {self.lit_by} on {self.memorial.full_name}'s memorial"

    def save(self, *args, **kwargs):
        import bleach
        if self.lit_by:
            self.lit_by = bleach.clean(self.lit_by, tags=[], strip=True)
        if self.message:
            self.message = bleach.clean(self.message, tags=[], strip=True)
        super().save(*args, **kwargs)

class Memory(models.Model):
    VISIBILITY_CHOICES = (
        ('PRIVATE', 'Private'),
        ('FAMILY_ONLY', 'Family Only'),
        ('PUBLIC', 'Public'),
    )
    memorial = models.ForeignKey(Memorial, on_delete=models.CASCADE, related_name='memories')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_memories')
    title = models.CharField(max_length=255)
    story = models.TextField()
    image = models.ImageField(upload_to='memories/', null=True, blank=True)
    voice_note = models.FileField(upload_to='memory_voices/', null=True, blank=True)
    memory_date = models.DateField(null=True, blank=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='PUBLIC')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Memory '{self.title}' on {self.memorial.full_name}"

    def save(self, *args, **kwargs):
        import bleach
        from users.validators import validate_image_file, validate_audio_file, optimize_image
        if self.title:
            self.title = bleach.clean(self.title, tags=[], strip=True)
        if self.story:
            self.story = bleach.clean(self.story, tags=[], strip=True)
        if self.image:
            validate_image_file(self.image)
            optimize_image(self.image)
        if self.voice_note:
            validate_audio_file(self.voice_note)
            
        from users.storage_utils import handle_storage_pre_save, add_user_storage
        delta = handle_storage_pre_save(self, ['image', 'voice_note'], self.author)
        
        super().save(*args, **kwargs)
        
        if delta != 0:
            add_user_storage(self.author, delta)

    def delete(self, *args, **kwargs):
        from users.storage_utils import handle_storage_delete
        handle_storage_delete(self, ['image', 'voice_note'], self.author)
        super().delete(*args, **kwargs)

class ExperienceTag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Contributor(models.Model):
    ROLE_CHOICES = (
        ('OWNER', 'Owner'),
        ('FAMILY_MEMBER', 'Family Member'),
        ('EDITOR', 'Editor'),
    )
    memorial = models.ForeignKey(Memorial, on_delete=models.CASCADE, related_name='contributors')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contributions')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='FAMILY_MEMBER')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('memorial', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.role} on {self.memorial.full_name}"

class ContributorInvitation(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined'),
    )
    memorial = models.ForeignKey(Memorial, on_delete=models.CASCADE, related_name='invitations')
    invited_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='invitations')
    role = models.CharField(max_length=20, choices=Contributor.ROLE_CHOICES, default='FAMILY_MEMBER')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('memorial', 'invited_user')

    def __str__(self):
        return f"Invitation to {self.invited_user.username} for {self.memorial.full_name} ({self.status})"
