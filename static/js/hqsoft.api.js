/**
 * 过滤字符串的前后空格
 * @returns {string} 过滤后的新字符串
 */
String.prototype.trim = function(){
    return this.replace(/^\s+|\s+$/g, '');
};
/**
 * 扩展JS Array 对象的POP方法，通过元素的下标来删除数组中的某一个元素
 * @param index
 */
Array.prototype.d_pop = function(index){
    if(index == null || index == undefined) {
        this.pop();
        return this;
    }
    for ( var i = 0, n = 0; i < this.length; i++) {
        if (i != index) this[n++] = this[i];
    }
    this.length -= 1;
    return this;
};
/**
 * 扩展JS Array 对象的POP方法，通过元素的值来删除数组中的某一个元素
 * @param str 用来删除的元素math.BigDecimal
 * @returns {Array} 删除元素后的新数组
 */
Array.prototype.str_pop = function(str) {
    for ( var i = 0, n = 0; i < this.length; i++) {
        if (this[i] != str) this[n++] = this[i];
    }
    this.length -= (i - n);
    return this;
};

/**
 * j+ framework 中提供的通用的JS对象，框架中开放的前端事件都将会定义在该对象中
 * @module jaf
 * @class jaf
 * @static
 * @type {Object}
 */
var jaf = {};
/**
 * 判断是否为IE浏览器
 * @method isIE
 * @returns {boolean}
 */
jaf.isIE = function(){
    return (navigator.appName.indexOf("Internet Explorer") == 10);
};
/**
 * 判断某一个对象是否为数组对象
 * @method isArray
 * @param obj 源对象
 * @returns {boolean} true|false
 */
jaf.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};
/**
 * 获取当前事件源所在的相对位置
 * @method position
 * @param eventObj 事件发生对象，这个是一个HtmlElement对象
 * @param relativeTarget 相对位置的HtmlElement对象
 * @returns {{x: (Number|number), y: (Number|number)}}
 */
jaf.position = function(eventObj, relativeTarget){
    relativeTarget = relativeTarget == null ? document.body : relativeTarget;
    var offsetY = eventObj.offsetTop;
    var offsetX = eventObj.offsetLeft;
    if(eventObj.offsetParent == null) return {x:offsetX, y:offsetY};
    if(relativeTarget != null && relativeTarget == eventObj.offsetParent) return {x:offsetX, y:offsetY};
    var parentOffset = jaf.position(eventObj.offsetParent, relativeTarget);
    offsetX += parentOffset.x;
    offsetY += parentOffset.y;
    return {x:offsetX, y:offsetY};
};
/**
 * 页面加载完成后的执行事件数组
 * @static
 * @type {Array}
 */
jaf.onReadyList = [];
$(document).ready(function(){
    for(var i=0;i<jaf.onReadyList.length;i++){
        try {
            jaf.onReadyList[i]()
        } catch (e) {
            console.error(jaf.onReadyList[i] + "\n" + e);
        }
    }
});
/**
 * 增加一个页面加载完成后的事件
 * @method addOnLoadListener
 * @param listener 监听器
 */
jaf.addOnLoadListener = function(listener){
    jaf.onReadyList.push(listener);
};
/**
 * 一个标准的消息提示对话框，用来替换掉 window 的 alert
 * @method alert
 * @param message 消息内容
 * @param __call 按下“确定”后的回调函数
 * @param title 对话框的标题
 * @param type 对话框的类型样式，支持输入 info, warning, error, success
 * @param closeable 允许关闭按钮
 * @replace 是否替换原有弹框，默认为false，即重新生成新的弹框
 */
jaf.alert = function(message, __call, title, type, closeable, replace){
    // bug1212，增加是否替换原有弹框选项，默认不替换(liming修改)
    var dialog = top.HqsoftDialogHelper.getInstance(!replace);
    type = type == null ? "info" : type;
    var h2 = parseInt($(window.top).height() * 0.5);
    /*bug#2845更正*/
    //message = "<div class=\"message-panel " + type + "\"><div style=\"max-height:" + h2 + "px; float:left;\">" + message + "</div>";
    var arry = new Array();
    arry.push("<div class='message-panel'>");
    arry.push("     <div class='icon " + type + "'></div>");
    arry.push("     <div class='text'>");
    arry.push("         <div class='text_inner' style='max-height: " + h2 + "px;'>" + message + "</div>");
    arry.push("     </div>")
    arry.push("</div>");
    message = arry.join("");
    dialog.open(
        message,
        // bug1212，有两个弹框时，替换原有弹框，回调函数不能执行(liming修改)
        [{action:lang["ok"], callback:function(){try{(typeof __call == "string") ? eval(__call) :  __call();}catch(e){};dialog.close();}}]
    );
    dialog.body().css({"padding": "20px"});
    title = title == null ? "" : title;
    dialog.title(title);
    if(!closeable) dialog.head().find("a").css("display", "none");

    var panel = dialog.body().find("div.message-panel");
    var h1 = panel.height();
    if(h1 >= 40) return;
    var padding = parseInt((40 - h1) / 2) + "px";
    panel.css({"padding-top": padding, "padding-bottom": padding});
};
/**
 * 一个用于显示一个带有指定消息和确定及取消按钮的对话框， 用来替换掉 window 的 confirm
 * @method confirm
 * @param message 消息内容
 * @param title 对话框的标题
 * @param __call 按下“确定或取消”按钮后的回调函数，函数提供了按钮的响应事件结果 true|false
 * @param closeable 允许关闭按钮
 */
