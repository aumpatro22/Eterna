from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.list_notifications, name='api_list_notifications'),
    path('<int:pk>/read/', api_views.mark_as_read, name='api_mark_notification_read'),
    path('read-all/', api_views.mark_all_as_read, name='api_mark_all_notifications_read'),
]
