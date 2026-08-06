import os
import time
from datetime import datetime
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sessions.models import Session
from django.contrib.contenttypes.models import ContentType
from django.db import connection
from django.db.models import Q, Sum, Count
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

User = get_user_model()
from users.models import Profile, Report, PlatformStatus, AuditLog, MemorialOwnershipRequest, ContactMessage
from memorials.models import Memorial, MemorialPhoto, TimelineEvent, Memory
from tales.models import Tale, Chapter
from communities.models import Community, Membership, CommunityJoinRequest, CommunityMessage, CommunityBan

# Helpers
def check_staff_role(request, allowed_roles=None):
    """
    Checks if request user is authenticated and is an admin (ADMIN role or superuser).
    """
    if not (request.user and request.user.is_authenticated):
        return False
    
    role = request.user.admin_role
    if role != 'ADMIN':
        return False
        
    return True

def log_admin_action(admin, action, target_type, target_id, reason=""):
    AuditLog.objects.create(
        admin=admin,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        reason=reason
    )

# 1. Dashboard API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    # Stats
    total_users = User.objects.count()
    
    # Active users (seen in last 15 minutes)
    active_cutoff = timezone.now() - timezone.timedelta(minutes=15)
    active_users = User.objects.filter(profile__last_seen__gte=active_cutoff).count()
    
    # New users today
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    new_users_today = User.objects.filter(date_joined__gte=today_start).count()
    
    memorial_count = Memorial.objects.count()
    tales_count = Tale.objects.count()
    community_count = Community.objects.count()
    pending_reports = Report.objects.filter(status='PENDING').count()
    
    # Storage used (Sum from Profiles)
    total_storage = Profile.objects.aggregate(total=Sum('storage_used'))['total'] or 0
    
    # DB Connections & status (SQLite or Postgres pg_stat_activity)
    current_conns = 1
    max_conns = 100
    db_status = "Connected"
    try:
        with connection.cursor() as cursor:
            # Check connection
            cursor.execute("SELECT 1;")
            if connection.vendor == 'postgresql':
                cursor.execute("SELECT count(*) FROM pg_stat_activity;")
                current_conns = cursor.fetchone()[0]
                cursor.execute("show max_connections;")
                max_conns = int(cursor.fetchone()[0])
    except Exception:
        db_status = "Offline"
        
    # Recent Activities
    recent_logs = AuditLog.objects.select_related('admin').order_by('-timestamp')[:10]
    activity_feed = []
    for log in recent_logs:
        activity_feed.append({
            'admin': log.admin.username,
            'action': log.action,
            'target_type': log.target_type,
            'target_id': log.target_id,
            'reason': log.reason,
            'timestamp': log.timestamp
        })
        
    return Response({
        'stats': {
            'total_users': total_users,
            'active_users': active_users,
            'new_users_today': new_users_today,
            'memorial_count': memorial_count,
            'tales_count': tales_count,
            'community_count': community_count,
            'pending_reports': pending_reports,
            'storage_used_bytes': total_storage,
            'db_connections': current_conns,
            'db_connection_limit': max_conns,
            'db_status': db_status,
            'backend_status': 'healthy'
        },
        'activities': activity_feed
    })

# 2. Global Search API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_global_search(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({'users': [], 'memorials': [], 'communities': []})
        
    users = User.objects.filter(
        Q(username__icontains=query) | Q(email__icontains=query) | Q(profile__display_name__icontains=query)
    ).select_related('profile')[:10]
    
    memorials = Memorial.objects.filter(
        Q(full_name__icontains=query) | Q(biography__icontains=query)
    )[:10]
    
    communities = Community.objects.filter(
        Q(title__icontains=query) | Q(description__icontains=query)
    )[:10]
    
    return Response({
        'users': [{
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'display_name': u.profile.display_name,
            'role': u.role
        } for u in users],
        'memorials': [{
            'id': m.id,
            'full_name': m.full_name,
            'owner': m.owner.username,
            'visibility': m.visibility
        } for m in memorials],
        'communities': [{
            'id': c.id,
            'title': c.title,
            'owner': c.owner.username,
            'is_archived': c.is_archived
        } for c in communities]
    })

