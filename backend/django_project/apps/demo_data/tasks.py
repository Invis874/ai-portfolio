from celery import shared_task
from django.utils import timezone
from .models import SalesData

@shared_task
def generate_daily_sales_report():
    """Генерация отчета о продажах за день"""
    today = timezone.now().date()
    today_sales = SalesData.objects.filter(date=today)
    
    total_quantity = today_sales.aggregate(total=models.Sum('quantity'))['total'] or 0
    total_revenue = today_sales.aggregate(total=models.Sum('revenue'))['total'] or 0
    
    report = f"📈 Daily Sales Report ({today}):\n"
    report += f"   Total orders: {today_sales.count()}\n"
    report += f"   Total quantity: {total_quantity}\n"
    report += f"   Total revenue: {total_revenue}₽"
    
    print(report)
    return report