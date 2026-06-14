from rest_framework import serializers

from .models import PickupNotification, RecipientPreference


class RecipientPreferenceSerializer(serializers.ModelSerializer):
    channels_label = serializers.SerializerMethodField()

    class Meta:
        model = RecipientPreference
        fields = [
            "id",
            "phone",
            "name",
            "notify_sms",
            "notify_wechat",
            "notify_app",
            "wechat_id",
            "app_user_id",
            "channels_label",
            "created_at",
            "updated_at",
        ]

    def get_channels_label(self, obj):
        labels = []
        if obj.notify_sms:
            labels.append("短信")
        if obj.notify_wechat:
            labels.append("微信")
        if obj.notify_app:
            labels.append("App")
        return "、".join(labels) if labels else "未设置"

    def validate(self, data):
        if not any([
            data.get("notify_sms", False),
            data.get("notify_wechat", False),
            data.get("notify_app", False),
        ]):
            raise serializers.ValidationError("至少需要选择一种通知渠道。")
        return data


class PickupNotificationSerializer(serializers.ModelSerializer):
    channel_label = serializers.CharField(source="get_channel_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    tracking_no = serializers.CharField(source="parcel.tracking_no", read_only=True)

    class Meta:
        model = PickupNotification
        fields = [
            "id",
            "parcel",
            "tracking_no",
            "channel",
            "channel_label",
            "recipient",
            "message",
            "status",
            "status_label",
            "created_at",
        ]
