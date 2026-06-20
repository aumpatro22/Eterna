from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.MemorialListView.as_view(), name='api_memorial_list'),
    path('create/', api_views.memorial_create, name='api_memorial_create'),
    path('<int:pk>/', api_views.MemorialDetailView.as_view(), name='api_memorial_detail'),
    path('<int:pk>/update/', api_views.memorial_update, name='api_memorial_update'),
    path('<int:pk>/delete/', api_views.memorial_delete, name='api_memorial_delete'),
    path('<int:pk>/messages/', api_views.add_message, name='api_memorial_message'),
    path('<int:pk>/candles/', api_views.light_candle, name='api_memorial_candle'),
    path('<int:pk>/photos/', api_views.add_memorial_photo, name='api_memorial_photo_add'),
    path('<int:pk>/timeline/', api_views.add_timeline_event, name='api_memorial_timeline_add'),
    path('<int:pk>/memories/', api_views.memorial_memories, name='api_memorial_memories'),
    path('<int:pk>/contributors/', api_views.list_contributors, name='api_memorial_contributors'),
    path('<int:pk>/contributors/invite/', api_views.invite_contributor, name='api_memorial_contributors_invite'),
    path('invitations/', api_views.list_invitations, name='api_invitations_list'),
    path('invitations/<int:pk>/respond/', api_views.respond_invitation, name='api_invitations_respond'),
    path('tags/', api_views.list_tags, name='api_tags_list'),
    path('timeline/<int:pk>/delete/', api_views.delete_timeline_event, name='api_timeline_delete'),
    path('memories/<int:pk>/delete/', api_views.delete_memory, name='api_memory_delete'),
    path('messages/<int:pk>/delete/', api_views.delete_message, name='api_message_delete'),
    path('by-id/<str:public_id>/', api_views.MemorialByPublicIdView.as_view(), name='api_memorial_by_id'),
]
