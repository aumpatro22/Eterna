from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.CommunityListView.as_view(), name='api_community_list'),
    path('create/', api_views.community_create, name='api_community_create'),
    path('<slug:slug>/', api_views.CommunityDetailView.as_view(), name='api_community_detail'),
    path('<slug:slug>/join/', api_views.join_community, name='api_community_join'),
    path('<slug:slug>/leave/', api_views.leave_community, name='api_community_leave'),
    path('<slug:slug>/channels/', api_views.channel_create, name='api_channel_create'),
    path('<slug:slug>/c/<slug:channel_slug>/post/', api_views.post_message, name='api_post_message'),
    path('<slug:slug>/c/<slug:channel_slug>/feed/', api_views.messages_feed, name='api_messages_feed'),
]
