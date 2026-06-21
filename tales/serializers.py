from rest_framework import serializers
from .models import Tale, Chapter


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['id', 'order', 'title', 'content', 'published', 'created_at']
        read_only_fields = ['id', 'created_at']


class TaleListSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    chapter_count = serializers.SerializerMethodField()

    class Meta:
        model = Tale
        fields = ['id', 'title', 'slug', 'subtitle', 'description', 'is_public',
                  'author_username', 'chapter_count', 'created_at']

    def get_chapter_count(self, obj):
        if hasattr(obj, 'chapter_count_annotated'):
            return obj.chapter_count_annotated
        return obj.chapters.filter(published=True).count()


class TaleDetailSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    chapters = serializers.SerializerMethodField()

    class Meta:
        model = Tale
        fields = ['id', 'title', 'slug', 'subtitle', 'description', 'is_public',
                  'author_username', 'author_id', 'chapters', 'created_at']

    def get_chapters(self, obj):
        request = self.context.get('request')
        # Show drafts only to the author
        if request and request.user.is_authenticated and request.user == obj.author:
            chapters = obj.chapters.all()
        else:
            chapters = obj.chapters.filter(published=True)
        return ChapterSerializer(chapters, many=True).data


class TaleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tale
        fields = ['title', 'subtitle', 'description', 'is_public']
