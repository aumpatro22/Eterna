from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.CommunityListView.as_view(), name='api_community_list'),
    path('create/', api_views.community_create, name='api_community_create'),
    path('<slug:slug>/', api_views.CommunityDetailView.as_view(), name='api_community_detail'),
    path('<slug:slug>/archive/', api_views.archive_community, name='api_community_archive'),
    path('<slug:slug>/join/', api_views.join_community, name='api_community_join'),
    path('<slug:slug>/leave/', api_views.leave_community, name='api_community_leave'),
    path('<slug:slug>/invite/', api_views.invite_member, name='api_community_invite'),
    path('<slug:slug>/requests/', api_views.list_join_requests, name='api_community_requests'),
    path('requests/<int:pk>/respond/', api_views.respond_join_request, name='api_community_requests_respond'),
    path('<slug:slug>/post/', api_views.post_message, name='api_post_message'),
    path('<slug:slug>/feed/', api_views.messages_feed, name='api_messages_feed'),
    path('messages/<int:pk>/delete/', api_views.delete_message, name='api_delete_message'),
    path('<slug:slug>/members/', api_views.list_members, name='api_list_members'),
    path('<slug:slug>/members/<str:username>/role/', api_views.update_member_role, name='api_update_member_role'),
    path('<slug:slug>/members/<str:username>/remove/', api_views.remove_member, name='api_remove_member'),
    path('<slug:slug>/ban/<str:username>/', api_views.ban_user, name='api_community_ban'),
    path('<slug:slug>/unban/<str:username>/', api_views.unban_user, name='api_community_unban'),
]
