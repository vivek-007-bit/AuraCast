"""
URL configuration for auracast_project.
All endpoints are strictly JSON under /api/v1/.
"""

from django.urls import path, include

urlpatterns = [
    path("api/v1/", include("api.urls")),
]
