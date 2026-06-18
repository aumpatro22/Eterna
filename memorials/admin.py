from django.contrib import admin
from .models import Memorial, Message, Candle, MemorialPhoto, TimelineEvent, Memory, ExperienceTag, Contributor, ContributorInvitation

@admin.register(Memorial)
class MemorialAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'owner', 'created_at')
    search_fields = ('full_name', 'biography', 'tribute')
    list_filter = ('created_at', 'is_ai_generated_image')

@admin.register(MemorialPhoto)
class MemorialPhotoAdmin(admin.ModelAdmin):
    list_display = ('memorial', 'caption', 'created_at')

@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    list_display = ('memorial', 'title', 'event_date', 'created_at')

@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'memorial', 'author', 'visibility', 'created_at')
    search_fields = ('title', 'story', 'author__username')
    list_filter = ('visibility', 'created_at')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'memorial', 'created_at')
    search_fields = ('content', 'author_name', 'author_email')
    list_filter = ('created_at',)

@admin.register(Candle)
class CandleAdmin(admin.ModelAdmin):
    list_display = ('lit_by', 'memorial', 'lit_at')
    search_fields = ('message', 'lit_by')
    list_filter = ('lit_at',)

@admin.register(ExperienceTag)
class ExperienceTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')

@admin.register(Contributor)
class ContributorAdmin(admin.ModelAdmin):
    list_display = ('memorial', 'user', 'role', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('memorial__full_name', 'user__username')

@admin.register(ContributorInvitation)
class ContributorInvitationAdmin(admin.ModelAdmin):
    list_display = ('memorial', 'invited_user', 'role', 'status', 'created_at')
    list_filter = ('role', 'status', 'created_at')
    search_fields = ('memorial__full_name', 'invited_user__username')
