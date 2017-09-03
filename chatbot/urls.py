from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.post_list, name='post_list'),
    url(r'^app/', views.app, name='app'),
    url(r'^bot/', views.bot, name='bot'),
    url(r'^ask/', views.ask, name='ask'),
    url(r'^sop_nlc/', views.sop_nlc, name='sop_nlc'),
]