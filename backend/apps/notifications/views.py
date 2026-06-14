from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PickupNotification, RecipientPreference
from .serializers import PickupNotificationSerializer, RecipientPreferenceSerializer


class RecipientPreferenceViewSet(viewsets.ModelViewSet):
    queryset = RecipientPreference.objects.all()
    serializer_class = RecipientPreferenceSerializer
    lookup_field = "phone"

    @action(detail=False, methods=["get"], url_path="by-phone/(?P<phone>[^/.]+)")
    def get_by_phone(self, request, phone=None):
        pref = RecipientPreference.objects.filter(phone=phone).first()
        if pref:
            return Response(RecipientPreferenceSerializer(pref).data)
        default_pref = {
            "phone": phone,
            "name": "",
            "notify_sms": True,
            "notify_wechat": False,
            "notify_app": False,
            "wechat_id": "",
            "app_user_id": "",
            "channels_label": "短信",
        }
        return Response(default_pref)


class PickupNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PickupNotification.objects.select_related("parcel").all()
    serializer_class = PickupNotificationSerializer
