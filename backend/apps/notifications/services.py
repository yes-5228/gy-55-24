from .models import PickupNotification, RecipientPreference


def get_or_create_preference(phone, name=""):
    pref, created = RecipientPreference.objects.get_or_create(
        phone=phone,
        defaults={"name": name},
    )
    if created and name and not pref.name:
        pref.name = name
        pref.save(update_fields=["name", "updated_at"])
    return pref


def get_channels_for_recipient(phone):
    try:
        pref = RecipientPreference.objects.get(phone=phone)
        channels = pref.get_enabled_channels()
        if channels:
            return channels
    except RecipientPreference.DoesNotExist:
        pass
    return [PickupNotification.Channel.SMS]


def get_recipient_for_channel(phone, channel, pref=None):
    if channel == PickupNotification.Channel.SMS:
        return phone
    if channel == PickupNotification.Channel.WECHAT:
        if pref and pref.wechat_id:
            return pref.wechat_id
        return f"wechat:{phone}"
    if channel == PickupNotification.Channel.APP:
        if pref and pref.app_user_id:
            return pref.app_user_id
        return f"app:{phone}"
    return phone


def build_notification_message(parcel):
    return (
        f"您的快件 {parcel.tracking_no} 已入柜，柜格 {parcel.locker_cell.code}，"
        f"取件码 {parcel.pickup_code}。"
    )


def send_pickup_notification(parcel, channel=PickupNotification.Channel.SMS, pref=None):
    message = build_notification_message(parcel)
    recipient = get_recipient_for_channel(parcel.receiver_phone, channel, pref)
    return PickupNotification.objects.create(
        parcel=parcel,
        channel=channel,
        recipient=recipient,
        message=message,
        status=PickupNotification.Status.SENT,
    )


def send_pickup_notifications_by_preference(parcel):
    phone = parcel.receiver_phone
    name = parcel.receiver_name
    pref = get_or_create_preference(phone, name)
    channels = get_channels_for_recipient(phone)
    notifications = []
    for channel in channels:
        notification = send_pickup_notification(parcel, channel=channel, pref=pref)
        notifications.append(notification)
    return notifications
