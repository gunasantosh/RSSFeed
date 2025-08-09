from rest_framework.views import APIView
from .serializers import UserSerializer, SubscriptionSerializer
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
# Password Reset Imports
from django.utils.http import urlsafe_base64_decode
from rest_framework.permissions import AllowAny
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from rest_framework import status
# Logic Imports
import feedparser
from concurrent.futures import ThreadPoolExecutor
from rest_framework.permissions import IsAuthenticatedOrReadOnly
# Auth Protection
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
# Models
from .models import Subscription
# Email Imports
import markdown
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.template.loader import render_to_string
from django.conf import settings

class RegisterAPIView(APIView):
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            if User.objects.filter(username=request.data['username']).exists():
                return Response({'username': ['This username is already taken.']}, status=400)
            
            if User.objects.filter(email=request.data['email']).exists():
                return Response({'email': ['This email is already registered.']}, status=400)

            user = serializer.save()
            user.set_password(request.data['password'])  # Hashes password correctly
            user.save()
            
            token, _ = Token.objects.get_or_create(user=user)  # Ensures one token per user
            
            return Response({'token': token.key, "user": serializer.data}, status=201)
        
        return Response(serializer.errors, status=400)
    
class LoginAPIView(APIView):
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')


        if not username or not password:
            return Response({'message': 'Both Username and password are REQUIRED'}, status=400)

        user = User.objects.filter(username=username).first()

        if not user:
            return Response({'message': 'User not found'}, status=400)

        if not user.check_password(password):
            return Response({'message': 'Incorrect Password. try again'}, status=400)

        token, _ = Token.objects.get_or_create(user=user)

        return Response({'token': token.key, 'user': UserSerializer(user).data}, status=200)
    
class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"  # Change frontend URL accordingly

        send_mail(
            "Password Reset Request",
            f"Click the link to reset your password: {reset_link}",
            "newscrew247@gmail.com",
            [email],
            fail_silently=False,
        )

        return Response({"message": "Password reset link sent to email"}, status=status.HTTP_200_OK)
    
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid token or user does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get("password")
        if not new_password:
            return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password successfully reset"}, status=status.HTTP_200_OK)
    
######## CORE LOGIC VIEWS #################


TOPICS = {
    "AI": "https://www.artificialintelligence-news.com/feed/",
    "Technology": "https://techcrunch.com/feed/",
    "Health": "https://blog.myfitnesspal.com/feed/",
    "Finance": "https://www.thestreet.com/.rss/full/",
    "Science": "https://www.sciencenews.org/feed",
    "Sports": "https://www.espn.com/espn/rss/news",
    "Education": "https://www.teachthought.com/feed/",
    "Environment": "https://grist.org/feed/",
    "Politics": "https://www.thegatewaypundit.com/feed/",
    "Entertainment": "https://www.tmz.com/rss.xml"
}

class SubscriptionAPIView(APIView):
    def post(self, request):
        serializer = SubscriptionSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']
            topic = serializer.validated_data['topic']

            if Subscription.objects.filter(email=email).exists():
                return Response({'message': 'Email already subscribed'}, status=400)

            serializer.save()
            return Response({'message': f'Subscribed successfully with {email} & {topic}'}, status=201)
        
        return Response(serializer.errors, status=400)

class LatestFeedsAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def fetch_feed(self, topic, max_entries=5):
        """Fetch and parse RSS feed for a given topic."""
        url = TOPICS.get(topic)
        if not url:
            return topic, []

        feed = feedparser.parse(url)
        articles = []

        for entry in feed.entries[:max_entries]:
            content_list = entry.get("content", [])
            content_value = content_list[0]["value"] if content_list and "value" in content_list[0] else ""

            articles.append({
                "title": entry.title,
                "link": entry.link,
                "summary": entry.get("summary", ""),
                "content": content_value,
                "published": entry.get("published", "")
            })

        return topic, articles

    def get(self, request):
        topic_param = request.query_params.get('topic')

        if topic_param and topic_param in TOPICS:
            # Return full feed for the specific topic (no limit)
            topic, articles = self.fetch_feed(topic_param, max_entries=100)
            return Response({topic: articles})

        # Return limited feeds for all topics
        feeds = {}
        with ThreadPoolExecutor(max_workers=10) as executor: # 21sec -> 5 sec
            results = executor.map(lambda t: self.fetch_feed(t, max_entries=5), TOPICS.keys())
            for topic, articles in results:
                feeds[topic] = articles

        return Response(feeds)


