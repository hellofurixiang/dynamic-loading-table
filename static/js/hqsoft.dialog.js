var HqsfotDialogEvent = {close:"close"};
function HqsoftDialog(){
    var id = "hqsoft-dialog-" + (new Date().getTime());
    var html = "<div class=\"hqsoft-dialog-overlay\" id=" + id + "></div>" +
        "<div class=\"hqsoft-dialog\">" +
        "<div class=\"dialog-header\"><span></span><a href=\"javascript:;\"></a></div>" +
        "<div class=\"dialog-content\"></div>" +
        "<div class=\"dialog-buttons\"></div>" +
        "</div>";
    //var style = "<style id=\"hqsoft-dialog-style\" type=\"text/css\">#hqsoft-dialog-overlay{position:fixed;width:100%;height:100%;top:0;left:0;z-index:999;background:#fff;filter:alpha(opacity=30);opacity:.3}#hqsoft-dialog{position:fixed;width:400px;margin-left:-201px;left:50%;top:20%;z-index:1000;border:1px solid #aaa;box-shadow:0 2px 15px rgba(0,0,0,.3);background:#fff}#hqsoft-dialog div.dialog-header{display: none;}#hqsoft-dialog div.dialog-content{padding:20px;font-size:14px;text-align:left}#hqsoft-dialog div.dialog-buttons{padding:10px;border-top:1px solid #aaa;text-align:right;box-shadow:0 1px 0 #fff inset;background:#eee;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none}#hqsoft-dialog div.dialog-buttons>button{padding:5px 12px;margin:0 2px;border:1px solid #aaa;background:#eee;cursor:pointer;border-radius:2px;font-size:14px;outline:0;-webkit-appearance:none}#hqsoft-dialog div.dialog-buttons>button:hover{border-color:#bbb;box-shadow:0 1px 2px #aaa;background:#eaeaea}#hqsoft-dialog div.dialog-buttons>button:active{box-shadow:0 1px 2px #aaa inset;background:#e6e6e6}</style>";

    var component = null;
    var dialog = null;
    var header = null;
    var body = null;
    var buttons = null;

    var listeners = [];

    function init(){
        if($("div#" + id).length > 0) return;
        component = $(html);
        component.appendTo("body");
        dialog = $(component[1]);
        dialog.css("width","400px");
        header = dialog.find(".dialog-header");
        header.find("a").on("click", function(){close();});
        body = dialog.find(".dialog-content");
        buttons = dialog.find(".dialog-buttons");
        buttons.css("display","block");
        initDrag();
    }

    function initDrag(){
        var dragging = false;
        var iX, iY;
        var mX, mY;
        header.mousedown(function(e) {
            dragging = true;
            var oL = dialog.context.offsetLeft;
            var oH = dialog.context.offsetTop;
            iX = e.clientX - oL;
            iY = e.clientY - oH;
            mX = document.documentElement.clientWidth - dialog.context.offsetWidth;
            mY = document.documentElement.clientHeight - dialog.context.offsetHeight;
            this.setCapture && this.setCapture();
            return false;
        });
        document.onmousemove = function(e) {
            if (dragging) {
                e = e || window.event;
                var oX = e.clientX - iX;
                var oY = e.clientY - iY;
                oX = oX < 0 ? 0 : oX;
                oX = oX > mX ? mX : oX;
                oY = oY < 0 ? 0 : oY;
                if(oY > mY){
                    dragging = false;
                }
                oY = oY > mY ? mY : oY;

                //$(dialog).css({"left":oX + "px"});
                $(dialog).css({"left":oX + "px", "top":oY + "px"});
                return false;
            }
        };
        document.onmouseup = window.onblur = header.onlosecapture = function() {
            dragging = false;
            header.releaseCapture && header.releaseCapture();
        };
    }

    function position(){
        var clientHeight  = document.documentElement.clientHeight;
        var clientWidth = document.documentElement.clientWidth;

        /*
        var h1 = body.height();
        var h2 = clientHeight * 0.9;
        if(h1 > h2){
            body.height(h2);
        }else{
            body.height("auto");
        }
        */

        var percentW = ((clientWidth - parseInt(dialog.width())) / 2) / clientWidth * 100;
        var percentH = ((clientHeight - parseInt(dialog.height())) / 2) / clientHeight * 100;

        $(dialog).css({"margin-left":"0px", "left":percentW + "%", "top":percentH + "%"});
    }

    function getPercentWidth(percent){
        var maxW = document.documentElement.clientWidth;
        return maxW * (Number(percent.substring(0, percent.length - 1)) / 100);
    }

    this.title = function(title){
        header.find("span").text(title);
        header.css("display", "block");
    };

    this.loading = function(msg, url){
        init();
        $(dialog).addClass("loading-dialog");
        $(dialog).width(400);
        buttons.css("display","none");
        var loading = $("<div class=\"loading\"><img src=\"" + ctp + "/images/ajax-loader.gif\" style=\"vertical-align: middle\" /> " + (msg == undefined || msg == "" ? " Loading ......" : msg) + "</div>");
        if(url != null && url != ""){
            var hiddenFrame = $("<iframe scrolling='auto' width='0px' frameborder='0' height='0px' style='display: none;'></iframe>");
            hiddenFrame.attr("src", url);
            hiddenFrame.appendTo(loading);
        }
        body.text("").append(loading);
        position();
    };

    this.openURL = function(url, title, width){
        init();
        body.css("padding","10px");
        header.find("span").text(title);
        buttons.css("display", "none");

        if(isNaN(width) && width.indexOf("%") != -1){
            var __percent = width;
            width = getPercentWidth(__percent);
            $(window).resize(function(){
                width = getPercentWidth(__percent);
                $(dialog).width(width);
                position();
            });
        }

        var loading = $("<div class=\"loading\"><img src=\"" + ctp + "/images/ajax-loader.gif\" style=\"vertical-align: middle\" /> Loading...</div>");
        var iframe = $("<iframe scrolling='auto' width='100%' frameborder='0' height='0px' style='display: none;'></iframe>");
        body.text("").append(iframe).append(loading);
        position();

        iframe.attr("src", url);
        iframe.load(function(){
            $(dialog).width(width);
            body.find(".loading").css("display", "none");
            body.find(this).css("display", "block");
            var clientHeight  = document.documentElement.clientHeight;
            var _h = clientHeight * 0.7;
            try{
                var iframeDoc = this.contentWindow.document;
                var iframeDocClientHeight = iframeDoc.body.offsetHeight + 35;
                if(iframeDocClientHeight > _h){
                    iframe.height(_h);
                }else{
                    iframe.height(iframeDocClientHeight);
                }
            }catch(e){
                iframe.height(_h);
            }
            position();
        });
    };

    this.open = function(message, actions){
        init();
        $(dialog).width(400);
        if(message != undefined && message != null) {
            body.text("").append(message);
        }
        if(actions != null) {
            buttons.css("display", "block");
            buttons.text("");
            for (var i = 0; i < actions.length; i++) {
                var button = $("<button>" + actions[i].action + "</button>");
                button.on("click", function () {
                    var index = $(buttons).find("button").index(this);
                    actions[index].callback();
                });
                buttons.append(button);
                if(actions[i].focus != null && actions[i].focus) button.focus();
            }
        }
        position();
        return this;
    };

    function close(){
        try {
            fireListener(HqsfotDialogEvent.close);
        }catch(e){
        }
        component.remove();
    }
    this.close = close;

    this.body = function(context){
        if(context != undefined && context != null){
            body.append(context);
        }
       return body;
    };

    this.head = function(){
        return header;
    };

    this.width = function(width){
        if(isNaN(width) && width.indexOf("%") != -1){
            var __percent = width;
            width = getPercentWidth(__percent);
            $(window).resize(function(){
                width = getPercentWidth(__percent);
                $(dialog).width(width);
                position();
            });
        }
        $(dialog).width(width);
        position();
    };

    this.addListener = function(type, listener){
        listeners.push({"type":type, "listener":listener});
    };

    function fireListener(type){
        if(listeners.length <= 0) return;
        for(var i=0;i<listeners.length;i++){
            if(listeners[i].type == type) listeners[i].listener();
        }
    }
}
var __HqsoftDialog__ = null;
var HqsoftDialogHelper = {};
HqsoftDialogHelper.exists = function(){
    return $(".hqsoft-dialog-overlay").length >= 1;
};
HqsoftDialogHelper.getInstance = function(newInstance){
    newInstance = newInstance == null ? false : newInstance;
    return __HqsoftDialog__ = (__HqsoftDialog__ == null || newInstance ? new HqsoftDialog() : __HqsoftDialog__);
};

