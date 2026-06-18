from django.urls import path
from . import api_views

urlpatterns = [
    path('auth/register/', api_views.register_view, name='api_register'),
    path('auth/login/', api_views.login_view, name='api_login'),
    path('auth/logout/', api_views.logout_view, name='api_logout'),
    path('auth/me/', api_views.me_view, name='api_me'),
    path('users/search/', api_views.search_profiles, name='api_search_profiles'),
    path('users/<str:username>/', api_views.profile_detail, name='api_profile_detail'),
    path('users/<str:username>/dm/', api_views.send_dm, name='api_send_dm'),
    path('users/<str:username>/dm/feed/', api_views.dm_feed, name='api_dm_feed'),
    path('react/', api_views.react_toggle, name='api_react'),
]
