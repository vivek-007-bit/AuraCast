"""
WSGI config for auracast_project.
Exposes WSGI callable as `application` and `app` for Vercel serverless functions.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auracast_project.settings")

application = get_wsgi_application()
app = application
