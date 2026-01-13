from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from ..models import Notification, Person

def send_notification(user, message, notif_type, object_id = None):
    if not isinstance(user, Person):
        user = Person.objects.get(user_id = user)
    
    notification= Notification.objects.create(
        user = user,
        message = message,
        type= notif_type,
        object_id = object_id
    )

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user.user_id}",
        {
            "type": "send_notification",
            "data": {
                "notification_id": str(notification.notification_id),
                "message": message,
                "type": notif_type,
                "object_id": str(object_id) if object_id else None,
                "created_at": notification.created_at.isoformat(),
                "is_read": notification.is_read,
            }
        }
    )