var MD = new function(){
    var instances = [];
    function CloseEvent(){
        var instance = instances[instances.length - 1];
        var closeListeners = instance.getCloseListeners();
        for(var i=0;i<closeListeners.length;i++){
            var listener = closeListeners[i];
            try{
                listener();
            }catch(e){
            }
        }
        instances.pop();
    }

    function Instance(){
        var closeListeners = [];
        this.dialog = null;
        this.event = null;
        this.callback = null;
        this.addCloseListener = function(closeListener){
            closeListeners.push(closeListener);
        };
        this.getCloseListeners = function(){
            return closeListeners;
        };
    }

    this.close = function(){
        var instanceObj = instances[instances.length - 1];
        instanceObj.dialog.close();
    };

    this.getInstance = function(){
        return instances[instances.length - 1];
    };

    this.newInstance = function(url, size, title, sourceEvent, callback){
        var dialog = top.HqsoftDialogHelper.getInstance(true);
        dialog.addListener(HqsfotDialogEvent.close, CloseEvent);
        dialog.openURL(url, title, size);
        dialog.body().css("padding","5px");
        var instanceObj = new Instance();
        instanceObj.dialog = dialog;
        instanceObj.event = sourceEvent;
        instanceObj.callback = callback;
        instances.push(instanceObj);
    };
};