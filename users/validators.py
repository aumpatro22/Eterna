import os
import io
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import UploadedFile
from PIL import Image

def validate_image_file(file):
    if not file:
        return
    # Check size: 5MB
    if file.size > 5 * 1024 * 1024:
        raise ValidationError("Image file size exceeds the limit of 5MB.")
    
    # Check extension
    ext = os.path.splitext(file.name)[1].lower().strip('.')
    if ext not in ['jpg', 'jpeg', 'png', 'webp']:
        raise ValidationError(f"Extension .{ext} is not allowed for images.")
    
    # Check content type (MIME) if available
    content_type = getattr(file, 'content_type', None)
    if content_type and content_type.lower() not in ['image/jpeg', 'image/png', 'image/webp']:
        raise ValidationError(f"MIME type '{content_type}' is not allowed for images.")
    
    # Deep verification of image bytes
    try:
        file.seek(0)
        file_bytes = file.read()
        file.seek(0)
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
    except Exception:
        raise ValidationError("Invalid or corrupted image file.")

def validate_audio_file(file):
    if not file:
        return
    # Check size: 20MB
    if file.size > 20 * 1024 * 1024:
        raise ValidationError("Audio file size exceeds the limit of 20MB.")
    
    # Check extension
    ext = os.path.splitext(file.name)[1].lower().strip('.')
    if ext not in ['mp3', 'wav', 'm4a']:
        raise ValidationError(f"Extension .{ext} is not allowed for audio.")
    
    # Check content type (MIME) if available
    content_type = getattr(file, 'content_type', None)
    if content_type and content_type.lower() not in ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/x-pn-wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a']:
        raise ValidationError(f"MIME type '{content_type}' is not allowed for audio.")
    
    # Verify magic bytes for audio
    file.seek(0)
    header = file.read(64)
    file.seek(0)
    
    is_valid = False
    if ext == 'wav' and header.startswith(b'RIFF') and b'WAVE' in header[8:16]:
        is_valid = True
    elif ext == 'mp3' and (header.startswith(b'ID3') or header.startswith(b'\xff\xfb') or header.startswith(b'\xff\xf3') or header.startswith(b'\xff\xf2')):
        is_valid = True
    elif ext == 'm4a' and b'ftyp' in header[4:12]:
        is_valid = True
    
    if not is_valid:
        raise ValidationError("Invalid or corrupted audio file.")

def optimize_image(field, max_dimension=1200, quality=80):
    if not field or not field.name:
        return
    
    # Only optimize if it's a new upload (isinstance of UploadedFile)
    if hasattr(field, 'file') and isinstance(field.file, UploadedFile):
        try:
            field.seek(0)
            img = Image.open(field)
            
            # Check if it needs resizing
            width, height = img.size
            if width > max_dimension or height > max_dimension:
                if width > height:
                    new_width = max_dimension
                    new_height = int(height * (max_dimension / width))
                else:
                    new_height = max_dimension
                    new_width = int(width * (max_dimension / height))
                # Convert palette/transparency to RGB or RGBA
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGBA')
                else:
                    img = img.convert('RGB')
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            else:
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGBA')
                else:
                    img = img.convert('RGB')
            
            # Convert to WebP
            output = io.BytesIO()
            img.save(output, format='WEBP', quality=quality)
            output.seek(0)
            
            # Change filename extension to .webp
            name = os.path.basename(field.name)
            base_name, _ = os.path.splitext(name)
            new_name = f"{base_name}.webp"
            
            # Save back to the field without calling save() recursively
            field.save(new_name, ContentFile(output.read()), save=False)
        except Exception as e:
            # Silently log/ignore optimization errors to avoid blocking the request
            pass
