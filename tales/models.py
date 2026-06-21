from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Tale(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tales')
    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    subtitle = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        import bleach
        if self.title:
            self.title = bleach.clean(self.title, tags=[], strip=True)
        if self.subtitle:
            self.subtitle = bleach.clean(self.subtitle, tags=[], strip=True)
        if self.description:
            self.description = bleach.clean(self.description, tags=[], strip=True)
        if not self.slug:
            base = slugify(self.title)[:175]
            candidate = base
            i = 2
            # Ensure uniqueness; exclude self when updating
            while Tale.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                suffix = f"-{i}"
                candidate = f"{base[:175 - len(suffix)]}{suffix}"
                i += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Chapter(models.Model):
    tale = models.ForeignKey(Tale, on_delete=models.CASCADE, related_name='chapters')
    order = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=160)
    content = models.TextField()
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ('tale', 'order')

    def __str__(self):
        return f"{self.tale.title} — {self.title}"

    def save(self, *args, **kwargs):
        import bleach
        if self.title:
            self.title = bleach.clean(self.title, tags=[], strip=True)
        if self.content:
            self.content = bleach.clean(self.content, tags=[], strip=True)
        super().save(*args, **kwargs)