jaf.confirm = function(message, title, __call, closeable){
    var dialog = top.HqsoftDialogHelper.getInstance(true);
    //message = "<div class=\"message-panel help\"><div>" + message + "</div>";
    var arry = new Array();
    arry.push("<div class='message-panel'>");
    arry.push("     <div class='icon help'></div>");
    arry.push("     <div class='text'>");
    arry.push("         <div class='text_inner'>" + message + "</div>");
    arry.push("     </div>")
    arry.push("</div>");
    message = arry.join("");

    dialog.open(message, [
        {action:lang["ok"], callback:function(){
            try {
                __call(true);
            } catch (e) {
                console.error(e);
            }
            dialog.close();
        }},
        {action:lang["cancel"], callback:function(){
            try {
                __call(false);
            } catch (e) {
                console.error(e);
            }
            dialog.close();
        }, focus : true}
    ]);
    dialog.title(title);
    dialog.body().css({"padding": "20px"});
    if(!closeable) dialog.head().find("a").css("display", "none");

    var panel = dialog.body().find("div.message-panel");
    var h = panel.height();
    if(h >= 40) return;
    var padding = parseInt((40 - h) / 2) + "px";
    panel.css({"padding-top": padding, "padding-bottom": padding});
};
/**
 * 一个用来操作Cooke的方法对象
 * @class jaf.cookie
 * @type {cookie}
 */
jaf.cookie = new function(){
    /**
     * 读取Cookie
     * @method read
     * @param name Cookie的名称
     * @returns {string} 返回该Cookie的值（字符串）
     */
    this.read = function(name){
        var cookie = $.cookie(name);
        return (cookie == null || cookie == "null") ? "" : cookie;
    };
    /**
     * 写入Cookie
     * @method write
     * @param name Cookie名称
     * @param value Cookie 的值（字符串）
     * @param expires Cookie 存在的日期，单位为 day
     * @param path Cookie保存的路
     */
    this.write = function(name, value, expires, path){
        var param = {};
        if(expires != null){
            param["expires"] = expires;
        }
        if(path != null){
            param["path"] = path;
        }
        $.cookie(name, value, param);
    };
};
/**
 * 一个标准的弹窗组件
 * @class jaf.dialog
 * @type {dialog}
 */
jaf.dialog = new function(){
    var dialog = null;
    /**
     * 打开一个弹窗
     * @method open
     * @param url 弹窗中访问的URL地址
     * @param width 弹窗的宽度，可以是一个数字或者一个百分比的字符串，如： 500|'50%'
     * @param title 弹窗的标题
     * @param newInstance 表示为一个新实例，false 会将已经存在的窗口关闭，再重新打开新的窗口
     */
    this.open = function(url, width, title, newInstance){
        dialog = top.HqsoftDialogHelper.getInstance(newInstance);
        dialog.openURL(url, title, width);
        dialog.body().css("padding","5px");
        //window.event.stopPropagation();
    };
    /**
     * 关闭窗口
     * @method close
     */
    this.close = function(){
        if(dialog != null) dialog.close();
    };
};
/**
 * 加载进度条
 * @class jaf.loading
 * @type {loading}
 */
jaf.loading = new function(){
    var dialog = null;
    /**
     * 打开该加载进度条
     * @method open
     * @param message
     * @param curr 是否在当前页打开
     * @returns {*}
     */
    this.open = function(message, curr){
        dialog = top.HqsoftDialogHelper.getInstance(curr != null && curr);
        dialog.loading(message);
        //window.event.stopPropagation();
        return dialog;
    };
    /**
     * 关闭进度条
     * @method close
     */
    this.close = function(){
        if(dialog != null) dialog.close();
    };
};
/**
 * 一个删除确认对象
 * @class jaf.del
 * @type {del}
 */
jaf.del = new function(){
    /**
     *显示一个删除确认的对话框
     * @method confirm
     * @param message 用于显示的消息
     * @param url 当确认后转向的删除URL地址
     */
    this.confirm = function(message, url){
        var target = $("#__form_submit__");
        if(target.length <= 0){
            target = $("<iframe name=\"__form_submit__\" id=\"__form_submit__\" width=\"0\" height=\"0\" frameborder=\"0\"></iframe>");
            $("body").append(target);
        }
        message = (message == null || message == "") ? lang["delete.confirm.message.default"] : message;
        message = lang["delete.confirm.message"].replace("%{context}", message);
        top.jaf.confirm(message, lang["delete.confirm.title"], function(_result){
            if(!_result) return;
            //document.location.assign(url);
            target.attr("src",url);
        });
    };
};
/**
 * 一系列的选择控件类
 * @class jaf.picker
 * @type {picker}
 */
