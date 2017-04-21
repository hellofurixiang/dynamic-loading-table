/**
 * 流向用户选择
 * @param eventObj
 */
function FUS(eventObj) {
    if (eventObj.type == "checbox" && !eventObj.checked) return;
    var parentObj = eventObj.parentNode;
    var userReSelect = false;
    if (eventObj.tagName == "span" || eventObj.tagName == "SPAN") {
        eventObj = parentObj.getElementsByTagName("input")[0];
        eventObj.checked = true;
        userReSelect = true;
    }
    eventObj.window = window;

    var propertiesObj = eventObj.getAttribute("property");
    //alert(eval("[" +propertiesObj+"]"));
    propertiesObj = eval("[" + propertiesObj + "]")[0];
    var flowOperatorVerify = eventObj.className == "isEndNode" ? false : true;
    flowOperatorVerify = propertiesObj.transferType == "SELF" ? false : flowOperatorVerify;

    var listener = function(){
        FCV.check(true);
    };
    if(flowOperatorVerify) {
        HqSoftFormFieldValidator.addListener(HqSoftFormFieldValidator.ValidatorEvent.after, listener);
    }else{
        HqSoftFormFieldValidator.removeListener(HqSoftFormFieldValidator.ValidatorEvent.after, listener);
        return;
    }

    if (propertiesObj.operator.account != "" && propertiesObj.operator.name != "" && !userReSelect) {
        return;
    }

    var eventObjValue = eval("[" + eventObj.value + "]")[0];

    if (eventObjValue.oaccounts != "" && !userReSelect) return;

    var targetUrl = ctx + "/flow/flow-user-selector.jhtml";
    targetUrl += "?instance.id=" + eventObjValue["instance.id"];
    targetUrl += "&node.id=" + propertiesObj.node;
    targetUrl += "&flow.id=" + eventObjValue["flow.id"];
    targetUrl += "&propertiesjson={type:'" + propertiesObj.type + "'}";
    targetUrl += "&accounts=" + eventObjValue.oaccounts;

    top.jaf.dialog.open(targetUrl, 700);

    top.jaf.picker.users.setCallback(function (accountArg, nameArg) {
        var accounts = "";
        var names = "";
        for (var i = 0; i < accountArg.length; i++) {
            accounts += accountArg[i] + ",";
            names += nameArg[i].replace(/\((.*?)\)/, "") + ",";
        }
        accounts = accounts.length > 1 ? accounts.substring(0, accounts.length - 1) : accounts;
        names = names.length > 1 ? names.substring(0, names.length - 1) : names;
        parentObj.getElementsByTagName("span")[0].innerHTML = names;
        eventObjValue.oaccounts = accounts;
        eventObj.value = encode(eventObjValue);
    });

    function encode(jsonObj) {
        return "{'flow.id':'" + jsonObj["flow.id"] + "','oaccounts':'" + jsonObj.oaccounts + "','instance.id':'" + jsonObj["instance.id"] + "','flow.needDefOpinion':" + jsonObj["flow.needDefOpinion"] + "}";
    }
}

var FCV = new function(){
    this.check = function(all){
        var msgObj = document.getElementById("flow-msg");
        if (msgObj != null) {
            //清除错误
            msgObj.innerHTML = "";
            msgObj.style.display = "none";
        }

        var controlOptions = document.getElementById("flow-pools");
        if (controlOptions == null) return true;
        var flows = controlOptions.getElementsByTagName("li");
        for (var i = 0; i < flows.length; i++) {
            var inputs = flows[i].getElementsByTagName("input");
            var eventObj = inputs[0];
            if ((eventObj.type == "radio" || eventObj.type == "checkbox") && eventObj.checked) {
                if(all) {//all等于true是验证必须选下一环节处理人
                    var propertiesObj = eventObj.getAttribute("property");
                    //alert(eval("[" +propertiesObj+"]"));
                    propertiesObj = eval("[" + propertiesObj + "]")[0];

                    var flowOperatorVerify = eventObj.className != "isEndNode";
                    flowOperatorVerify = propertiesObj.transferType == "SELF" ? false : flowOperatorVerify;

                    var eventObjValue = eval("[" + eventObj.value + "]")[0];
                    var accounts = eventObjValue.oaccounts;
                    if (accounts != "" || eventObj.className == "isEndNode" || !flowOperatorVerify) return true;
                }else{
                    return true;
                }
            }
        }

        //显示错误
        var msg = "您必须选择一个流向并设置该流向的处理人员。";
        msgObj.innerHTML = "<div>" + msg + "</div>";
        msgObj.style.display = "block";
        msgObj.style.marginTop = (controlOptions.offsetHeight - msgObj.offsetHeight) / 2 + "px";
        throw new Error(msg);
    };
};

/**
 * 加载流程图
 * @constructor
 * @Deprecated
 */
