from django.urls import path
from api.views import (RegisterAPIView, LoginAPIView, PasswordResetRequestView, PasswordResetConfirmView,
                       LatestFeedsAPIView, UserProfileView, SubscriptionAPIView, UserSettingAPIView,
                       DashboardAPIView, WeeklyFeedEmailAPIView)

urlpatterns = [
    path("signup/", RegisterAPIView.as_view(), name="signup"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('latest-feeds/', LatestFeedsAPIView.as_view(), name='latest-feeds'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path("subscribe/", SubscriptionAPIView.as_view(), name="subscribe"),
    path('update_user_topic/', UserSettingAPIView.as_view(), name='update_user_topic'),
    path("dashboard/", DashboardAPIView.as_view(), name="Dashboard Data"),
    path("send-latest-newsletter/", WeeklyFeedEmailAPIView.as_view(), name="Send Weekly newsletter"),

]