# 3. Users list & detail administration
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    search = request.GET.get('search', '').strip()
    role_filter = request.GET.get('role', '').strip()
    status_filter = request.GET.get('status', '').strip()
    
    users = User.objects.select_related('profile').all()
    
    if search:
        users = users.filter(
            Q(username__icontains=search) | Q(email__icontains=search) | Q(profile__display_name__icontains=search)
        )
    if role_filter:
        users = users.filter(role=role_filter)
    if status_filter == 'banned':
        users = users.filter(is_banned=True)
    elif status_filter == 'active':
        users = users.filter(is_active=True, is_banned=False)
    elif status_filter == 'inactive':
        users = users.filter(is_active=False)
        
    # Manual Pagination to prevent loading massive rows
    limit = int(request.GET.get('limit', 20))
    offset = int(request.GET.get('offset', 0))
    total = users.count()
    users_page = users[offset:offset+limit]
    
    users_data = []
    for u in users_page:
        users_data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'display_name': u.profile.display_name,
            'profile_image': request.build_absolute_uri(u.profile.profile_image.url) if u.profile.profile_image else None,
            'joined_date': u.date_joined,
            'storage_used': u.profile.storage_used,
            'role': u.admin_role,
            'is_active': u.is_active,
            'is_banned': u.is_banned,
            'ban_reason': u.ban_reason,
            'admin_notes': u.admin_notes
        })
        
    return Response({
        'total': total,
        'users': users_data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_user_status_action(request, pk):
    user = get_object_or_404(User, pk=pk)
    action = request.data.get('action')
    reason = request.data.get('reason', '').strip()
    
    if action in ['ban', 'unban', 'change_role', 'delete']:
        # Banning/Role changes/Deletion require ADMIN
        if not check_staff_role(request, ['ADMIN']):
            return Response({"detail": "Only Admins can perform ban, role, or delete operations."}, status=status.HTTP_403_FORBIDDEN)
    else:
        # Activates/deactivates require MODERATOR
        if not check_staff_role(request, ['MODERATOR']):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            
    if action == 'activate':
        user.is_active = True
        user.save()
        log_admin_action(request.user, "ACTIVATE_USER", "USER", user.id, reason)
    elif action == 'deactivate':
        user.is_active = False
        user.save()
        log_admin_action(request.user, "DEACTIVATE_USER", "USER", user.id, reason)
    elif action == 'ban':
        user.is_banned = True
        user.ban_reason = reason
        user.save()
        log_admin_action(request.user, "BAN_USER", "USER", user.id, reason)
    elif action == 'unban':
        user.is_banned = False
        user.save()
        log_admin_action(request.user, "UNBAN_USER", "USER", user.id, reason)
    elif action == 'change_role':
        new_role = request.data.get('role')
        if new_role not in ['ADMIN', 'MODERATOR', 'SUPPORT', 'USER']:
            return Response({"detail": "Invalid role choice"}, status=status.HTTP_400_BAD_REQUEST)
        user.role = new_role
        user.is_staff = (new_role in ['ADMIN', 'MODERATOR', 'SUPPORT'])
        user.save()
        log_admin_action(request.user, "CHANGE_ROLE", "USER", user.id, f"Role changed to {new_role}. {reason}")
    elif action == 'delete':
        # Cannot delete your own account or another superuser
        if user.pk == request.user.pk:
            return Response({"detail": "You cannot delete your own admin account."}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_superuser:
            return Response({"detail": "Superuser accounts cannot be deleted via the admin panel."}, status=status.HTTP_403_FORBIDDEN)
        username_snapshot = user.username
        user_id_snapshot = user.id
        user.delete()
        log_admin_action(request.user, "DELETE_USER", "USER", user_id_snapshot, f"Permanently deleted account '{username_snapshot}'. Reason: {reason}")
        return Response({"status": "deleted"})
    else:
        return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
    return Response({"status": "success"})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_user_notes(request, pk):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    user = get_object_or_404(User, pk=pk)
    
    if request.method == 'POST':
        # Setting user notes
        notes = request.data.get('notes', '')
        user.admin_notes = notes
        user.save()
        log_admin_action(request.user, "UPDATE_USER_NOTES", "USER", user.id, "Updated internal notes.")
        return Response({"status": "success", "admin_notes": user.admin_notes})
        
    return Response({"admin_notes": user.admin_notes})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_user_profile_detail(request, pk):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    user = get_object_or_404(User, pk=pk)
    profile = user.profile
    
    memorials = Memorial.objects.filter(owner=user).values('id', 'full_name', 'visibility', 'created_at', 'is_hidden', 'is_archived')
    tales = Tale.objects.filter(author=user).values('id', 'title', 'is_public', 'created_at', 'is_hidden', 'is_archived')
    
    # Communities owned
    communities = Community.objects.filter(owner=user).values('id', 'title', 'is_archived', 'is_locked')
    
    # Reports on user's contents or submitted
    reports_submitted = Report.objects.filter(reporter=user).values('id', 'reason', 'status', 'created_at')
    
    return Response({
        'username': user.username,
        'email': user.email,
        'display_name': profile.display_name,
        'bio': profile.bio,
        'profile_image': request.build_absolute_uri(profile.profile_image.url) if profile.profile_image else None,
        'joined_date': user.date_joined,
        'storage_used': profile.storage_used,
        'storage_limit': profile.storage_limit,
        'last_seen': profile.last_seen,
        'role': user.admin_role,
        'is_active': user.is_active,
        'is_banned': user.is_banned,
        'admin_notes': user.admin_notes,
        'memorials': list(memorials),
        'tales': list(tales),
        'communities': list(communities),
        'reports_submitted': list(reports_submitted)
    })

# 4. User Sessions
@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_sessions_list(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    if request.method == 'DELETE':
        # Session termination requires ADMIN role
        if not check_staff_role(request, ['ADMIN']):
            return Response({"detail": "Only Admins can terminate user sessions."}, status=status.HTTP_403_FORBIDDEN)
            
        session_key = request.data.get('session_key')
        if not session_key:
            return Response({"detail": "Session key required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            Session.objects.filter(session_key=session_key).delete()
            log_admin_action(request.user, "TERMINATE_SESSION", "SESSION", session_key, "Forced logout")
            return Response({"status": "success"})
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    # GET list of active sessions
    active_sessions = []
    now = timezone.now()
    sessions = Session.objects.filter(expire_date__gt=now)
    for s in sessions:
        try:
            data = s.get_decoded()
            user_id = data.get('_auth_user_id')
            if user_id:
                user = User.objects.get(pk=user_id)
                active_sessions.append({
                    'session_key': s.session_key,
                    'username': user.username,
                    'email': user.email,
                    'expire_date': s.expire_date,
                    'last_seen': user.profile.last_seen if hasattr(user, 'profile') else None
                })
        except Exception:
            pass
            
    return Response(active_sessions)

# 5. Memorials Management
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_memorials_list(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    search = request.GET.get('search', '').strip()
    status_filter = request.GET.get('status', '').strip()
    
    memorials = Memorial.objects.select_related('owner').all()
    if search:
        memorials = memorials.filter(
            Q(full_name__icontains=search) | Q(biography__icontains=search) | Q(owner__username__icontains=search)
        )
    if status_filter == 'hidden':
        memorials = memorials.filter(is_hidden=True)
    elif status_filter == 'archived':
        memorials = memorials.filter(is_archived=True)
    elif status_filter == 'active':
        memorials = memorials.filter(is_hidden=False, is_archived=False)
        
    limit = int(request.GET.get('limit', 20))
    offset = int(request.GET.get('offset', 0))
    total = memorials.count()
    memorials_page = memorials[offset:offset+limit]
    
    data = []
    for m in memorials_page:
        data.append({
            'id': m.id,
            'full_name': m.full_name,
            'birth_date': m.birth_date,
            'passing_date': m.passing_date,
            'owner': m.owner.username,
            'cover_image': request.build_absolute_uri(m.cover_image.url) if m.cover_image else None,
            'visibility': m.visibility,
            'created_at': m.created_at,
            'is_hidden': m.is_hidden,
            'is_archived': m.is_archived
        })
        
    return Response({'total': total, 'memorials': data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_memorial_action(request, pk):
    if not check_staff_role(request, ['MODERATOR']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    memorial = get_object_or_404(Memorial, pk=pk)
    action = request.data.get('action')
    reason = request.data.get('reason', '').strip()
    
    if action == 'hide':
        memorial.is_hidden = True
        memorial.save()
        log_admin_action(request.user, "HIDE_MEMORIAL", "MEMORIAL", memorial.id, reason)
    elif action == 'restore':
        memorial.is_hidden = False
        memorial.is_archived = False
        memorial.save()
        log_admin_action(request.user, "RESTORE_MEMORIAL", "MEMORIAL", memorial.id, reason)
    elif action == 'archive':
        memorial.is_archived = True
        memorial.save()
        log_admin_action(request.user, "ARCHIVE_MEMORIAL", "MEMORIAL", memorial.id, reason)
    else:
        return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
    return Response({"status": "success"})

# 6. Tales Management
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_tales_list(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    search = request.GET.get('search', '').strip()
    status_filter = request.GET.get('status', '').strip()
    
    tales = Tale.objects.select_related('author').annotate(chapter_count=Count('chapters')).all()
    if search:
        tales = tales.filter(
            Q(title__icontains=search) | Q(description__icontains=search) | Q(author__username__icontains=search)
        )
    if status_filter == 'hidden':
        tales = tales.filter(is_hidden=True)
    elif status_filter == 'archived':
        tales = tales.filter(is_archived=True)
    elif status_filter == 'active':
        tales = tales.filter(is_hidden=False, is_archived=False)
        
    limit = int(request.GET.get('limit', 20))
    offset = int(request.GET.get('offset', 0))
    total = tales.count()
    tales_page = tales[offset:offset+limit]
    
    data = []
    for t in tales_page:
        data.append({
            'id': t.id,
            'title': t.title,
            'subtitle': t.subtitle,
            'author': t.author.username,
            'chapter_count': t.chapter_count,
            'is_public': t.is_public,
            'created_at': t.created_at,
            'is_hidden': t.is_hidden,
            'is_archived': t.is_archived
        })
        
    return Response({'total': total, 'tales': data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_tale_action(request, pk):
    if not check_staff_role(request, ['MODERATOR']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    tale = get_object_or_404(Tale, pk=pk)
    action = request.data.get('action')
    reason = request.data.get('reason', '').strip()
    
    if action == 'hide':
        tale.is_hidden = True
        tale.save()
        log_admin_action(request.user, "HIDE_TALE", "TALE", tale.id, reason)
    elif action == 'restore':
        tale.is_hidden = False
        tale.is_archived = False
        tale.save()
        log_admin_action(request.user, "RESTORE_TALE", "TALE", tale.id, reason)
    elif action == 'archive':
        tale.is_archived = True
        tale.save()
        log_admin_action(request.user, "ARCHIVE_TALE", "TALE", tale.id, reason)
    else:
        return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
    return Response({"status": "success"})

# 7. Communities Management
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_communities_list(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    search = request.GET.get('search', '').strip()
    status_filter = request.GET.get('status', '').strip()
    
    communities = Community.objects.select_related('owner').annotate(member_count=Count('memberships')).all()
    if search:
        communities = communities.filter(
            Q(title__icontains=search) | Q(description__icontains=search) | Q(owner__username__icontains=search)
        )
    if status_filter == 'locked':
        communities = communities.filter(is_locked=True)
    elif status_filter == 'archived':
        communities = communities.filter(is_archived=True)
    elif status_filter == 'active':
        communities = communities.filter(is_archived=False, is_locked=False)
        
    limit = int(request.GET.get('limit', 20))
    offset = int(request.GET.get('offset', 0))
    total = communities.count()
    communities_page = communities[offset:offset+limit]
    
    data = []
    for c in communities_page:
        data.append({
            'id': c.id,
            'title': c.title,
            'owner': c.owner.username,
            'member_count': c.member_count,
            'community_type': c.community_type,
            'is_archived': c.is_archived,
            'is_locked': c.is_locked,
            'created_at': c.created_at
        })
        
    return Response({'total': total, 'communities': data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_community_action(request, pk):
    action = request.data.get('action')
    reason = request.data.get('reason', '').strip()

    # Delete is ADMIN-only; all other actions require MODERATOR
    if action == 'delete':
        if not check_staff_role(request, ['ADMIN']):
            return Response({"detail": "Only Admins can permanently delete communities."}, status=status.HTTP_403_FORBIDDEN)
    else:
        if not check_staff_role(request, ['MODERATOR']):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    community = get_object_or_404(Community, pk=pk)
    
    if action == 'archive':
        community.is_archived = True
        community.save()
        log_admin_action(request.user, "ARCHIVE_COMMUNITY", "COMMUNITY", community.id, reason)
    elif action == 'restore':
        community.is_archived = False
        community.is_locked = False
        community.save()
        log_admin_action(request.user, "RESTORE_COMMUNITY", "COMMUNITY", community.id, reason)
    elif action == 'lock':
        community.is_locked = True
        community.save()
        log_admin_action(request.user, "LOCK_COMMUNITY", "COMMUNITY", community.id, reason)
    elif action == 'unlock':
        community.is_locked = False
        community.save()
        log_admin_action(request.user, "UNLOCK_COMMUNITY", "COMMUNITY", community.id, reason)
    elif action == 'delete':
        title_snapshot = community.title
        comm_id_snapshot = community.id
        community.delete()
        log_admin_action(request.user, "DELETE_COMMUNITY", "COMMUNITY", comm_id_snapshot, f"Permanently deleted community '{title_snapshot}'. Reason: {reason}")
        return Response({"status": "deleted"})
    else:
        return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
    return Response({"status": "success"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_community_details(request, pk):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    community = get_object_or_404(Community, pk=pk)
    
    admins = Membership.objects.filter(community=community, role='ADMIN').select_related('user')
    co_admins = Membership.objects.filter(community=community, role='CO_ADMIN').select_related('user')
    banned_members = CommunityBan.objects.filter(community=community).select_related('user')
    join_requests = CommunityJoinRequest.objects.filter(community=community, status='PENDING').select_related('user')
    
    return Response({
        'admins': [{'id': m.user.id, 'username': m.user.username} for m in admins],
        'co_admins': [{'id': m.user.id, 'username': m.user.username} for m in co_admins],
        'banned_members': [{'id': b.user.id, 'username': b.user.username, 'reason': b.reason} for b in banned_members],
        'join_requests': [{'id': r.user.id, 'username': r.user.username, 'created_at': r.created_at} for r in join_requests]
    })

# 8. Community Messages Moderation
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_messages_list(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    search = request.GET.get('search', '').strip()
    status_filter = request.GET.get('status', '').strip()
    
    messages = CommunityMessage.objects.select_related('author', 'community').all()
    if search:
        messages = messages.filter(
            Q(content__icontains=search) | Q(author__username__icontains=search) | Q(community__title__icontains=search)
        )
    if status_filter == 'deleted':
        messages = messages.filter(is_deleted=True)
    elif status_filter == 'active':
        messages = messages.filter(is_deleted=False)
        
    limit = int(request.GET.get('limit', 30))
    offset = int(request.GET.get('offset', 0))
    total = messages.count()
    messages_page = messages[offset:offset+limit]
    
    data = []
    for msg in messages_page:
        data.append({
            'id': msg.id,
            'community_title': msg.community.title if msg.community else 'None',
            'author': msg.author.username,
            'content': msg.content,
            'image': request.build_absolute_uri(msg.image.url) if msg.image else None,
            'created_at': msg.created_at,
            'is_deleted': msg.is_deleted
        })
        
    return Response({'total': total, 'messages': data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_message_action(request, pk):
    if not check_staff_role(request, ['MODERATOR']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    msg = get_object_or_404(CommunityMessage, pk=pk)
    action = request.data.get('action')
    reason = request.data.get('reason', '').strip()
    
    if action == 'soft_delete':
        msg.is_deleted = True
        msg.deleted_by = request.user
        msg.save()
        log_admin_action(request.user, "SOFT_DELETE_MESSAGE", "COMMUNITY_MESSAGE", msg.id, reason)
    elif action == 'restore':
        msg.is_deleted = False
        msg.deleted_by = None
        msg.save()
        log_admin_action(request.user, "RESTORE_MESSAGE", "COMMUNITY_MESSAGE", msg.id, reason)
    else:
        return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
    return Response({"status": "success"})

# 9. Reports Center
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_reports_list(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    status_filter = request.GET.get('status', '').strip()
    reason_filter = request.GET.get('reason', '').strip()
    
    reports = Report.objects.select_related('reporter', 'content_type').order_by('-created_at')
    
    if status_filter:
        reports = reports.filter(status=status_filter)
    if reason_filter:
        reports = reports.filter(reason=reason_filter)
        
    limit = int(request.GET.get('limit', 20))
    offset = int(request.GET.get('offset', 0))
    total = reports.count()
    reports_page = reports[offset:offset+limit]
    
    data = []
    for r in reports_page:
        reported_obj = r.content_object
        reported_title = "Unknown Object"
        reported_owner = "Unknown"
        
        # Format reported object based on type
        if reported_obj:
            model_name = r.content_type.model
            if model_name == 'user':
                reported_title = f"User: {reported_obj.username}"
                reported_owner = reported_obj.username
            elif model_name == 'memorial':
                reported_title = f"Memorial: {reported_obj.full_name}"
                reported_owner = reported_obj.owner.username
            elif model_name == 'tale':
                reported_title = f"Tale: {reported_obj.title}"
                reported_owner = reported_obj.author.username
            elif model_name == 'community':
                reported_title = f"Community: {reported_obj.title}"
                reported_owner = reported_obj.owner.username
            elif model_name == 'communitymessage':
                reported_title = f"Community Message: {reported_obj.content[:30]}..."
                reported_owner = reported_obj.author.username
            elif model_name == 'memory':
                reported_title = f"Memory: {reported_obj.title}"
                reported_owner = reported_obj.author.username
                
        data.append({
            'id': r.id,
            'reporter': r.reporter.username,
            'reason': r.reason,
            'description': r.description,
            'status': r.status,
            'created_at': r.created_at,
            'reported_type': r.content_type.model,
            'reported_id': r.object_id,
            'reported_title': reported_title,
            'reported_owner': reported_owner
        })
        
    return Response({'total': total, 'reports': data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_report_action(request, pk):
    if not check_staff_role(request, ['MODERATOR']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    report = get_object_or_404(Report, pk=pk)
    action = request.data.get('action')
    reason = request.data.get('reason', '').strip()
    
    if action == 'approve':
        report.status = 'APPROVED'
        report.save()
        log_admin_action(request.user, "APPROVE_REPORT", "REPORT", report.id, reason)
    elif action == 'reject':
        report.status = 'REJECTED'
        report.save()
        log_admin_action(request.user, "REJECT_REPORT", "REPORT", report.id, reason)
    elif action == 'warn_user':
        # Warn user (create simple report warning / log / mock notification)
        reported_obj = report.content_object
        if reported_obj:
            # Map object to author
            author = None
            if hasattr(reported_obj, 'author'):
                author = reported_obj.author
            elif hasattr(reported_obj, 'owner'):
                author = reported_obj.owner
            elif isinstance(reported_obj, User):
                author = reported_obj
                
            if author:
                # Can write a notice in admin_notes or prepare user-facing alert
                author.admin_notes += f"\n[WARNING ON REPORT #{report.id}] Reason: {reason}"
                author.save()
                
        report.status = 'APPROVED'
        report.save()
        log_admin_action(request.user, "WARN_USER_REPORT", "REPORT", report.id, f"Warned user. {reason}")
    elif action == 'hide_content':
        # Hide the reported content (Memorial or Tale or Message)
        reported_obj = report.content_object
        if reported_obj:
            if hasattr(reported_obj, 'is_hidden'):
                reported_obj.is_hidden = True
                reported_obj.save()
            elif hasattr(reported_obj, 'is_deleted'):
                reported_obj.is_deleted = True
                reported_obj.deleted_by = request.user
                reported_obj.save()
                
        report.status = 'APPROVED'
        report.save()
        log_admin_action(request.user, "HIDE_CONTENT_REPORT", "REPORT", report.id, f"Hid reported content. {reason}")
    elif action == 'ban_user':
        # Requires Admin
        if not check_staff_role(request, ['ADMIN']):
            return Response({"detail": "Only Admins can ban users via reports."}, status=status.HTTP_403_FORBIDDEN)
            
        reported_obj = report.content_object
        if reported_obj:
            author = None
            if hasattr(reported_obj, 'author'):
                author = reported_obj.author
            elif hasattr(reported_obj, 'owner'):
                author = reported_obj.owner
            elif isinstance(reported_obj, User):
                author = reported_obj
                
            if author:
                author.is_banned = True
                author.ban_reason = f"Banned due to report #{report.id}: {reason}"
                author.save()
                
        report.status = 'APPROVED'
        report.save()
        log_admin_action(request.user, "BAN_USER_REPORT", "REPORT", report.id, f"Banned content author. {reason}")
    else:
        return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
    return Response({"status": "success"})

# 10. Media Library
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_media_list(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    file_type = request.GET.get('type', '').strip()  # 'image' or 'audio'
    user_search = request.GET.get('user', '').strip()
    
    media_items = []
    
    # 1. Profile images
    profiles = Profile.objects.filter(profile_image__isnull=False).exclude(profile_image='').select_related('user')
    if user_search:
        profiles = profiles.filter(user__username__icontains=user_search)
    for p in profiles:
        media_items.append({
            'id': f"profile-{p.id}",
            'url': request.build_absolute_uri(p.profile_image.url),
            'name': os.path.basename(p.profile_image.name),
            'type': 'image',
            'model': 'Profile',
            'owner': p.user.username,
            'uploaded_at': p.user.date_joined # fallback
        })
        
    # 2. Memorial covers & profiles
    mems = Memorial.objects.select_related('owner')
    if user_search:
        mems = mems.filter(owner__username__icontains=user_search)
    for m in mems:
        if m.profile_image and m.profile_image.name:
            media_items.append({
                'id': f"mem-profile-{m.id}",
                'url': request.build_absolute_uri(m.profile_image.url),
                'name': os.path.basename(m.profile_image.name),
                'type': 'image',
                'model': 'Memorial (Profile)',
                'owner': m.owner.username,
                'uploaded_at': m.created_at
            })
        if m.cover_image and m.cover_image.name:
            media_items.append({
                'id': f"mem-cover-{m.id}",
                'url': request.build_absolute_uri(m.cover_image.url),
                'name': os.path.basename(m.cover_image.name),
                'type': 'image',
                'model': 'Memorial (Cover)',
                'owner': m.owner.username,
                'uploaded_at': m.created_at
            })
            
    # 3. MemorialPhotos
    photos = MemorialPhoto.objects.select_related('memorial__owner')
    if user_search:
        photos = photos.filter(memorial__owner__username__icontains=user_search)
    for ph in photos:
        media_items.append({
            'id': f"photo-{ph.id}",
            'url': request.build_absolute_uri(ph.image.url),
            'name': os.path.basename(ph.image.name),
            'type': 'image',
            'model': 'MemorialPhoto',
            'owner': ph.memorial.owner.username,
            'uploaded_at': ph.created_at
        })
        
    # 4. Memories (Images & Voice Notes)
    mems_data = Memory.objects.select_related('author')
    if user_search:
        mems_data = mems_data.filter(author__username__icontains=user_search)
    for my in mems_data:
        if my.image and my.image.name:
            media_items.append({
                'id': f"memory-img-{my.id}",
                'url': request.build_absolute_uri(my.image.url),
                'name': os.path.basename(my.image.name),
                'type': 'image',
                'model': 'Memory (Image)',
                'owner': my.author.username,
                'uploaded_at': my.created_at
            })
        if my.voice_note and my.voice_note.name:
            media_items.append({
                'id': f"memory-audio-{my.id}",
                'url': request.build_absolute_uri(my.voice_note.url),
                'name': os.path.basename(my.voice_note.name),
                'type': 'audio',
                'model': 'Memory (Voice Note)',
                'owner': my.author.username,
                'uploaded_at': my.created_at
            })
            
    # 5. Community Icon / Covers
    comms = Community.objects.select_related('owner')
    if user_search:
        comms = comms.filter(owner__username__icontains=user_search)
    for c in comms:
        if c.icon_image and c.icon_image.name:
            media_items.append({
                'id': f"comm-icon-{c.id}",
                'url': request.build_absolute_uri(c.icon_image.url),
                'name': os.path.basename(c.icon_image.name),
                'type': 'image',
                'model': 'Community (Icon)',
                'owner': c.owner.username,
                'uploaded_at': c.created_at
            })
        if c.cover_image and c.cover_image.name:
            media_items.append({
                'id': f"comm-cover-{c.id}",
                'url': request.build_absolute_uri(c.cover_image.url),
                'name': os.path.basename(c.cover_image.name),
                'type': 'image',
                'model': 'Community (Cover)',
                'owner': c.owner.username,
                'uploaded_at': c.created_at
            })
            
    # 6. CommunityMessages
    cms = CommunityMessage.objects.filter(image__isnull=False).exclude(image='').select_related('author')
    if user_search:
        cms = cms.filter(author__username__icontains=user_search)
    for cm in cms:
        media_items.append({
            'id': f"comm-msg-{cm.id}",
            'url': request.build_absolute_uri(cm.image.url),
            'name': os.path.basename(cm.image.name),
            'type': 'image',
            'model': 'CommunityMessage',
            'owner': cm.author.username,
            'uploaded_at': cm.created_at
        })
        
    # Filters
    if file_type:
        media_items = [m for m in media_items if m['type'] == file_type]
        
    # Sort by upload date descending
    media_items.sort(key=lambda x: x['uploaded_at'] if x['uploaded_at'] else timezone.now(), reverse=True)
    
    # Storage sum
    total_storage = Profile.objects.aggregate(total=Sum('storage_used'))['total'] or 0
    
    return Response({
        'media': media_items[:100],  # cap at 100 for dev efficiency
        'total_storage_used': total_storage
    })

# 11. Memorial Ownership Requests
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_ownership_requests_list(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    reqs = MemorialOwnershipRequest.objects.select_related('memorial', 'requester', 'current_owner').order_by('-created_at')
    
    status_filter = request.GET.get('status', '').strip()
    if status_filter:
        reqs = reqs.filter(status=status_filter)
        
    data = []
    for r in reqs:
        data.append({
            'id': r.id,
            'memorial_id': r.memorial.id,
            'memorial_name': r.memorial.full_name,
            'requester': r.requester.username,
            'current_owner': r.current_owner.username if r.current_owner else 'None',
            'claim_reason': r.claim_reason,
            'proof_description': r.proof_description,
            'status': r.status,
            'created_at': r.created_at
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_ownership_request_action(request, pk):
    if not check_staff_role(request, ['MODERATOR']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    req = get_object_or_404(MemorialOwnershipRequest, pk=pk)
    action = request.data.get('action')
    reason = request.data.get('reason', '').strip()
    
    if action == 'approve':
        req.status = 'APPROVED'
        # Ownership Transfer
        req.memorial.owner = req.requester
        req.memorial.save()
        req.save()
        
        log_admin_action(request.user, "APPROVE_OWNERSHIP", "OWNERSHIP_REQUEST", req.id, f"Transferred memorial '{req.memorial.full_name}' to {req.requester.username}. {reason}")
    elif action == 'reject':
        req.status = 'REJECTED'
        req.save()
        log_admin_action(request.user, "REJECT_OWNERSHIP", "OWNERSHIP_REQUEST", req.id, reason)
    else:
        return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
    return Response({"status": "success"})

# 12. Platform Status
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_platform_status(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    status_obj, created = PlatformStatus.objects.get_or_create(id=1)
    
    if request.method == 'POST':
        # Changing platform settings requires ADMIN
        if not check_staff_role(request, ['ADMIN']):
            return Response({"detail": "Only Admins can modify platform status controls."}, status=status.HTTP_403_FORBIDDEN)
            
        status_obj.maintenance_mode = request.data.get('maintenance_mode', status_obj.maintenance_mode)
        status_obj.announcement_banner = request.data.get('announcement_banner', status_obj.announcement_banner)
        status_obj.banner_enabled = request.data.get('banner_enabled', status_obj.banner_enabled)
        
        backup_stamp = request.data.get('last_backup_at')
        if backup_stamp:
            status_obj.last_backup_at = backup_stamp
            
        status_obj.save()
        log_admin_action(request.user, "UPDATE_PLATFORM_STATUS", "SETTINGS", "1", f"Maint={status_obj.maintenance_mode}, Banner={status_obj.banner_enabled}")
        
    return Response({
        'maintenance_mode': status_obj.maintenance_mode,
        'announcement_banner': status_obj.announcement_banner,
        'banner_enabled': status_obj.banner_enabled,
        'last_backup_at': status_obj.last_backup_at,
        'updated_at': status_obj.updated_at
    })

# 13. Database Health
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_database_health(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    start_time = time.time()
    
    # 1. Supabase Status & Connections
    current_conns = 1
    max_conns = 100
    db_status = "Connected"
    db_size_gb = 0.0
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            if connection.vendor == 'postgresql':
                cursor.execute("SELECT count(*) FROM pg_stat_activity;")
                current_conns = cursor.fetchone()[0]
                cursor.execute("show max_connections;")
                max_conns = int(cursor.fetchone()[0])
                
                # DB Size
                db_name = connection.settings_dict.get('NAME', 'postgres')
                cursor.execute("SELECT pg_database_size(%s);", [db_name])
                db_size_bytes = cursor.fetchone()[0]
                db_size_gb = db_size_bytes / (1024 ** 3)
            else:
                # SQLite
                db_path = settings.DATABASES['default']['NAME']
                if os.path.exists(db_path):
                    db_size_bytes = os.path.getsize(db_path)
                    db_size_gb = db_size_bytes / (1024 ** 3)
    except Exception:
        db_status = "Offline"
        
    # 2. Cloudinary status
    cloudinary_status = "Offline"
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
        try:
            import cloudinary.api
            res = cloudinary.api.ping()
            if res.get('status') == 'ok':
                cloudinary_status = "Connected"
        except Exception:
            pass
            
    # 3. Storage Usage
    total_storage = Profile.objects.aggregate(total=Sum('storage_used'))['total'] or 0
    
    # 4. API Latency
    latency_ms = int((time.time() - start_time) * 1000)
    
    # 5. Backup info
    status_obj = PlatformStatus.objects.first()
    last_backup = status_obj.last_backup_at if status_obj else None
    
    return Response({
        'database': {
            'status': db_status,
            'connections': current_conns,
            'connection_limit': max_conns,
            'size_gb': round(db_size_gb, 4)
        },
        'cloudinary': {
            'status': cloudinary_status,
            'total_storage_used_bytes': total_storage
        },
        'render': {
            'status': 'Active' if os.environ.get('RENDER') else 'Local Dev'
        },
        'redis': {
            'status': 'Not Configured'
        },
        'api_latency_ms': latency_ms,
        'last_backup': last_backup
    })

# 14. Audit Logs API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_audit_logs_list(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    search = request.GET.get('search', '').strip()
    target_type = request.GET.get('target_type', '').strip()
    
    logs = AuditLog.objects.select_related('admin').all()
    
    if search:
        logs = logs.filter(
            Q(admin__username__icontains=search) | Q(action__icontains=search) | Q(reason__icontains=search)
        )
    if target_type:
        logs = logs.filter(target_type=target_type)
        
    limit = int(request.GET.get('limit', 20))
    offset = int(request.GET.get('offset', 0))
    total = logs.count()
    logs_page = logs[offset:offset+limit]
    
    data = []
    for l in logs_page:
        data.append({
            'id': l.id,
            'admin': l.admin.username,
            'action': l.action,
            'target_type': l.target_type,
            'target_id': l.target_id,
            'reason': l.reason,
            'timestamp': l.timestamp
        })
        
    return Response({'total': total, 'logs': data})

# 15. Emergency Recovery Center API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_recovery_list(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    hidden_memorials = Memorial.objects.filter(is_hidden=True).values('id', 'full_name', 'owner__username', 'created_at')
    archived_memorials = Memorial.objects.filter(is_archived=True).values('id', 'full_name', 'owner__username', 'created_at')
    
    hidden_tales = Tale.objects.filter(is_hidden=True).values('id', 'title', 'author__username', 'created_at')
    archived_tales = Tale.objects.filter(is_archived=True).values('id', 'title', 'author__username', 'created_at')
    
    archived_communities = Community.objects.filter(is_archived=True).values('id', 'title', 'owner__username', 'created_at')
    deleted_messages = CommunityMessage.objects.filter(is_deleted=True).values('id', 'content', 'author__username', 'community__title', 'created_at')
    
    return Response({
        'hidden_memorials': list(hidden_memorials),
        'archived_memorials': list(archived_memorials),
        'hidden_tales': list(hidden_tales),
        'archived_tales': list(archived_tales),
        'archived_communities': list(archived_communities),
        'deleted_messages': list(deleted_messages)
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_recovery_restore(request):
    if not check_staff_role(request, ['MODERATOR']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    target_type = request.data.get('target_type')  # 'MEMORIAL', 'TALE', 'COMMUNITY', 'COMMUNITY_MESSAGE'
    target_id = request.data.get('target_id')
    reason = request.data.get('reason', 'Restored from Recovery Center').strip()
    
    if not target_type or not target_id:
        return Response({"detail": "target_type and target_id are required"}, status=status.HTTP_400_BAD_REQUEST)
        
    if target_type == 'MEMORIAL':
        obj = get_object_or_404(Memorial, pk=target_id)
        obj.is_hidden = False
        obj.is_archived = False
        obj.save()
        log_admin_action(request.user, "RESTORE_MEMORIAL", "MEMORIAL", obj.id, reason)
    elif target_type == 'TALE':
        obj = get_object_or_404(Tale, pk=target_id)
        obj.is_hidden = False
        obj.is_archived = False
        obj.save()
        log_admin_action(request.user, "RESTORE_TALE", "TALE", obj.id, reason)
    elif target_type == 'COMMUNITY':
        obj = get_object_or_404(Community, pk=target_id)
        obj.is_archived = False
        obj.save()
        log_admin_action(request.user, "RESTORE_COMMUNITY", "COMMUNITY", obj.id, reason)
    elif target_type == 'COMMUNITY_MESSAGE':
        obj = get_object_or_404(CommunityMessage, pk=target_id)
        obj.is_deleted = False
        obj.deleted_by = None
        obj.save()
        log_admin_action(request.user, "RESTORE_MESSAGE", "COMMUNITY_MESSAGE", obj.id, reason)
    else:
        return Response({"detail": "Invalid target type"}, status=status.HTTP_400_BAD_REQUEST)
        
    return Response({"status": "success"})

# Public Submit Endpoint for Contact Page
@api_view(['POST'])
@permission_classes([])
def public_submit_contact(request):
    name = request.data.get('name', '').strip()
    email = request.data.get('email', '').strip()
    message = request.data.get('message', '').strip()
    
    if not name or not email or not message:
        return Response({"detail": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
        
    ContactMessage.objects.create(name=name, email=email, message=message)
    return Response({"status": "success"})

# Admin Panel Contact Messages endpoint
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_contact_messages(request):
    if not check_staff_role(request, ['SUPPORT']):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
    if request.method == 'POST':
        if not check_staff_role(request, ['MODERATOR']):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            
        pk = request.data.get('id')
        new_status = request.data.get('status')
        msg = get_object_or_404(ContactMessage, pk=pk)
        if new_status in ['PENDING', 'RESOLVED']:
            msg.status = new_status
            msg.save()
            log_admin_action(request.user, "RESOLVE_CONTACT", "CONTACT_MESSAGE", msg.id, f"Status updated to {new_status}")
            return Response({"status": "success"})
        return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        
    msgs = ContactMessage.objects.all().order_by('-created_at')
    
    status_filter = request.GET.get('status', '').strip()
    if status_filter:
        msgs = msgs.filter(status=status_filter)
        
    limit = int(request.GET.get('limit', 20))
    offset = int(request.GET.get('offset', 0))
    total = msgs.count()
    msgs_page = msgs[offset:offset+limit]
    
    data = []
    for m in msgs_page:
        data.append({
            'id': m.id,
            'name': m.name,
            'email': m.email,
            'message': m.message,
            'status': m.status,
            'created_at': m.created_at
        })
        
    return Response({'total': total, 'messages': data})

from django.contrib.auth.hashers import make_password

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_add_staff(request):
    if not check_staff_role(request, ['ADMIN']):
        return Response({'detail': 'Only Super Admins can create staff accounts.'}, status=status.HTTP_403_FORBIDDEN)
        
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    role = request.data.get('role', 'SUPPORT')
    
    if not all([username, email, password]):
        return Response({'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(username=username).exists():
        return Response({'detail': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(email=email).exists():
        return Response({'detail': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if role not in ['ADMIN', 'MODERATOR', 'SUPPORT']:
        return Response({'detail': 'Invalid role.'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.create(
        username=username,
        email=email,
        password=make_password(password),
        role=role,
        is_staff=True,
        is_superuser=(role == 'ADMIN')
    )
    
    log_admin_action(request.user, 'CREATE_STAFF', 'USER', user.id, f'Created {role} account: {username}')
    
    return Response({'status': 'success', 'user_id': user.id})