function LFI(id, panel) {
    //swf loader
    //swfobject.embedSWF("${ctx}/swf/workflow.swf?t=" + Math.random(), "flow-chart-panel", "100%", "300", "9.0.0", "expressInstall.swf",{"dataJson" : "operate-${wf.code}-json---${wf.id}-0-0-0-0-.flow"},{"wmode":"transparent","menu":"false"});

    //image loader
    var dom = document.getElementById(panel);
    dom.style.height = "400px";
    dom.style.position = "relative";
    dom.style.overflow = "hidden";
    var iFrame = document.createElement("iframe");
    iFrame.width = "100%";
    iFrame.height = "400px";
    iFrame.frameBorder = "0px";
    iFrame.src = ctx + "/flow/operate!image.jhtml?wf.id=" + id;
    dom.appendChild(iFrame);
}

/**
 * 弹出显示流程图
 */
function SFI(name, id) {
    var url = ctx + "/flow/operate!image.jhtml?wf.id=" + id;
    //var dom = document.createElement("div");
    //dom.style.display = "none";
    //dom.id = "flow-chart-pop-panel";
    //document.body.appendChild(dom);
    jaf.dialog.open(url, "60%", name);
    //swfobject.embedSWF(ctx + "/swf/workflow.swf?t=" + Math.random(), "flow-chart-pop-panel", "100%", "400", "9.0.0", "expressInstall.swf",{"dataJson" : url},{"wmode":"transparent","menu":"false"});
}

/**
 * 默认审核意见显视
 */
function DOSD(obj, opinions) {
    if (typeof(obj) == "string") {
        obj = document.getElementById(obj);
    }
    if (obj == null || opinions == null || opinions == "") return;
    var opinionArray = opinions.split(",");
    if (opinionArray.length <= 0) return;
    var ul = document.createElement("ul");
    with (ul.style) {
        border = "1px solid #ccc";
        backgroundColor = "#ffffff";
        position = "absolute";
        display = "none";
    }

    var currSelection = "";
    for (var i = 0; i < opinionArray.length; i++) {
        var li = document.createElement("li");
        li.innerHTML = opinionArray[i];
        with (li.style) {
            padding = "5px 10px";
            cursor = "default";
        }
        li.onmouseover = function () {
            this.style.backgroundColor = "#f5f5f5";
            currSelection = this.innerHTML;
        };
        li.onmouseout = function () {
            this.style.backgroundColor = "#ffffff";
            currSelection = "";
        };
        li.onclick = function () {
            obj.value = this.innerHTML;
            hidden();
        };
        ul.appendChild(li);
    }
    obj.parentNode.appendChild(ul);

    obj.onclick = show;
    obj.onfocus = show;
    obj.onblur = function () {
        hidden();
        if (currSelection == "") return;
        this.value = currSelection;
    };

    function hidden() {
        ul.style.display = "none";
    }

    function show() {
        ul.style.display = "block";
    }
}

var intervention = new Intervention();
/**
 * 流程控制
 * @returns
 */
