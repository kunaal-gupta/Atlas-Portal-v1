from rest_framework.permissions import BasePermission, SAFE_METHODS


def get_portal_access(user):
    if not user or not user.is_authenticated or not user.is_active:
        return None
    if user.is_superuser:
        return "write"
    try:
        access = user.portal_access
    except AttributeError:
        return None
    return access.role if access.is_enabled else None


class HasPortalAccess(BasePermission):
    message = "Your portal access is disabled. Contact an administrator."

    def has_permission(self, request, view):
        return get_portal_access(request.user) is not None


class HasPortalWriteAccess(HasPortalAccess):
    message = "Write access is required for this action."

    def has_permission(self, request, view):
        role = get_portal_access(request.user)
        return role is not None and (request.method in SAFE_METHODS or role == "write")
