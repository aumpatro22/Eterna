from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.TaleListView.as_view(), name='api_tale_list'),
    path('create/', api_views.tale_create, name='api_tale_create'),
    path('<slug:slug>/', api_views.TaleDetailView.as_view(), name='api_tale_detail'),
    path('<slug:slug>/delete/', api_views.tale_delete, name='api_tale_delete'),
    path('<slug:slug>/chapters/', api_views.chapter_create, name='api_chapter_create'),
    path('<slug:slug>/chapters/<int:chapter_id>/publish/', api_views.chapter_publish, name='api_chapter_publish'),
]