#### User Profile

# View user Profile
class UserProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # Retrieved from the token
        topic = None
        
        try:
            subscription = Subscription.objects.get(email=user.email)
            topic = subscription.topic
        except Subscription.DoesNotExist:
            topic = None  # User has no subscription

        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "is_staff": user.is_staff,
            "date_joined": user.date_joined,
            "subscribed_topic": topic
        })


# update user settings i.e topic
class UserSettingAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Fetch the user's current topic"""
        user_email = request.user.email

        try:
            user_subscription = Subscription.objects.get(email=user_email)
            #topic_filename = f"{user_subscription.topic.replace(' ', '_')}.md"
            #total_topic_newsletters = Newsletter.objects.filter(filename=topic_filename).count()
            return Response({"topic": user_subscription.topic}, status=200)
        except Subscription.DoesNotExist:
            return Response({"message": "No subscribed topic found."}, status=404)

    def post(self, request):
        """Update the user's topic"""
        user_email = request.user.email
        new_topic = request.data.get("topic")

        if not new_topic:
            return Response({"error": "No topic provided"}, status=400)

        # Update or create the subscription entry
        subscription, created = Subscription.objects.update_or_create(
            email=user_email,
            defaults={"topic": new_topic}
        )

        return Response({"message": "Topic updated successfully"}, status=200)

# Admin Dashboar data
# Sends dashboard data
class DashboardAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_subscriptions = Subscription.objects.count()
        all_users_table = User.objects.all().values('username', 'email', 'date_joined', 'last_login')
        all_subs_table = Subscription.objects.all().values('email', 'topic')

        return Response({
            "total_subscriptions": total_subscriptions,
            "all_users": all_users_table,
            "all_subscriptions": all_subs_table,
        }, status=200)

###############  EMIAL ROUTES ####################

class WeeklyFeedEmailAPIView(APIView):
    """
    Sends weekly RSS feed emails to all subscribed users based on their topic.
    """
    def get(self, request):
        subscriptions = Subscription.objects.all()
        sent_count = 0

        for sub in subscriptions:
            topic = sub.topic
            email = sub.email
            feed_url = TOPICS.get(topic)

            if not feed_url:
                continue

            feed = feedparser.parse(feed_url)
            articles = feed.entries[:5]

            if not articles:
                continue

            # Plain text version for fallback
            text_content = "\n\n".join(
                f"{entry.title}\n{entry.link}\n{entry.get('summary', '')}"
                for entry in articles
            )

            # Render HTML using your template
            html_content = render_to_string("email_template.html", {
                "topic": topic,
                "articles": articles,
                "unsubscribe_url": "https://yourdomain.com/unsubscribe",
                "website_url": "https://yourdomain.com"
            })

            email_obj = EmailMultiAlternatives(
                subject=f"Your Weekly {topic} News Digest",
                body=text_content,
                from_email=settings.EMAIL_HOST_USER,
                to=[settings.EMAIL_HOST_USER],  # avoid exposing emails
                bcc=[email],  # actual recipient
            )
            email_obj.attach_alternative(html_content, "text/html")
            email_obj.send()
            sent_count += 1

        return Response({
            "message": f"Sent {sent_count} emails successfully.",
            "sent_count": sent_count
        }, status=200)


class SendTopicFeedAPIView(APIView):
    """
    Sends RSS feed emails for a specific topic to all users subscribed to that topic.
    Useful for testing the email functionality manually.
    """
    def post(self, request):
        topic = request.data.get("topic")

        if not topic or topic not in TOPICS:
            return Response({"error": "Invalid or missing topic"}, status=400)

        subscribers = Subscription.objects.filter(topic=topic)
        feed_url = TOPICS[topic]
        feed = feedparser.parse(feed_url)
        articles = feed.entries[:5]

        if not articles:
            return Response({"error": "No articles found for this topic"}, status=404)

        html_content = render_to_string("email_template.html", {
            "topic": topic,
            "articles": articles,
        })

        for sub in subscribers:
            email_msg = EmailMessage(
                subject=f"Test Feed: {topic} News",
                body=html_content,
                from_email="newscrew247@gmail.com",
                to=[sub.email],
            )
            email_msg.content_subtype = "html"
            email_msg.send()

        return Response({"message": f"Sent feed to {subscribers.count()} subscribers of {topic}."}, status=200)
