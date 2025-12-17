
# Mozaic Portal: Backend Architecture

## Technology Stack
- **Framework**: Django 4.2+
- **API**: Django REST Framework (DRF)
- **Database**: PostgreSQL
- **Auth**: JWT (SimpleJWT) with LDAP/SSO integration
- **File Storage**: Local filesystem (dev/temp) or S3 (prod)

## Core Models

### 1. News
```python
class NewsArticle(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_ref=models.CASCADE)
    category = models.CharField(max_length=100)
    image = models.ImageField(upload_to='news/')
    published_date = models.DateTimeField(auto_now_add=True)
    views_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
```

### 2. Resources (Quick Links)
```python
class Category(models.Model):
    name = models.CharField(max_length=100)
    icon_name = models.CharField(max_length=50) # Lucide icon name
    order = models.IntegerField(default=0)

class ResourceLink(models.Model):
    category = models.ForeignKey(Category, related_name='links')
    title = models.CharField(max_length=200)
    url = models.URLField()
    file = models.FileField(upload_to='resources/', null=True, blank=True)
```

### 3. Events
```python
class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255)
    created_by = models.ForeignKey(User)
```

## API Endpoints (DRF)

- `GET /api/news/`: List news articles
- `GET /api/news/featured/`: Get the primary highlighted article
- `GET /api/categories/`: Get all Easy Access categories and their links
- `GET /api/events/upcoming/`: List future events
- `POST /api/resources/upload/`: Admin endpoint for file uploads

## File Upload Flow (Local Filesystem)

1. **Upload**: User selects a file in React.
2. **Transfer**: React sends a `multipart/form-data` POST request to `/api/resources/upload/`.
3. **Processing**: Django's `FileField` handles the save to `MEDIA_ROOT/resources/`.
4. **Download**: The API returns a static URL (e.g., `/media/resources/branding-guide.pdf`) which the client can use in an `<a>` tag or a download button.
5. **Security**: Use DRF `PermissionClasses` (e.g., `IsAuthenticated`) to ensure only internal agents can access files.
