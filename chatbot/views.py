#-*-coding:utf-8
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from watson_developer_cloud import NaturalLanguageClassifierV1, ConversationV1
import json

default_nlc_credential = {
    "url" : "https://gateway.aibril-watson.kr/natural-language-classifier/api",
    "username" : "b0f8529b-50dc-4a3f-9739-c400e7ccec13",
    "password" : "IMu55oNebf5k" 
}

mamago_conv_credential = {
    "url" : "https://gateway.aibril-watson.kr/conversation/api",
    "username" : "617eaae1-29cc-4a28-bf24-bafa977de924",
    "password" : "n2vhq8WYFkqu" 
}

sop_nlc_credential = {
    "url" : "https://gateway.aibril-watson.kr/natural-language-classifier/api",
    "username" : "82e2e01a-aeee-4140-b1b1-6d61a43a2003",
    "password" : "od42nrfYD8FQ" 
}

nl_classifier = NaturalLanguageClassifierV1(
    username=default_nlc_credential['username'],
    password=default_nlc_credential['password'],
    url=default_nlc_credential['url']
)

sop_nl_classifier = NaturalLanguageClassifierV1(
    username=sop_nlc_credential['username'],
    password=sop_nlc_credential['password'],
    url=sop_nlc_credential['url']
)

mamago_conversation = ConversationV1(
    username=mamago_conv_credential['username'],
    password=mamago_conv_credential['password'],
    url=mamago_conv_credential['url'],
    version='2017-08-27'
)

# Create your views here.
def post_list(request):
    return render(request, 'chatbot/post_list.html', {})
    
def app(request):
    return render(request, 'chatbot/app.html', {})
    
def bot(request):
    return render(request, 'chatbot/bot.html', {})

@csrf_exempt
def ask(request):
    message = request.POST.get('text')
    current_mode = request.POST.get('mode')
    
    print("message : ", message)
    print("current mode : ", current_mode)
    
    if current_mode == "default":
        status = default_nlc(message)
        top_class = status['top_class']
        current_mode = top_class
        
        for c in status['classes']:
            if c['class_name'] == top_class:
                confidence = c['confidence']
        
        print("default_nlc top class [{}] confidence [{}]".format(top_class, confidence))
    
    if current_mode == "soq":
        text = "{},{}".format(message, current_mode)
        context = ''
    elif current_mode == "prm":
        text = "{},{}".format(message, current_mode)
        context = ''
    elif current_mode == "mamago":
        text = "{},{}".format(message, current_mode)
        context = ''
    elif current_mode == "exit":
        text = "{},{}".format(message, current_mode)
        current_mode = 'default'
        context = ''

    return JsonResponse({
        'mode':current_mode,
        'text':text,
        'context':context
    })
    
def default_nlc(message):
    return nl_classifier.classify('f6e4adx28-nlc-114', message)    
    
def mamago_conv(message):
    pass

@csrf_exempt
def sop_nlc(request):
    message = request.POST.get('text')
    
    status = sop_nl_classifier.classify('f6e4adx28-nlc-57', message)
    
    top_class = status['top_class']
    
    for c in status['classes']:
        if c['class_name'] == top_class:
            confidence = c['confidence']
    
    print("sop_nlc top class [{}] confidence [{}]".format(top_class, confidence))
    
    return JsonResponse({
        'top_class':top_class,
        'confidence':confidence
    })