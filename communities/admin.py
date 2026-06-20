from django.contrib import admin
from .models import Community, Membership, CommunityJoinRequest, CommunityMessage

@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'community_type', 'is_archived', 'created_at')
    search_fields = ('title', 'description')
    list_filter = ('community_type', 'is_archived', 'created_at')

@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ('community', 'user', 'role', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('community__title', 'user__username')

@admin.register(CommunityJoinRequest)
class CommunityJoinRequestAdmin(admin.ModelAdmin):
    list_display = ('community', 'user', 'status', 'is_invite', 'created_at')
    list_filter = ('status', 'is_invite', 'created_at')
    search_fields = ('community__title', 'user__username')

@admin.register(CommunityMessage)
class CommunityMessageAdmin(admin.ModelAdmin):
    list_display = ('community', 'author', 'is_deleted', 'created_at')
    search_fields = ('content', 'author__username', 'community__title')
    list_filter = ('is_deleted', 'created_at')
