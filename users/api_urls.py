from django.urls import path
from . import api_views

urlpatterns = [
    path('auth/register/', api_views.register_view, name='api_register'),
    path('auth/login/', api_views.login_view, name='api_login'),
    path('auth/logout/', api_views.logout_view, name='api_logout'),
    path('auth/me/', api_views.me_view, name='api_me'),
    path('users/search/', api_views.search_profiles, name='api_search_profiles'),
    path('users/<str:username>/', api_views.profile_detail, name='api_profile_detail'),
    path('conversations/', api_views.list_conversations, name='api_conversations_list'),
    path('conversations/create/', api_views.get_or_create_conversation, name='api_conversations_create'),
    path('conversations/<int:pk>/messages/', api_views.conversation_messages, name='api_conversations_messages'),
    path('conversations/<int:pk>/messages/send/', api_views.send_direct_message, name='api_conversations_messages_send'),
    path('conversations/<int:pk>/block/', api_views.toggle_block_conversation, name='api_conversations_block'),
    path('users/profile/update/', api_views.profile_update, name='api_profile_update'),
    path('profiles/timeline/', api_views.add_profile_timeline_event, name='api_add_profile_timeline_event'),
    path('profiles/timeline/<int:pk>/delete/', api_views.delete_profile_timeline_event, name='api_delete_profile_timeline_event'),
    path('connections/', api_views.list_connections, name='api_list_connections'),
    path('connections/request/', api_views.request_connection, name='api_request_connection'),
    path('connections/<int:pk>/respond/', api_views.respond_connection, name='api_respond_connection'),
    path('connections/block/', api_views.block_user_directly, name='api_block_user_directly'),
    path('reports/', api_views.file_report, name='api_file_report'),
    path('react/', api_views.react_toggle, name='api_react'),
]
