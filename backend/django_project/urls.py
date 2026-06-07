from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from chat.views import ChatViewSet
from demo_data.views import SalesDataViewSet
from users.views import UserViewSet

router = DefaultRouter()
router.register(r'chat', ChatViewSet, basename='chat')
router.register(r'sales', SalesDataViewSet, basename='sales')
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/', include('suppliers.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]