from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    """Расширение профиля пользователя"""
    ROLE_CHOICES = [
        ('guest', 'Гость'),
        ('operator', 'Оператор'),
        ('admin', 'Администратор'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest')
    telegram_id = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"
    
    @property
    def is_operator(self):
        return self.role in ['operator', 'admin']

# Автоматическое создание профиля при регистрации пользователя
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()