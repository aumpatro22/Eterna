from rest_framework import serializers
from .models import Community, Channel, Membership, CommunityMessage


class CommunityMessageSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = CommunityMessage
        fields = ['id', 'author_username', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = ['id', 'name', 'slug', 'is_public', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class MembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Membership
        fields = ['id', 'username', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class CommunityListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = ['id', 'name', 'slug', 'description', 'is_public',
                  'owner_username', 'member_count', 'created_at']

    def get_member_count(self, obj):
        return obj.memberships.count()


class CommunityDetailSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    channels = ChannelSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = ['id', 'name', 'slug', 'description', 'is_public',
                  'owner_username', 'channels', 'member_count', 'created_at']

    def get_member_count(self, obj):
        return obj.memberships.count()


class CommunityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ['name', 'description', 'is_public']
