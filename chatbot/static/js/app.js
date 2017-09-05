bot_service_id = 'bbe302ff-a73a-4ee5-8caf-8e5e411c9306'

﻿var conv_dict = {
    'default': {
        'service_id':'',
        'prefix':''},
    'mamago':{
        "service_id":"bbe302ff-a73a-4ee5-8caf-8e5e411c9306",
        "prefix":"[마마고] "},
    'soq':{
        'service_id':'fff7162d-2056-4221-bd12-6d53cc2dcb41',
        'prefix':'[SOQ] '},
    'prm':{
        'service_id':'bbe302ff-a73a-4ee5-8caf-8e5e411c9306',
        'prefix':'[PRM] '}
};

var sop_classifier_threshold = 0.6; // SOP 처리담당세부그룹 정확도 최소값

(function($) {
    $.fn.extend({
        OEngine: function(options) {
            if (options && typeof(options) == 'object') {
                options = $.extend({}, $.OEngine.defaults, options)
            }
            this.each(function() {
                new $.OEngine(this, options)
            });
            return
        }
    });

    $.OEngine = function(elem, options) {
        if (options == undefined) {
            width = '25%';
            height = '100%';
            bgColor = '#2e3951';
            ctitle = "Aibril Chatbot";
            firstMsg = "안녕하세요. Aibril Chatbot 입니다.";
            service_id = ""
        } else {
            width = (options.width == undefined) ? '25%' : options.width;
            height = (options.height == undefined) ? '100%' : options.height;
            bgColor = (options.bgColor == undefined) ? '#fff' : options.bgColor;
            ctitle = (options.ctitle == undefined) ? "Aibril Chatbot" : options.ctitle;
            firstMsg = (options.firstMsg == undefined) ? '안녕하세요. Aibril Chatbot 입니다.' : options.firstMsg;
            service_id = (options.service_id == undefined) ? '' : options.service_id
        }
        $(elem).html('<div id="sidebar-wrapper" >');
        $('#sidebar-wrapper').attr('style', 'width:' + width + ';height:' + height + ';background-color:' + bgColor);
        $('#sidebar-wrapper').append($('<div/>', {
            class: 'sidebar-nav',
            id: 'style-3',
            text: ''
        }));
        var time = new Date(Date.now());
        var option = {
            hour: "2-digit",
            minute: "2-digit"
        };
        var timeStamp = time.toLocaleTimeString("en-US", option);
        $("#style-3").append("<div class='date_info'></div>");
        $(".date_info").append("<span class='date'>Today , " + convertDate(todaysDate) + "</span>");

        var talk_obj  = "<div class='talk_isac'>";
            talk_obj += "   <div class='talk_isac_icon'><span class='glyphicon glyphicon-headphones' aria-hidden='true'></span></div>";
            talk_obj += "   <div class='talk_isac_box'>" + firstMsg + "</div>"
            talk_obj += "   <div class='talk_isac_time'>" + timeStamp + "</div>"
            talk_obj += "</div>"

        $("#style-3").append(get_html_for_isac(firstMsg))

        $('#sidebar-wrapper').append($('<div/>', {
            id: 'question_wrap',
            text: ''
        }));

        //$("#sidebar-wrapper").append("<div id='helpdesk'></div>");
        //$("#helpdesk").attr('style', 'position:absolute; width:800px; height:900px; left:500px; top:5px;');
        //$("#question_wrap").append("<div class='question_bg_1'><span class='glyphicon glyphicon-comment' aria-hidden='true'></span></div>");
        $("#question_wrap").append("<div class='float question_bg_2'><input type='text' placeholder='질문을 입력하세요' id='messageText'></div>");
    };

    document.onkeypress = function(e) {
        var result = "";
        if (typeof(e) != "undefined") {
            result = e.which
        } else {
            result = event.keyCode
        }

        if (result == 13) {
            var msg = $("#messageText").val();

            if (msg.slice(0,1) == ':') {
                bot_command(msg.slice(1));
            } else {
                aibril_sop_nlc();

                /*
                if (currentMode == 'default')
                    aibril_front_nlc();
                else
                    aibril_bot_message(conv_dict[currentMode].service_id, false);
                */

                aibril_bot_message(bot_service_id, false)
            }
        }
    }
})(jQuery);
var conText;
var currentMode = 'default';
var todaysDate = new Date();

function convertDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();
    var mmChars = mm.split('');
    var ddChars = dd.split('');
    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0])
}

/********************************************************************
 * 사용자 입력 tag 생성
 *******************************************************************/
function get_html_for_user(msg) {
    var time = new Date(Date.now());
    var option = {
        hour: "2-digit",
        minute: "2-digit"
    };
    var timeStamp = time.toLocaleTimeString("en-US", option);

    var html_obj  = "<div class='talk_user'>";
        html_obj += "   <div class='talk_user_box'>" + msg + "</div>"
        html_obj += "   <div class='talk_user_time'>" + timeStamp + "</div>"
        //html_obj += "   <div class='talk_user_icon'><span class='glyphicon glyphicon-user' aria-hidden='true'></span></div>";
        html_obj += "</div>"
        html_obj += "<div class='clear'></div>"

    return html_obj
}

/********************************************************************
 * 봇 응답 tag 생성
 *******************************************************************/
function get_html_for_isac(msg) {
    var time = new Date(Date.now());
    var option = {
        hour: "2-digit",
        minute: "2-digit"
    };

    msg = conv_dict[currentMode].prefix + msg

    var timeStamp = time.toLocaleTimeString("en-US", option);
    var html_obj  = "<div class='talk_isac'>";
        //html_obj += "   <div class='talk_isac_icon'><span class='glyphicon glyphicon-headphones' aria-hidden='true'></span></div>";
        html_obj += "   <div class='talk_isac_box'>" + msg + "</div>"
        html_obj += "   <div class='talk_isac_time'>" + timeStamp + "</div>"
        html_obj += "</div>"
        html_obj += "<div class='clear'></div>"

    return html_obj
}

