from channels.generic.websocket import AsyncJsonWebsocketConsumer

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user= self.scope['user']
        print("WS CONNECT USER :", user)
        if not user.is_authenticated:
            await self.close()
            return
        
        self.group_name = f"user_{user.user_id}"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )


    async def receive_json(self, content):
        if content.get("action") == "JOIN_ALBUM":
            album_id = content.get("album_id")
            if album_id:
                await self.channel_layer.group_add(
                    f"album_{album_id}",
                    self.channel_name
                )


    async def send_notification(self, event):
        await self.send_json(event["data"])