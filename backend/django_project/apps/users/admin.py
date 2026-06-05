from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Профиль'
    fields = ('role', 'telegram_id')
    extra = 0

class CustomUserAdmin(UserAdmin):
    inlines = [UserProfileInline]
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_role')
    
    def get_role(self, obj):
        return obj.profile.role
    get_role.short_description = 'Роль'

# Перерегистрируем модель User с новым админом
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# Также можно отдельно зарегистрировать Profile
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'telegram_id')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')