jaf.picker = new function(){

    function getDateOnchange(object){
        var onchange = object.getAttribute("onchange");
        if(onchange == null || onchange == "") return null;
        if(typeof(onchange) == "string"){
            try {
                onchange = function(){eval(onchange);};
            }catch(e){
                jaf.alert("“" + onchange + "” is not a function！", null, "error", "error");
            }
        }
        return onchange;
    }

    /**
     * 日期选择控件，该方法用来直接绑定一个HTMLElement对象
     * @method date
     * @param object 触发的事件源
     * @param format 格式化表达式，参见：http://www.bootcss.com/p/bootstrap-datetimepicker/
     */
    this.date = function (object, format) {
        $(object).datepicker({language:"zh-CN",autoclose:true,todayBtn:'linked',todayHighlight:true, format:format,viewSelect:'day'});
        var obj = $(object).datepicker("show");

        var onchange = getDateOnchange(object);
        if(onchange == null) return;
        obj.on("changeDate", function(eva){
            try {
                onchange(eva);
            }catch(e){
                jaf.alert(e);
            }
        });
    };

    /**
     * 日期时间选择控件，该方法用来直接绑定一个HTMLElement对象
     * @method time
     * @param object 触发的事件源
     */
    this.time = function(object){
        $(object).datetimepicker({language:"zh-CN",autoclose:true,todayBtn:'linked', todayHighlight:true});
        var obj = $(object).datetimepicker("show");
        var onchange = getDateOnchange(object);
        if(onchange == null) return;
        obj.on("changeDate", function(eva){
            try {
                onchange(eva);
            }catch(e){
                jaf.alert(e);
            }
        });
    };

    /**
     * 用户选择
     * @class jaf.picker.users
     * @method users
     * @type {users}
     */
    this.users = new function(){
        var callBackFunction = null;
        var eventObj = null;

        /**
         * 显示用户选择对话框
         * @method display
         * @param __eventObj 事件源
         * @param type 用户选择的类型，group|dept
         * @param callback 选择后的回调函数，执行回调函数时会将两个对象 accounts(Array),names(Array) 作为参数提供给该回调方法
         * @param params
         */
        this.display = function(__eventObj, type, callback, params){
            eventObj = __eventObj;
            type = type == null ? "group" : type;
            var selecteds = "";
            try{
                selecteds = __eventObj.parentNode.parentNode.getElementsByTagName("input")[0].value;
            }catch(e){}
            if(selecteds == ""){
                if(params != null && params.inits != null){
                    selecteds = params.inits;
                    delete params.inits;
                }
            }
            if(typeof(params) != "string"){
                params = JSON.stringify(params);
            }
            if(params != null) params = params.replace(/\"/g,"'");

            if(callback == null){
                callback = function(eventObj, accountArg, nameArg){
                    var inputs = eventObj.parentNode.parentNode.getElementsByTagName("input");
                    inputs[0].value = accountArg.join(",");
                    inputs[1].value = nameArg.join(",");
                };
            }
            this.setCallback(callback);

            top.jaf.dialog.open(ctx + "/user/user-selector.jhtml?type=" + type + "&accounts=" + selecteds + "&properties=" + encodeURIComponent(params), 700, "用户选择");
        };

        var detailShowEventObj = null;
        var detailShowFrame = null;
        this.detail = function(eventObj){
            try{eventObj.removeChild(detailShowFrame);}catch(e){}
            detailShowEventObj = eventObj;
            var accountDiv = eventObj.getElementsByTagName("div")[0];
            var accounts = accountDiv.innerText;
            if(accounts == "") return;
            var detailFrame = document.createElement("div");
            detailFrame.className = "user-detail-display";

            var loadingDiv = document.createElement("div");
            loadingDiv.className = "loading";

            var detailBody = document.createElement("div");
            detailBody.className = "detail-body";
            var iframe = document.createElement("iframe");
            iframe.width = "100%";
            iframe.frameBorder = 0;

            detailBody.appendChild(loadingDiv);
            detailBody.appendChild(iframe);
            detailFrame.appendChild(detailBody);
            detailShowFrame = detailFrame;
            eventObj.appendChild(detailFrame);

            var loading = new Loading(loadingDiv, iframe, iframe.height);
            loading.show();
            iframe.src = ctx + "/user/user-selector!list.jhtml?accounts=" + accounts;
        };

        this.callback = function(accountArg, nameArg){
            if(callBackFunction != null && callBackFunction != undefined){
                callBackFunction(accountArg, nameArg);
            }
        };

        this.setCallback = function(fun){
            callBackFunction = fun;
        };

        this.get = function(eventCaller,eventObj){
            var value = eventObj.value;
            if(value == null || value == "") return;
            if(eventCaller == "blur" && eventObj.inited != undefined && eventObj.inited != null && eventObj.inited) return;
            var url = ctx + "/user/user-selector!ajax.jhtml";
            $.post(url, {accounts:value}, function(data, textStatus){
                var inputs = eventObj.parentNode.getElementsByTagName("input");
                if(data == null || data.account == null || data.account == ""){
                    inputs[0].value.value = "";
                    inputs[1].value = "";
                    return;
                }
                inputs[0].value = data.account;
                inputs[1].value = data.name + "(" + data.account + ")";
                eventObj.inited = true;
            }, "json");
        };

        jaf.addOnLoadListener(function(){
            function bodyEvent(){
                if(detailShowEventObj == null) return;
                var activeEle = document.activeElement;
                if(activeEle == null) return;
                if(activeEle.id == detailShowEventObj.id) return;
                detailShowFrame.innerHTML = "";
            }

            if (window.addEventListener){
                document.body.addEventListener("click",bodyEvent,false);
            }else{
                document.body.attachEvent("onclick",bodyEvent);
            }
        });
    };

    this.group = new function(){
        var call = null;
        this.open = function(callback){
            call = callback;
            jaf.dialog.open(ctx + "/sys/group-selection.jhtml", 663, "群组选择");
        };
        this.done = function(data){
            if(call != null){
                call(data);
            }
            jaf.dialog.close();
        };
    };
};
jaf.editor = new function(){

    this.combo = new function(){
        var currEventObj = null;
        var currEventButtonObj = null;
        var openedCombos = [];
        this.expend = function(eventObj){
            clear();
            if(eventObj.tagName == "BUTTON"){
                currEventButtonObj = eventObj;
                eventObj = eventObj.parentNode.parentNode.getElementsByTagName("input")[1];
            }
            currEventObj = eventObj;
            var comboUl = eventObj.parentNode.getElementsByTagName("ul")[0];
            if(comboUl == null) return;
            comboUl.style.display == "block" ? hidden(comboUl) : show(comboUl);
        };

        this.selection = function(eventObj){
            var sourceElements = eventObj.parentNode.parentNode.parentNode.getElementsByTagName("input");
            var valueInputElement = eventObj.children[0];
            if(valueInputElement.type == "hidden"){
                sourceElements[0].value = valueInputElement.value;
                sourceElements[1].value = eventObj.childNodes[1].data;
                return;
            }

            if(valueInputElement.type != "checkbox") return;
            var comboUl = eventObj.parentNode.parentNode;
            var checkboxs = comboUl.getElementsByTagName("input");
            var selectedValuesArray = [];
            var selectedTextsArray = [];
            for(var i=0;i<checkboxs.length;i++){
                if(checkboxs[i].checked){
                    selectedValuesArray.push(checkboxs[i].value);
                    selectedTextsArray.push(checkboxs[i].parentNode.childNodes[1].data);
                }
            }
            sourceElements[0].value = selectedValuesArray.join(",");
            sourceElements[1].value = selectedTextsArray.join(",");
        };

        this.value = function(eventObj){
            eventObj.parentNode.getElementsByTagName("input")[0].value = eventObj.value;
        };

        function clear(){
            for(var i=0;i<openedCombos.length;i++){
                openedCombos[i].style.display = "none";
            }
            openedCombos.pop();
        }

        function bodyEvent(){
            var srcElement = window.event.srcElement;
            if(srcElement == currEventObj || srcElement == currEventButtonObj) return;
            if(srcElement.tagName == "LI"){
                srcElement = srcElement.children[0];
            }
            if(srcElement != null && srcElement.tagName == "LABEL"){
                srcElement = srcElement.children[0];
            }
            if(srcElement != null && srcElement.type != null && srcElement.type == "checkbox") return;
            try{
                hidden(currEventObj.parentNode.getElementsByTagName("ul")[0]);
            }catch(e){}
        }

        function hidden(targetObj){
            targetObj.style.display = "none";
            openedCombos.pop();
        }
        function show(targetObj){
            openedCombos.push(targetObj);
            targetObj.style.display = "block";
        }

        //为列表表格加入点击事件
        if (window.addEventListener){
            document.addEventListener("click",bodyEvent,false);
            document.addEventListener("blur",bodyEvent);
        }else{
            document.attachEvent("onclick",bodyEvent);
            document.attachEvent("onblur",bodyEvent);
        }
    };

    this.textarea = new function(){
        var currEventObj = null;
        var MaxLength = null;

        function verify(eventObj){
            var value = eventObj.value;
            if(MaxLength == null || value.length <= MaxLength) return true;
            $(eventObj.parentNode).find("div").css("background-color","#d94a38").text("输入的字符串长度(" + value.length + ")超出了系统限制(" + MaxLength + ")！");
            return false;
        }

        this.open = function(eventObj, name, maxLength){
            MaxLength = maxLength;
            currEventObj = eventObj.parentNode.parentNode.getElementsByTagName("textarea")[0];
            if(currEventObj == null){
                currEventObj = eventObj.parentNode.parentNode.getElementsByTagName("input")[0];
            }
            var readonly = currEventObj.disabled || currEventObj.readOnly || (currEventObj.readOnly == "readonly") || (currEventObj.disabled == "disabled");
            var value = currEventObj.value;
            var model = readonly ? "查看" : "编辑";

            var html = "<div><textarea rows=\"16\" style=\"width:100%\"" + (readonly ? "readonly=\" readonly\"" : "") + "></textarea><div style='color:#fff;margin-top:1px;font-size: 9pt;padding: 2px 5px;'></div></div>";
            var buttons = [];
            var dialog = top.HqsoftDialogHelper.getInstance(true);

            if(!readonly){
                buttons = [
                    {action:lang["ok"], callback:function(){
                        var input = dialog.body().find("textarea")[0];
                        if(!verify(input)) return;
                        currEventObj.value = input.value;
                        dialog.close();
                    }},
                    {action:lang["cancel"], callback:function(){
                        dialog.close();
                    }}
                ];
            }else{
                buttons = [
                    {action:lang["cancel"], callback:function(){
                        dialog.close();
                    }}
                ];
            }

            dialog.open($(html),buttons);
            dialog.title(model + " " + name + " 文本");
            dialog.body().css("padding", "10px");
            var input = dialog.body().find("textarea")[0];
            input.value = value;
        };
    };

    this.file = new function(){
        this.open = function(eventObj, params){
            eventObj.window = window;
            var url = ctx + "/file.jhtml?encode=" + params;
            var ids = eventObj.parentNode.parentNode.getElementsByTagName("input")[0].value;
            if(ids != null){
                url += "&ids=" + ids;
            }
            top.MD.newInstance(url, "510", "上传文件", eventObj, function(ids){
                var eventObj = top.MD.getInstance().event;
                var inputs = eventObj.parentNode.parentNode.getElementsByTagName("input");
                if(ids != null){
                    var idStr = "";
                    var nameStr = "";
                    for(var i=0;i<ids.length;i++){
                        var name = ids[i].name + "." + ids[i].extension;
                        var id = ids[i].id;
                        if(i != 0){
                            idStr += ",";
                            nameStr += ",";
                        }
                        idStr += id;
                        nameStr += name;
                    }
                    inputs[0].value = idStr;
                    inputs[1].value = nameStr;
                }
            });
        };
        this.files = function(id, filesJson){
            if(filesJson == null || filesJson == undefined || filesJson == "") return;
            var panelId = "download_panel_" + id.replace("[.]","_");
            var panel = document.getElementById(panelId);
            if(panel == null){
                document.write("<ul id=\"" + panelId + "\" class=\"file-download\"><ul>");
                panel = document.getElementById(panelId);
            }
            panel.innerHTML = "";
            var ids = id.split("[.]");
            for(var i=0;i<filesJson.length;i++){
                var fileObj = filesJson[i];
                var li = document.createElement("li");
                var link = document.createElement("a");
                link.href = "javascript:;";
                link.index = i;
                link.title = fileObj.remark;
                link.onclick = function(){
                    FileUploadUtil.download(filesJson[this.index].name, ids[0], ids[ids.length], filesJson[this.index].id);
                };
                link.innerHTML = fileObj.name + "." + fileObj.extension;
                li.appendChild(link);

                var sizeSpan = document.createElement("em");
                sizeSpan.innerHTML = (fileObj.size / 1024).toFixed(2) + " KB";
                li.appendChild(sizeSpan);

                panel.appendChild(li);
            }
        };
        this.download = function(name, id, annexId){
            var url = ctx + "/download.jhtml?annex.id=" + annexId;
            var dialog = top.HqsoftDialogHelper.getInstance(false);
            dialog.loading(name + " 正在下载......", url)
            window.setTimeout(function(){dialog.close();}, 5000);
        };
        this.get = function(ids, callback){
            if(ids == null || ids == "") return;
            var requestUrl = ctx + "/file!get.jhtml";
            var params = {"ids" : ids};
            $.post(requestUrl, params,
                function (data, textStatus){
                    callback(data);
                }, "json");
        };
    };

    this.date = function (object, format) {
        jaf.picker.date(object.parentNode.parentNode.getElementsByTagName("input")[0], format);
    };

    this.time = function(object){
        jaf.picker.time(object.parentNode.parentNode.getElementsByTagName("input")[0]);
    };

    this.clear = function(object, callback){
        while(!(object.tagName == "DIV" && object.className.indexOf("composite") != -1)){
            object = object.parentNode;
        }
        object = object.getElementsByTagName("input")[0];
        if(object.tagName.toLowerCase() != "input" || object.type != "text") return;
        object.value = "";
        if(callback == null) return;
        try{
            callback(object);
        }catch(e){
            jaf.alert(e.message);
        }
    };

    this.reference = new function(){

        function stopEvent(){
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if (e && e.preventDefault) { // 阻止默认浏览器动作(W3C)
                e.preventDefault();
            } else {  // IE中阻止函数器默认动作的方式
                window.event.returnValue = false;
            }
        }

        function paramsEncode(params){
            var paramString = "";
            for(var key in params) {
                var valueExp = params[key];
                try{
                    if((valueExp.substring(0, 2) == "%{") && (valueExp.substring(valueExp.length - 1) == "}")){
                        try{
                            valueExp = eval(valueExp.substring(2, valueExp.length - 1));
                        }catch(e){
                        }
                    }
                    paramString += ("&params." + key + "=" + valueExp);
                }catch(e){
                }
            }
            return paramString;
        }

        function paramsWrapper(params){
            if(typeof(params) == "string"){
                //params = decodeURIComponent(decodeURI(params));
                params = unescape(decodeURI(params));
                try{
                    params = eval("[" + params + "]")[0];
                }catch(e){
                    alert(e);
                }
            }else if(typeof(params) == "object"){
                //params = params.Clone();
            }
            return params;
        }

        function getElement(parentObj, key){
            if(parentObj == null || parentObj.tagName == "BODY") return null;
            if(parentObj.tagName == "DIV" && parentObj.className.indexOf("composite") != -1){
                if(parentObj.parentNode.tagName = "TD"){
                    return parentObj.parentNode.parentNode.getElementsByTagName("input")[key];
                }else{
                    return document.getElementById(key);
                }
            }else{
                return getElement(parentObj.parentNode, key);
            }
        }

        function getParams(eventObj){
            var source = eventObj;
            while(!(source.tagName == "DIV" && source.className.indexOf("composite") != -1)){
                source = source.parentNode;
            }
            var params = {};
            params["call"] = {
                selected : source.getAttribute("selected-call"),
                empty : source.getAttribute("empty-call"),
                remove : source.getAttribute("remove-call")
            };
            params["selection"] = source.getAttribute("selection");
            params["reference"] = source.getAttribute("reference");
            params["relation"] = eval("[" + source.getAttribute("selected-relation") + "]")[0];
            params["search"] = source.getAttribute("search");
            return params;
        }

        this.bind = function(target){
            //fuck microsoft
            var bind = 'input';
            if (jaf.isIE()){
                bind = 'propertychange';
            }
            $(target).on(bind, function(){
                jaf.editor.reference.get(this);
            });
        };

        /**
         * 通过AJAX获取参照返回值并执行回调函数
         */
        var mar = null;
        this.get = function(eventObj){
            var e = event || window.event || arguments.callee.caller.arguments[0];
            var params = getParams(eventObj);
            var reference = paramsWrapper(params.reference);
            var search = reference.search;

            var times = 5;
            var i = 0;
            window.clearInterval(mar);
            mar = window.setInterval(function(){
                i++;
                if(i >= times){
                    window.clearInterval(mar);
                    process();
                }
            }, 100);

            function process(){
                var value = eventObj.value;
                if(value == null) return;
                value = value.trim();
                if(value == "") {
                    jaf.editor.reference.clear(eventObj);
                    return;
                }
                var sendParams = {field:(reference.field == null ? "" : reference.field), value:value, code:(reference.search)};
                var url = ctx + "/report/reference-ajax-selection.jhtml";
                if(reference.id != null){
                    url += "?reference.id=" + reference.id;
                }else{
                    url += "?reference.code=" + reference.code;
                }
                delete reference.id;
                delete reference.code;
                delete reference.field;
                delete reference.search;
                url += paramsEncode(reference);
                /*$.post(url, sendParams,function (data){
                        success(data,value,e);
                    }, "json");*/
                $.ajax({
                    type: "post",
                    url: url,
                    cache:false,
                    async:true,
                    dataType: "json",
                    data: sendParams,
                    success: function(data){
                        success(data,value,e);
                    }
                });
            }

            var popup = new function(){
                var isMouseOverUL = false;
                var capacity = eventObj.parentNode;
                var ul = capacity.getElementsByTagName("ul")[0];
                if(ul == null) {
                    ul = document.createElement("ul");
                    ul.className = "popup";
                    ul.onmouseover = function () {
                        isMouseOverUL = true;
                    };
                    ul.onmouseout = function () {
                        isMouseOverUL = false;
                    };
                    capacity.insertBefore(ul, capacity.children[1]);

                    $(eventObj).on('blur', function () {
                        if (isMouseOverUL) return;
                        ul.style.display = "none";
                        // bug#2464更正，显示和隐藏div.popup时，应自动调节页面高度
                        adjustHeight(false);
                        var _params = getParams(eventObj);
                        var _reference = paramsWrapper(_params.reference);
                        var _search = _reference.search;
                        var find = false;
                        for(var i=0;i<ul.children.length;i++){
                            var arr = _search.split(",");
                            for(var j=0;j<arr.length;j++){
                                if(ul.children.item(i).data[arr[j]] == eventObj.value){
                                    find = true;
                                    break;
                                }
                            }

                        }
                        if(find==false)
                            jaf.editor.reference.clear(eventObj);
                    });

                    $(eventObj).on('focus', function () {
                        // bug2372更正，输入框中没有输入查询条件时，不显示参照下拉列表
                        if(this.value != undefined && this.value != "") {
                            Show();
                        }
                    });

                }

                // bug#2464更正，显示和隐藏div.popup时，应自动调节页面高度
                function adjustHeight(show) {
                    try {
                        var $tbody = $(ul).closest(".tbody");
                        //var scrollHeight = $tbody[0].scrollHeight;
                        var scrollHeight = ($(ul).closest("tr")[0].rowIndex + 2) * ul.offsetTop + ul.scrollHeight;
                        if(show) {
                            //$tbody.css("height", (scrollHeight + 19) + "px");
                            $tbody.css("height", scrollHeight + "px");
                        } else {
                            $tbody.css("height", "auto");
                        }
                        var frame = parent.document.getElementsByName(window.name)[0];
                        //frame.style.height = $("body").height() + "px";
                        frame.style.height = document.body.scrollHeight + "px";
                    }  catch(error) {
                        //console.log(error);
                    }
                }

                function Show(){
                    ul.style.display = ul.innerHTML == "" ? "none" : "block";
                    // bug#2464更正，显示和隐藏div.popup时，应自动调节页面高度
                    var show = (ul.style.display == "block");
                    adjustHeight(show);
                }
                this.show = Show;

                this.setData = function(data,value){
                    var arrSearch = search.split(",");
                    var searchIndex=0;
                    ul.innerHTML = "";
                    for(var i=0;i<data.length;i++){
                        var li = document.createElement("li");
                        /*for(var l=0;i==0&&l<arrSearch.length;l++){
                            if(data[i][arrSearch[l]]!=undefined && data[i][arrSearch[l]].indexOf(value)>=0){
                                searchIndex=l;
                            }
                        }
                        var lidata = data[i][arrSearch[searchIndex]];
                        if(lidata==undefined){
                            lidata=data[i][search];
                        }*/
                        //cust by huangxs
                        var lidata ="";
                        if(typeof data[i].empty != 'undefined'){
                            lidata = data[i][search];
                        }
                        else{
                            for(var j=0;j<arrSearch.length;j++){
                                lidata += data[i][arrSearch[j]] + " ";
                            }
                            lidata = lidata.substr(0,lidata.length-1);
                        }
                        li.innerHTML = lidata;
                        li.data = data[i];
                        li.onclick = function(){
                            ul.style.display = "none";
                            if(this.data.empty != null && this.data.empty) return;
                            fireSelectionChanged(this.data);
                        };
                        ul.appendChild(li);
                    }
                };
            };

            function isEmptyObject(obj) {
                var name;
                for (name in obj) {
                    return false;
                }
                return true;
            }

            function success(data,value,events){
                //cust by huangxs
                /*if(data != null && data.length == 1 && events.keyCode != 8){
                    fireSelectionChanged(data[0]);
                    return;
                }*/
                if(search == null || search == "") return;
                if(data == null || data.length <= 0){
                    data = [];
                    var emptyObj = {empty:true};
                    emptyObj[search] = "无";
                    data.push(emptyObj);
                    try{
                        _call = eval(params.call.remove);
                        _call(eventObj,data);
                    }catch(e){}
                }
                popup.setData(data,value);
                popup.show();
            }

            function fireSelectionChanged(data){
                eventObj.window = window;
                if(data == null || isEmptyObject(data)){
                    var emptyCall = null;
                    try{
                        if(typeof(params.call.empty) == "string"){
                            emptyCall = eval(params.call.empty);
                        }
                    }catch(e){}
                    if(emptyCall != null) {
                        emptyCall(eventObj);
                    }
                    return;
                }
                var selectedCall = params.call.selected;
                if(selectedCall == null){
                    selectedCall = function(eventObj, results){
                        try {
                            eventObj.value = results[0][search];
                        }catch(e){
                            eventObj.value = "";
                        }
                    };
                    return;
                }
                var __call = selectedCall;
                if(typeof(__call) == "string"){
                    __call = eval(selectedCall);
                }
                try {
                    __call(eventObj, data);
                }catch(e){
                    jaf.alert(e.message, null, "callback error", "error");
                }
            }
        };
        /**
         * 按键的事件
         */
        this.keyup = function(eventObj){
            /*
             var e = event || window.event || arguments.callee.caller.arguments[0];
             if(e.keyCode != 13) return;
             window.setTimeout(function(){
             if (eventObj.fireEvent){
             eventObj.fireEvent("onchange");
             }else{
             eventObj.onchange();
             }
             }, 100)

             if (e && e.preventDefault){
             // 阻止默认浏览器动作(W3C)
             e.preventDefault();
             }else{
             // IE中阻止函数器默认动作的方式
             window.event.returnValue = false;
             }
             */
        };
        /**
         * 打开参照引用页面
         */
        this.call = function(eventObj){
            var params = getParams(eventObj);
            var reference = paramsWrapper(params.reference);
            if(eventObj.tagName != "INPUT"){
                eventObj = eventObj.parentNode.parentNode.getElementsByTagName("input")[0];
            }
            var callback = params.call.selected;
            try{
                callback = eval(callback);
            }catch(e){
                callback = null;
            }
            if(callback == null){
                callback = function(eventObj, returnParams){
                    eventObj.value = returnParams[eventObj.param.field];
                };
            }
            var type = params.selection == null ? "sign" : params.selection;
            var selectedRelationKey = "";
            var selectedRelationValue = "";
            try{
                selectedRelationKey = params.relation.key;
                selectedRelationValue = getElement(eventObj, params.relation.value).value;
            }catch (e){
            }
            selectedRelationKey = selectedRelationKey == null ? "" : selectedRelationKey;
            selectedRelationValue = selectedRelationValue == null ? "" : selectedRelationValue;
            var url = ctx + "/report/reference-selection.jhtml?id=" + (reference.id == null ? "" : reference.id) + "&code=" + (reference.code == null ? "" : reference.code) + "&field=" + (reference.field == null ? "" : reference.field) + "&flag=" + type + "&selected.to=" + selectedRelationKey + "&selected.from=" + selectedRelationValue;
            delete reference.id;
            delete reference.code;
            delete reference.field;
            delete reference.search;
            url += paramsEncode(reference);
            eventObj.window = window;
            top.MD.newInstance(url, "60%", "请选择", eventObj, function() {return callback;});
        };
        /**
         * 默认的回调方法
         */
        this.callback = function(eventObj, returnParams){
            for(var key in returnParams){
                var value = returnParams[key];
                var ele = getElement(eventObj, key);
                if(ele == null) continue;
                if(ele.tagName == "TEXT"){
                    ele.value = value;
                }else if(ele.tagName == "SELECT-ONE"){
                    var options = ele.options;
                    for(var i=0;i<options.length;i++){
                        var option = options[i];
                        if(option.value == value){
                            option.selected = true;
                            break;
                        }
                    }
                }else if(ele.tagName == "CHECKBOX"){
                    if(value == ele.value){
                        ele.checked = true;
                    }
                }
            }
        };
        /**
         * 清除
         */
        this.clear = function(eventObj){
            var params = getParams(eventObj);
            var call = params.call.remove;
            call = typeof(call) == "string" ? eval(call) : call;
            jaf.editor.clear(eventObj, call);
        }
    };

    this.event = new function(){
        this.execute = function(code, args, callback, template, async){
            async = async == null || async == undefined ? false : async;
            template = template == null ? {} : template;
            try {
                if (template.form == null || template.form == "" || template.code == null || template.code == "") {
                    template.code = OBF.getPage().template.code;
                    template.form = OBF.getPage().template.form;
                }
            }catch(e){
                jaf.alert(e.message);
                return;
            }
            args = args == null ? {} : args;
            var url = ctx + "/form/event-execute.jhtml";
            var params = {"event":code, "ft.form.code":template.form, "ft.code":template.code, "params":JSON.stringify(args)};

            $.ajax({
                type: "post",
                url: url,
                data: params,
                cache: false,
                async: async,
                dataType: "json",
                success: function (data) {
                    if (!data.success) {
                        jaf.alert(data.message);
                        return;
                    }
                    if (callback != null) {
                        callback(data.result);
                    }
                }
            });
        };
    };
};

/**
 * 数据导出
 */
jaf.export = new function(){
    this.print = function(url, type, title){
        url = ctx + url;
        if(type != null && type.length > 0) {
            if (url.indexOf("?") != -1) url = url + "&type=" + type;
            else url = url + "?type=" + type;
        }
        var message = title != undefined && title != null ? title : "";
        message = lang["export.process"] + message;
        message = Lang.getText("export.process.loading", [message]);
        var dialog = top.HqsoftDialogHelper.getInstance(false);
        dialog.loading(message, url)
        window.setTimeout(function(){dialog.close();}, 5000);
    };
};

/**
 * 一系列的字符处理类
 * @class jaf.text
 * @type {text}
 */
jaf.text = new function(){
    /**
     * 阻止事件默认行为
     * @param event
     */
    function preventDefault(event) {
        if (event.preventDefault){
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }

    /**
     * 停止事件冒泡
     * @param event
     */
    function stopPropagation(event) {
        if (event.stopPropagation){
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    }

    /**
     * 获取文本框选中的文本
     * @returns {string}
     */
    function getSelectedText() {
        var text = "";
        try {
            text = window.getSelection().toString();
        } catch(error) {
            text = document.selection.createRange().text;
        }
        return text;
    }

    /**
     * 获取文本框光标位置
     * @param obj
     * @returns {number}
     */
    function getCursorPosition(obj) {
        var pos = 0;
        if(typeof obj.selectionStart == "number" && typeof obj.selectionEnd == "number") {
            pos = obj.selectionStart;
        } else {
            var range = document.selection.createRange();
            range.moveStart('character', -obj.value.length);
            pos = range.text.length;
        }
        return pos;
    }

    /**
     * 验证输入内容
     * @param source
     * @param negative
     * @param decimal
     * @param maxLength
     * @returns {boolean}
     */
    function validateInput(source, negative, decimal, maxLength) {
        negative = negative == null ? 0 : negative;
        decimal = decimal == null ? 0 : decimal;
        var pattern = null;
        if(negative == -1 || negative == 0) {
            --maxLength;
        }
        var intLength = maxLength - decimal -1;

        if(negative == -1 && decimal == 0) {        // 负整数(允许只输入0)
            // /^(0|-([1-9]\d{0,13})?)$/
            pattern = "^(0|-([1-9]\\d{0," + intLength + "})?)$";
        } else if(negative == 0 && decimal ==0) {   // 整数(允许只输入0)
            // /^(0|-?([1-9]\d{0,13})?)$/
            pattern = "^(0|-?([1-9]\\d{0," + intLength + "})?)$";
        } else if(negative == 1 && decimal == 0) {  // 正整数(允许只输入0)
            // /^(0|[1-9]\d{0,13})$/
            pattern = "^(0|[1-9]\\d{0," + intLength + "})$";
        } else if(negative == -1 && decimal > 0) {  // 负小数(允许只输入0)
            // /^(0|-((0|[1-9]\d{0,13})(\.\d{0,2})?)?)$/
            pattern = "^(0|-((0|[1-9]\\d{0," + intLength + "})(\\.\\d{0," + decimal + "})?)?)$";
        } else if(negative == 0 && decimal > 0) {   // 小数(允许只输入0)
            // /^-?((0|[1-9]\d{0,13})(\.\d{0,2})?)?$/
            pattern = "^-?((0|[1-9]\\d{0," + intLength + "})(\\.\\d{0," + decimal + "})?)?$";
        } else if(negative == 1 && decimal > 0) {   // 正小数(允许只输入0)
            // /^(0|[1-9]\d{0,13})(\.\d{0,2})?$/
            pattern = "^(0|[1-9]\\d{0," + intLength + "})(\\.\\d{0," + decimal + "})?$";
        }

        if(pattern != null) {
            var regexp = new RegExp(pattern, "g");
            return regexp.test(source);
        } else {
            return false;
        }
    }

    this.onkeydown = function(eventObj) {
        var evt = event || window.event;
        var code = evt.keyCode;
        var specialKeys = [
            8,  /* Backspace */
            35, /* End */
            36, /* Home */
            37, /* Left Arrow */
            38, /* Up Arrow */
            39, /* Right Arrow */
            40, /* Down Arrow */
            46  /* Del */
        ];
        for(var i = 0; i < specialKeys.length; ++i) {
            if(code == specialKeys[i]) {
                stopPropagation(evt);
                return;
            }
        }

        var keys = [
            48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 13, 189, 190,
            96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 108, 109, 110
        ];
        for(var i = 0; i < keys.length; ++i) {
            if(code == keys[i]) {
                return;
            }
        }

        preventDefault(evt);
    };

    /**
     * 修正用户输入
     * @param eventObj
     */
    this.fixInput = function(eventObj) {
        var source = eventObj.value;
        if(source == "-" || source == "-0") {
            eventObj.value = "0";
        }

        var numValue = new Number(source);
        if(isNaN(numValue)) {
            eventObj.value = "";
        }
    };

    this.number = function(eventObj, negative, clazz, decimal){
        var evt = event || window.event;
        var ch = String.fromCharCode(evt.charCode);
        var text = eventObj.value;
        var selectedText = getSelectedText();
        var pos = getCursorPosition(eventObj);
        var left = text.substring(0, pos);
        var right = text.substring(pos + selectedText.length);
        var source = left + ch + right;
        var maxLength = eventObj.maxLength;
        --maxLength;
        var valid = false;
        if(clazz == "Double" || clazz == "BigDecimal") {
            if(maxLength <0) maxLength = 15;
            valid = validateInput(source, negative, decimal, maxLength);
        }else if(clazz == "Integer") {
            if(maxLength <0) maxLength = 9;
            valid = validateInput(source, negative, 0, maxLength);
            if(valid == true && source != "-") {
                source = parseInt(source);
                valid = source == Math.min(source, 2147483647);
                if(valid == true) {
                    valid = source == Math.max(source, -2147483647);
                }
            }
        }else if(clazz == "Long" && source != "-") {
            if(maxLength <0) maxLength = 18;
            valid = validateInput(source, negative, 0, maxLength);
            if(valid == true) {
                source = parseInt(source);
                valid = source == Math.min(source, 9223372036854775808);
                if(valid == true) {
                    valid = source == Math.max(source, -9223372036854775808);
                }
            }
        }else if(clazz == "Short" && source != "-"){
            if(maxLength <0) maxLength = 4;
            valid = validateInput(source, negative, 0, maxLength);
            if(valid == true) {
                source = parseInt(source);
                valid = source == Math.min(source, 32767);
                if(valid == true) {
                    valid = source == Math.max(source, -32768);
                }
            }
        }

        if(valid == false) {
            preventDefault(evt);
        }
    };
};
jaf.server = new function(){
    this.message = new function() {
        var call = null;
        var type = "error";
        var closeable = true;
        var singleton = false;
        this.setCallback = function (__call) {
            call = __call;
        };
        this.setType = function (__type) {
            type = __type;
        };
        this.setCloseable = function (__closeable) {
            closeable = __closeable;
        };
        this.setSingleton = function (__singleton) {
            singleton = __singleton;
        };
        this.alert = function (message, title) {
            jaf.alert(message, call, title, type, closeable, singleton);
        };
    };
};
jaf.addOnLoadListener(function(){

    try {
        var errorObj = document.getElementById("struts2ActionMessage");
        if (errorObj) {
            var err = errorObj.innerHTML;
            if (err != "")  jaf.server.message.alert(err);
        }
    } catch (e) {
        alert(e);
    }

    try{
        var errorObj = document.getElementById("actionException");
        if (errorObj) {
            var err = errorObj.innerHTML;
            if (err == "") return;
            err = eval("[" + errorObj.innerHTML + "]")[0];
            jaf.server.message.setType(err.type);
            window.setTimeout(function(){
                jaf.server.message.alert(err.message, err.subject);
            },10);
        }
    } catch (e) {
        alert(e);
    }
});
