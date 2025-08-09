from django.db import models


class Subscription(models.Model):
    email = models.EmailField(unique=True)  # Each email can subscribe to only one topic
    topic = models.CharField(max_length=255)

    class Meta:
        indexes = [
            models.Index(fields=['email'])  # Optional: speeds up lookups by email
        ]

    def __str__(self):
        return f"{self.email} subscribed to {self.topic}"