function Intervention() {
    var wfInstanceId = null;
    var wfCode = null;
    var paramObject = null;

    function interventionCallBack(event, params) {
        if (params.type == "start") {
            top.jaf.alert("不允许直接回到起点！！");
            return;
        }
        if (params.type == "end") {
            top.jaf.alert("不允许直接结束流程！！");
            return;
        }
        params.from = (paramObject.from == null || paramObject.from == undefined) ? "" : paramObject.from;
        params.to = params.id;
        changeOperator(event, params);
    }

    this.withdraw = function (__wfInstanceId) {
        var urlParam = "instance.id=" + __wfInstanceId + "&flag=" + window.name;
        top.jaf.dialog.open(ctx + "/flow/flow-operator-withdraw.jhtml?" + urlParam, 500, "填写撤回流程的原因");
    };

    this.alert = function (__wfInstanceId, __wfNode) {
        top.jaf.loading.open("<span style='font-size:14px;'>正在发送催办提醒消息。请稍候......</span>");
        var url = ctx + "/flow/flow-operator-urgent-alert.jhtml";
        var params = {"instance.id": __wfInstanceId};
        if (__wfNode != undefined && __wfNode != null) {
            params["from.id"] = __wfNode;
        }
        $.post(url,params, function (data) {
                if (data == "success") {
                    top.jaf.loading.open("<span style='font-size:14px;'>成功提醒到对应的处理人！</span>", false);
                    window.setTimeout(function () {top.jaf.loading.close();}, 2000);
                }else{
                    top.jaf.alert("发送催办提醒消息失败！");
                }
            }, "text");
    };

    this.display = function (event, __wfInstanceId, __wfCode, param) {
        wfInstanceId = __wfInstanceId;
        wfCode = __wfCode;
        paramObject = param;
        interventionCallBack(event, param);
    };

    this.operator = new function () {
        var currNode = null;
        var __event = null;
        this.change = function (event, __wfInstanceId, __wfCode, param) {
            event.window = window;
            __event = event;
            wfInstanceId = __wfInstanceId;
            wfCode = __wfCode;
            paramObject = param;
            var url = ctx + "/flow/flow-operator-nodes.jhtml";
            var params = {"instance.id": __wfInstanceId};
            $.post(url, params, function (data) {
                success(data);
            }, "json");
        };

        this.node = function (id) {
            currNode = id;
        };

        this.post = function () {
            if (currNode == null || currNode == "") return;
            changeOperator(__event, {from: currNode, to: currNode});
        };

        function success(data) {
            if (data == null || data.length <= 0) return;
            var content = "	<div style=\"font-size:14px; background: #f9f9f9 url('" + ctx + "/images/icon-to-right-arrow.png') no-repeat 3px center;padding:5px 5px 5px 30px; border:1px solid #ccc;\">该流程当前处理的节点有多个，请选择要变更办理人的节点</div>" +
                "<ul style=\"list-style: none; padding-left:28px; padding-top:5px;font-size:14px;background: #f9f9f9;border:1px solid #ccc; margin-top:-1px;\">";
            var size = 0;
            for (var key in data) {
                var __node = data[key];
                content += "<li><label><input name=\"node\" type=\"radio\" value=\"" + __node.id + "\" onclick=\"try{intervention.operator.node(this.value);}catch(e){FSC.getFrame().contentWindow.intervention.operator.node(this.value);}\" /> " + __node.name + " <span style=\"font-size:9pt;color:#003399;\">" + __node.operators + "</span></label></li>";
                size++;
            }
            content += "<li class=\"btns\" style=\"padding:5px 5px 5px 25px;\"><input type=\"button\" id=\"submit\" class=\"red\" value=\" 确 定 \" onclick=\"try{intervention.operator.post();}catch(e){FSC.getFrame().contentWindow.intervention.operator.post();}\" /></li>";
            content += "</ul>";
            if (size == 1) {
                changeOperator(__event, {from: paramObject.from, to: paramObject.to});
                return;
            }
            var dialog = top.jaf.dialog;
            dialog.open();
            dialog.body(context);
            dialog.width(500);
            dialog.title("请选择需要变更办理人的节点");
        }
    };

    function changeOperator(event, params) {
        event.window = window;

        var targetUrl = ctx + "/flow/flow-user-selector.jhtml";
        targetUrl += "?instance.id=" + wfInstanceId;
        targetUrl += "&node.id=" + params.to;
        targetUrl += "&type=functional-role";
        targetUrl += "&propertiesjson={type:'more'}";

        top.jaf.dialog.open(targetUrl, 700, "选择处理人")

        top.jaf.picker.users.setCallback(function (accountArg, nameArg) {
            top.jaf.loading.open();
            var selectAccounts = accountArg.join(",");
            var __iframe = event.window.document.getElementById("__form_submit__");
            var src = "";
            try {
                src = ctx + "/flow/flow-operator-change.jhtml?instance.definition.code=" + wfCode + "&accounts=" + selectAccounts + "&instance.id=" + wfInstanceId + "&from.id=" + params.from + "&to.id=" + params.to;
            } catch (e) {
                alert(e);
                return;
            }
            __iframe.contentWindow.location.assign(src);
        });
    }
}

/**
 * 处理历史记录
 * @returns
 */
var PH = new function() {

    var id = null;
    var lastDisplayObj = null;

    function Display(eventObj) {
        id = eventObj.parentNode.getElementsByTagName("input")[0].value;
        if (id == null || id == "") return;
        var frames = eventObj.parentNode.parentNode.getElementsByTagName("div");
        var displayFrame = frames["display_frame_" + id];

        if (displayFrame == null) displayFrame = createFrameDiv(eventObj.parentNode.parentNode);
        if (displayFrame.style.display == "block") {
            displayFrame.style.display = "none";
            return;
        }

        displayFrame.style.display = "block";
        if (lastDisplayObj != null && lastDisplayObj.id != displayFrame.id) {
            lastDisplayObj.style.display = "none";
        }
        lastDisplayObj = displayFrame;
    }

    this.display = Display;

    function createFrameDiv(panel) {
        var div = document.createElement("div");
        div.id = "display_frame_" + id;
        div.className = "display-frame";

        var loadingDiv = document.createElement("div");
        loadingDiv.className = "loading";
        loadingDiv.id = "loader_iframe_" + id + "_loading_";
        div.appendChild(loadingDiv);

        var iframe = createIframe(div);
        var loading = new Loading(loadingDiv, iframe);

        div.appendChild(iframe);
        panel.appendChild(div);
        iframe.src = ctx + "/flow/operate!detail.jhtml?id=" + id;
        loading.show();
        return div;
    }

    function createIframe(frame) {
        var iframe = document.createElement("iframe");
        iframe.id = "loader_iframe_" + id;
        iframe.width = "100%";
        iframe.frameBorder = 0;
        iframe.srolling = "auto";
        return iframe;
    }
};
var IR = new function() {
    this.success = function () {
        top.jaf.loading.close();
        top.FSC.close(true);
    };
};

jaf.addOnLoadListener(function(){
    HqSoftFormFieldValidator.addListener(HqSoftFormFieldValidator.ValidatorEvent.after, function(){
        FCV.check(false);
    });
});