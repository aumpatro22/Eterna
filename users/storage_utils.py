from django.core.exceptions import ValidationError

def check_user_storage_limit(user, new_file_size):
    if not user or not user.is_authenticated:
        return
    profile = getattr(user, 'profile', None)
    if not profile:
        return
    if profile.storage_used + new_file_size > profile.storage_limit:
        raise ValidationError(f"Storage limit reached ({profile.storage_limit // 1048576}MB). Cannot upload more files.")

def add_user_storage(user, size):
    if not user or not user.is_authenticated or size == 0:
        return
    try:
        profile = user.profile
        profile.storage_used = max(0, profile.storage_used + size)
        profile.save(update_fields=['storage_used'])
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to update storage_used: {e}")

def handle_storage_pre_save(instance, file_fields, user):
    if not user or not user.is_authenticated:
        return 0
    is_new = instance.pk is None
    old_sizes = {}
    old_instance = None
    if not is_new:
        try:
            old_instance = instance.__class__.objects.get(pk=instance.pk)
            for field_name in file_fields:
                old_file = getattr(old_instance, field_name)
                if old_file:
                    old_sizes[field_name] = old_file.size
        except Exception:
            pass

    total_delta = 0
    for field_name in file_fields:
        new_file = getattr(instance, field_name)
        old_file_val = getattr(old_instance, field_name) if old_instance else None
        
        # If file is updated or newly added
        if new_file and (is_new or new_file.name != getattr(old_file_val, 'name', None)):
            try:
                new_size = new_file.size
            except Exception:
                new_size = 0
            old_size = old_sizes.get(field_name, 0)
            total_delta += (new_size - old_size)
        elif not new_file and old_file_val:
            # File was cleared/removed
            old_size = old_sizes.get(field_name, 0)
            total_delta -= old_size

    if total_delta > 0:
        check_user_storage_limit(user, total_delta)
    
    return total_delta

def handle_storage_delete(instance, file_fields, user):
    if not user or not user.is_authenticated:
        return
    total_size = 0
    for field_name in file_fields:
        file = getattr(instance, field_name)
        if file:
            try:
                total_size += file.size
            except Exception:
                pass
    if total_size > 0:
        add_user_storage(user, -total_size)
