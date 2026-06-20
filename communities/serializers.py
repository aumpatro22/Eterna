from rest_framework import serializers
from .models import Community, Membership, CommunityJoinRequest, CommunityMessage


class CommunityMessageSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = CommunityMessage
        fields = ['id', 'author_username', 'content', 'image', 'is_deleted', 'deleted_by', 'created_at']
        read_only_fields = ['id', 'is_deleted', 'deleted_by', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # If the message is soft-deleted, hide the content and image
        if instance.is_deleted:
            ret['content'] = '[This message was deleted]'
            ret['image'] = None
        return ret


class MembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Membership
        fields = ['id', 'username', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class CommunityJoinRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    community_title = serializers.CharField(source='community.title', read_only=True)

    class Meta:
        model = CommunityJoinRequest
        fields = ['id', 'user', 'username', 'community', 'community_title', 'status', 'is_invite', 'created_at']
        read_only_fields = ['id', 'username', 'community_title', 'created_at']


class CommunityListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = ['id', 'title', 'slug', 'description', 'community_type', 'is_archived',
                  'cover_image', 'icon_image', 'owner_username', 'member_count', 'created_at']

    def get_member_count(self, obj):
        return obj.memberships.count()


class CommunityDetailSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = ['id', 'title', 'slug', 'description', 'rules', 'welcome_message', 
                  'cover_image', 'icon_image', 'community_type', 'is_archived',
                  'owner_username', 'member_count', 'created_at']

    def get_member_count(self, obj):
        return obj.memberships.count()


class CommunityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ['title', 'description', 'rules', 'welcome_message', 'cover_image', 'icon_image', 'community_type']
