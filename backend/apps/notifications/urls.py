from rest_framework.routers import DefaultRouter

from .views import PickupNotificationViewSet, RecipientPreferenceViewSet


router = DefaultRouter()
router.register("preferences", RecipientPreferenceViewSet, basename="recipient-preference")
router.register("", PickupNotificationViewSet, basename="notification")

urlpatterns = router.urls
