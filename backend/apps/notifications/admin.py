from django.contrib import admin

from .models import PickupNotification, RecipientPreference


@admin.register(RecipientPreference)
class RecipientPreferenceAdmin(admin.ModelAdmin):
    list_display = ("phone", "name", "notify_sms", "notify_wechat", "notify_app", "updated_at")
    list_filter = ("notify_sms", "notify_wechat", "notify_app")
    search_fields = ("phone", "name", "wechat_id", "app_user_id")


@admin.register(PickupNotification)
class PickupNotificationAdmin(admin.ModelAdmin):
    list_display = ("parcel", "channel", "recipient", "status", "created_at")
    list_filter = ("channel", "status")
    search_fields = ("recipient", "parcel__tracking_no")