/********************************************************************
 * SOP 분류
 *******************************************************************/
function aibril_sop_nlc() {
    var msg = $("#messageText").val();
    var category = $(":input:radio[name=search_type]:checked").val();

    var data = {};
    data.text = category + ' ' + msg;
    data.mode = currentMode;

    console.log("[aibril_sop_nlc] input : " + JSON.stringify(data, null, 2))

    $.ajax({
        type: 'POST',
        crossDomain: true,
        cache: false,
        url: '../sop_nlc/',
        dataType: 'json',
        data: data,
        success: function(result) {
            console.log("[aibril_sop_nlc] output : " + JSON.stringify(result, null, 2))

            // 기준값보다 큰 경우에만 표시해준다.
            if (result.confidence > sop_classifier_threshold) {
                var s = result.top_class + ' (' + result.confidence.toFixed(2) + ')'
                $("#sop_op_grp").text(s)
                $("#sop_op_user").text("TBD")
            }
            else {
                $("#sop_op_grp").text('잘 모르겠어요.')
                $("#sop_op_user").text('이것도 모르겠어요.')
            }
        }
    })
}

/********************************************************************
 * 채팅창 제일 처음 NLC
 * 여기서 어떤 Conversation으로 분기될지 정해짐
 *******************************************************************/
function aibril_front_nlc() {
    var msg = $("#messageText").val();
    var data = {};
    data.text = msg;
    data.mode = currentMode;

    $.ajax({
        type: 'POST',
        crossDomain: true,
        cache: false,
        url: '../ask/',
        dataType: 'json',
        data: data,
        beforeSend: function() {
            $("#style-3").append(get_html_for_user(msg))
            $("#style-3").append("<div class='clear'></div>");
            $("#messageText").val("");
            $('#sidebar-wrapper').loading('start')
        },
        success: function(result) {
            var s = "";
            if (result.text.length == 0) {
                s = "대화모델에 해당 입력에 대한 응답이 없습니다. 대화 모델을 확인 해 주세요."
            } else {
                s += result.text;
                s += "<br />"
            }

            //nlc 태운건 채팅창에 표시하지 않는다
            //$("#style-3").append(get_html_for_isac(s))

            currentMode = result.mode;
            //aibril_bot_message(conv_dict[currentMode].service_id, true)
            aibril_bot_message(bot_service_id, true)
        },
        complete: function() {
            $('#sidebar-wrapper').loading('stop');
            $("#style-3").scrollTop($("#style-3").height())
        },
        error: function(xhr, status, error) {
            $('#sidebar-wrapper').loading('stop');
            alert('error' + JSON.stringify(xhr))
        }
    })
}

/********************************************************************
 * 각 업무유형별 Conversation Dialog 진행
 * Chatbot Framework 서비스로 생성된 service_id 필요
 * flag : nlc에서 바로 호출되었을 경우 true,
 *        context 유지인 별도 호출일 경우 false
 *******************************************************************/
function aibril_bot_message(service_id, nlc_flag) {
    var msg = $("#messageText").val();
    var data = {};
    data.api_key = service_id;
    data.text = msg;
    data.context = JSON.stringify(conText);

    if (msg == 'bye') {
        currentMode = 'default';
        $("#messageText").val("");
        return
    }

    console.log('[aibril_bot_message] currentMode : ' + currentMode);
    console.log('[aibril_bot_message] input data : ' + JSON.stringify(data, null, 2))

    $.ajax({
        type: 'POST',
        crossDomain: true,
        cache: false,
        url: 'https://oe.aibril.com/api/v1.0/wrks/message/',
        dataType: 'json',
        data: data,
        beforeSend: function() {
            if (!nlc_flag) {
                $("#style-3").append(get_html_for_user(msg))
                $("#style-3").append("<div class='clear'></div>");
                $("#messageText").val("");
            }

            $('#sidebar-wrapper').loading('start')
        },
        success: function(result) {
            console.log('[aibril_bot_message] result : ' + JSON.stringify(result, null, 2))
            var s = "";
            if (result.output.text.length == 0) {
                s = "시나리오 추가가 필요합니다."
            } else {
                s += result.output.text;
                s += "<br />"
            }
            conText = result.context;

            //console.log('context : ' + JSON.stringify(conText))

            $("#style-3").append(get_html_for_isac(s))
        },
        complete: function() {
            $('#sidebar-wrapper').loading('stop');
            $("#style-3").scrollTop($("#style-3").height())
        },
        error: function(xhr, status, error) {
            $('#sidebar-wrapper').loading('stop');
            alert('error' + JSON.stringify(xhr))
        }
    })
}


/********************************************************************
 * bot command
 *  :mode : 현재 모드
 *******************************************************************/
function bot_command(cmd) {
    var result = '';
    console.log('[bot_command] cmd : ' + cmd);

    var args = cmd.split(" ");

    if (args[0] == 'mode') {
        if (args[1].length == 0) {
            result = currentMode;
        } else if (args[1] == 'default' ||
                   args[1] == 'soq' ||
                   args[1] == 'prm' ||
                   args[1] == 'mamago') {
            currentMode = args[1];
            result = currentMode;
        } else {
            result = 'undefined mode';
        }
    }

    result = '[cmd] ' + result
    $("#style-3").append(get_html_for_isac(result))
    return
}
