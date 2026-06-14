from django.db import models


class RecipientPreference(models.Model):
    phone = models.CharField(max_length=30, unique=True, db_index=True)
    name = models.CharField(max_length=40, blank=True)
    notify_sms = models.BooleanField(default=True)
    notify_wechat = models.BooleanField(default=False)
    notify_app = models.BooleanField(default=False)
    wechat_id = models.CharField(max_length=100, blank=True)
    app_user_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.name or self.phone} 偏好"

    def get_enabled_channels(self):
        channels = []
        if self.notify_sms:
            channels.append(PickupNotification.Channel.SMS)
        if self.notify_wechat:
            channels.append(PickupNotification.Channel.WECHAT)
        if self.notify_app:
            channels.append(PickupNotification.Channel.APP)
        return channels


class PickupNotification(models.Model):
    class Channel(models.TextChoices):
        SMS = "sms", "短信"
        WECHAT = "wechat", "微信"
        APP = "app", "App"

    class Status(models.TextChoices):
        SENT = "sent", "已发送"
        FAILED = "failed", "发送失败"

    parcel = models.ForeignKey(
        "parcels.Parcel",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.SMS)
    recipient = models.CharField(max_length=50)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SENT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_channel_display()} {self.recipient}"
