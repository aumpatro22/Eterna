from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Reaction, DirectMessage, Conversation, CircleConnection, ProfileTimelineEvent

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'role', 'is_superuser']
        read_only_fields = ['id']


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']
        read_only_fields = ['id']


class ProfileTimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileTimelineEvent
        fields = ['id', 'title', 'event_date', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class CircleConnectionSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = CircleConnection
        fields = ['id', 'sender_username', 'receiver_username', 'status', 'connection_type', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()
    timeline_events = ProfileTimelineEventSerializer(many=True, read_only=True)
    joined_communities = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['user', 'display_name', 'bio', 'avatar_url', 'public_search', 'tags', 'tags_list', 
                  'privacy_setting', 'timeline_events', 'joined_communities', 'storage_used', 'storage_limit']

    def get_avatar_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

    def get_tags_list(self, obj):
        return obj.tags_list()

    def get_joined_communities(self, obj):
        from communities.serializers import CommunityListSerializer
        # Get all communities where the user is a member
        mems = obj.user.community_memberships.select_related('community')
        comms = [m.community for m in mems]
        return CommunityListSerializer(comms, many=True).data


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class DirectMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = DirectMessage
        fields = ['id', 'conversation', 'sender_username', 'content', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserPublicSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'created_at', 'is_blocked', 'blocked_by', 'last_message']
        read_only_fields = ['id', 'created_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'content': last_msg.content,
                'sender': last_msg.sender.username,
                'created_at': last_msg.created_at
            }
        return None



class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ['id', 'reaction_type', 'content_type', 'object_id', 'created_at']
        read_only_fields = ['id', 'created_at']
