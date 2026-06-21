from rest_framework import serializers
from .models import Memorial, Message, Candle, MemorialPhoto, TimelineEvent, Memory, ExperienceTag, Contributor, ContributorInvitation


class MessageSerializer(serializers.ModelSerializer):
    created_at_display = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'author_name', 'author_email', 'content', 'created_at', 'created_at_display']
        read_only_fields = ['id', 'created_at']

    def get_created_at_display(self, obj):
        return obj.created_at.strftime('%b %d, %Y, %I:%M %p')


class CandleSerializer(serializers.ModelSerializer):
    lit_at_display = serializers.SerializerMethodField()

    class Meta:
        model = Candle
        fields = ['id', 'lit_by', 'message', 'lit_at', 'lit_at_display']
        read_only_fields = ['id', 'lit_at']

    def get_lit_at_display(self, obj):
        return obj.lit_at.strftime('%b %d, %Y, %I:%M %p')


class MemorialPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = MemorialPhoto
        fields = ['id', 'image', 'image_url', 'caption', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class TimelineEventSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = TimelineEvent
        fields = ['id', 'event_date', 'title', 'description', 'image', 'image_url', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ExperienceTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceTag
        fields = ['id', 'name', 'description']


class MemorialListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    profile_image_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    candle_count = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()
    tags = ExperienceTagSerializer(many=True, read_only=True)

    class Meta:
        model = Memorial
        fields = [
            'id', 'public_id', 'full_name', 'birth_date', 'passing_date',
            'profile_image_url', 'cover_image_url', 'visibility',
            'is_ai_generated_image', 'owner_username',
            'candle_count', 'message_count', 'created_at', 'tags',
        ]

    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None

    def get_candle_count(self, obj):
        if hasattr(obj, 'candle_count_annotated'):
            return obj.candle_count_annotated
        return obj.candles.count()

    def get_message_count(self, obj):
        if hasattr(obj, 'message_count_annotated'):
            return obj.message_count_annotated
        return obj.messages.count()


class MemorySerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    image_url = serializers.SerializerMethodField()
    voice_note_url = serializers.SerializerMethodField()
    created_at_display = serializers.SerializerMethodField()

    class Meta:
        model = Memory
        fields = [
            'id', 'memorial', 'author_username', 'title', 'story',
            'image', 'image_url', 'voice_note', 'voice_note_url',
            'memory_date', 'visibility', 'created_at', 'created_at_display'
        ]
        read_only_fields = ['id', 'created_at', 'author']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_voice_note_url(self, obj):
        if obj.voice_note:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.voice_note.url)
            return obj.voice_note.url
        return None

    def get_created_at_display(self, obj):
        return obj.created_at.strftime('%b %d, %Y, %I:%M %p')


class MemorialDetailSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    profile_image_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)
    candles = CandleSerializer(many=True, read_only=True)
    photos = MemorialPhotoSerializer(many=True, read_only=True)
    timeline_events = TimelineEventSerializer(many=True, read_only=True)
    memories = MemorySerializer(many=True, read_only=True)
    tags = ExperienceTagSerializer(many=True, read_only=True)

    class Meta:
        model = Memorial
        fields = [
            'id', 'public_id', 'full_name', 'birth_date', 'passing_date',
            'biography', 'tribute', 'profile_image_url', 'cover_image_url',
            'visibility', 'is_ai_generated_image',
            'owner_username', 'owner_id', 'messages', 'candles',
            'photos', 'timeline_events', 'memories', 'tags',
            'created_at', 'updated_at',
        ]

    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None


class MemorialCreateSerializer(serializers.ModelSerializer):
    biography = serializers.CharField(required=False, allow_blank=True, default='')
    use_ai_image = serializers.BooleanField(required=False, default=False)
    image_prompt = serializers.CharField(required=False, allow_blank=True, default='')
    generate_tribute = serializers.BooleanField(required=False, default=False)
    relationship = serializers.CharField(required=False, allow_blank=True, default='')
    memories = serializers.CharField(required=False, allow_blank=True, default='')
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=ExperienceTag.objects.all(), required=False)

    class Meta:
        model = Memorial
        fields = [
            'full_name', 'birth_date', 'passing_date', 'biography',
            'tribute', 'profile_image', 'cover_image', 'visibility',
            'use_ai_image', 'image_prompt',
            'generate_tribute', 'relationship', 'memories', 'tags',
        ]

    def create(self, validated_data):
        # Pop extra fields not on the model
        validated_data.pop('use_ai_image', None)
        validated_data.pop('image_prompt', None)
        validated_data.pop('generate_tribute', None)
        validated_data.pop('relationship', None)
        validated_data.pop('memories', None)
        # DRF will automatically handle many-to-many tags if present in validated_data and super().create is called.
        return super().create(validated_data)


class ContributorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Contributor
        fields = ['id', 'user', 'username', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']


class ContributorInvitationSerializer(serializers.ModelSerializer):
    invited_username = serializers.CharField(source='invited_user.username', read_only=True)
    memorial_name = serializers.CharField(source='memorial.full_name', read_only=True)

    class Meta:
        model = ContributorInvitation
        fields = ['id', 'memorial', 'memorial_name', 'invited_user', 'invited_username', 'role', 'status', 'created_at']
        read_only_fields = ['id', 'created_at', 'status']
