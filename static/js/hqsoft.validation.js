/**
 * 表单字段数据验证器
 * @class HqSoftFormFieldValidator
 * @static
 * @type {Object}
 */
var HqSoftFormFieldValidator = new function(){
	var Event = {before:"before", after:"after"};

	/**
	 * 监听器类型
	 * @type {{before: string, after: string}}
	 */
	this.ValidatorEvent = Event;

	var listeners = [];
	var config = {};
	var fieldVerify = true;

	/**
	 * 增加监听器
	 * @method addListener
	 * @param event 监听事件，参见 ValidatorEvent
	 * @param listener 监听器
	 */
	this.addListener = function(event, listener){
		if(event == null || listener == null) return;
		listeners.push([event, listener]);
	};

	this.removeListener = function(event, listener){
		if(event == null || listener == null || listeners.length <= 0) return;
		for(var i=0;i<listeners.length;i++){
			if(event == listeners[i][0] && listener == listeners[i][1]) {
				listeners.d_pop(i);
				return;
			}
		}
	};

	function fireVerifyListener(event){
		for(var i=0;i<listeners.length;i++){
			if(listeners[i][0] != event) continue;
			try{
				listeners[i][1]();
			}catch(e){
				return false;
			}
		}
		return true;
	}

	String.prototype.trim=function(){
		return this.replace(/(^\s*)|(\s*$)/g, "");
	};

	var _PARAMS_ = null;
	var paramObjects = {};

	function addCursorControlEvent(form){
		//为列表表格加入点击事件
		if (window.addEventListener){
			document.addEventListener("onkeydown",docOnKeyDown,false);
		}else{
			document.attachEvent("onkeydown",docOnKeyDown);
		}

		document.onkeydown = docOnKeyDown;

		var elements = $("form[name='" + form.name + "']").find(":text"); // 获取表单中的所有输入框
		var ele = getFocusElement(0);
		if(ele == null) return;
		ele.focus();

		function docOnKeyDown(){
			var e = window.event;
			var keyCode = e.keyCode;
			if(!(keyCode == 9 || keyCode == 13)) return;
			if(keyCode == 9){
				if (e && e.preventDefault){
					// 阻止默认浏览器动作(W3C)
					e.preventDefault();
				}else{
					// IE中阻止函数器默认动作的方式
					e.returnValue = false;
				}
			}
			var element = e.srcElement;
			if(!check(element)) return;
			var idx = elements.index(element);
			element = getFocusElement(idx + 1);
			if(element == null) return;
			element.focus();
		}

		function check(element){
			if(element.className.indexOf("no-cursor-control") != -1) return false;
			var tagName = element.tagName;
			var type = element.type;
			if(!(tagName == "INPUT" || tagName == "TEXTAREA")) return false;
			if(type == "hidden" || type == "button") return false;

			var readonly = element.readOnly;
			readonly = readonly == null ? false : readonly;
			readonly = (typeof(readonly) == "string") ? true : readonly;
			if(readonly) return false;
			return true;
		}

		function getFocusElement(index){
			var element = elements[index];
			if(element == null) return null;
			if(check(element)){
				element.select();
				return element;
			}else{
				return getFocusElement(++index);
			}
		}
	}

	/**
	 * 初化化验证器
	 * @method init
	 * @param params 验证器的初始参数对象
	 */
	this.init = function(params){
		_PARAMS_ = params;
		if(params == null || params.length <= 0) return;
		for(var i=0;i<params.length;i++){
			var paramObj = params[i];
			var inputObj = document.getElementById(paramObj.id);
			if(inputObj == null) continue;
			paramObjects[paramObj.id] = paramObj;
			paramObjects[paramObj.id].index = i;
			if(inputObj.tagName != "INPUT" && inputObj.tagName != "SELECT" && inputObj.tagName != "TEXTAREA") continue;
			inputObj.paramObj = paramObj;

			//在焦点移开时验证
			inputObj.onblur = function(){
				//当验证通过时清除错误信息
				if(dataClassVerify(this) && regexVerify(this)){
					clearError(this);
					return;
				}
				if(config.onblur != null && !config.onblur) return;
				//只有当验证不通过时才改变其CSS样式，显示错误信息
				showError(this);
			};

			//当验证类型为字符并且设置了最大长度时，绑定 onKeyUp 事件，每次按键时都显示当前输入字符个数及还可输入字符个数
			if(paramObj.clazz != "string" || paramObj.maxLength == undefined) continue;
			inputObj.onkeyup = function(){
				if(!this.err) return;
				var _len = getLength(this.value);
				if(this.paramObj.minLength - _len > 0){
					this.msg = "最少输入" + this.paramObj.minLength + "个字符,还要输入" + (this.paramObj.minLength - _len) + "个字符";
					showWarning(this);
				}
				if(this.paramObj.maxLength - _len >= 0){
					this.msg = "最多" + this.paramObj.maxLength + "个字符,还能输入" + (this.paramObj.maxLength - _len) + "个字符";
					showWarning(this);
				}else{
					this.value = this.value.substring(0, this.paramObj.maxLength);
				}
			};
		}
		return this;
	};

	/**
	 * 单步认证方法
	 * @method signVerification
	 * @param id 控件的 id
	 */
	this.signVerification = function(id){
		var inputObj = document.getElementById(id);
		if(inputObj == null) return;
		//var value = inputObj.value;
		//当验证通过时清除错误信息
		if(dataClassVerify(inputObj) && regexVerify(inputObj)){
			clearError(inputObj);
			return;
		}
		//只有当验证不通过时才改变其CSS样式，显示错误信息
		showError(inputObj);
	};

	/**
	 * 批量认证方法
	 * @method verification
	 * @param required 是否进行必填验证
	 */
	this.verification = function(required){
		if(!fieldVerify) return true;
		var params = _PARAMS_;
		var passed = true;
		if(!fireVerifyListener(Event.before)) return;
		if(params != null && params.length > 0) {
			for (var i = 0; i < params.length; i++) {
				var paramObj = params[i];
				var inputObj = document.getElementById(paramObj.id);
				if (inputObj == null) continue;
				if (inputObj.tagName != "INPUT" && inputObj.tagName != "SELECT" && inputObj.tagName != "TEXTAREA") continue;
				//当验证通过时清除错误信息
				if (dataClassVerify(inputObj, required) && regexVerify(inputObj)) {
					clearError(inputObj);
					continue;
				}
				//只有当验证不通过时才改变其CSS样式，显示错误信息
				showError(inputObj);
				passed = false;
				if (config.all != null && !config.all) break;
			}
		}
		return passed && fireVerifyListener(Event.after);
	};

	//获取字符串长度
	function getLength(strTemp) {
		var i, sum;
		sum = 0;
		for (i = 0; i < strTemp.length; i++) {
			if ((strTemp.charCodeAt(i) >= 0) && (strTemp.charCodeAt(i) <= 255))
				sum = sum + 1;
			else
				sum = sum + 2;
		}
		return sum;
	}

	//数据类型验证
	function dataClassVerify(inputObj, requiredVerify){
		var __value = inputObj.value;
		var _len = getLength(inputObj.value);
		var __paramObj = inputObj.paramObj;
		if(__paramObj == undefined) return true;
		inputObj.err = false;

		//依赖验证
		var dependVerify = true;
		if(__paramObj.required != undefined && __paramObj.required != ""){
			var __tmp = false;
			try{__tmp = eval(__paramObj.required);}catch(e){}
			if(__paramObj.required == "true" || __tmp){
				dependVerify = true;
			}else{
				dependVerify = false;
			}
		}

		//是否必填
		//alert(requiredVerify == undefined || requiredVerify == true);
		//return;
		if(requiredVerify == undefined || requiredVerify == true){
			if(dependVerify && __paramObj.required != undefined && __paramObj.required && __value.trim() == ""){
				var msg = __paramObj.msg;
				if(msg == null){
					msg = "此项为必填项";
					if(__paramObj.maxLength != undefined && __paramObj.maxLength > 0){
						msg += "，并且此项最多只能输入" + __paramObj.maxLength + "个字";
					}
				}
				if(inputObj.type == "hidden"){
					msg = "必填项 <b>“" + __paramObj.name + "”</b> 不能为空。";
				}
				inputObj.msg = msg;
				inputObj.err = true;
				return false;
			}
			else if(__paramObj.minLength != undefined && __paramObj.minLength > 0){
				if(__paramObj.minLength - _len > 0){
					inputObj.msg = "最少输入" + __paramObj.minLength + "个字符,还要输入" + (__paramObj.minLength - _len) + "个字符";
					inputObj.err = true;
					return false;
				}
			}
		}

		var fieldClazz = __paramObj.clazz;
		fieldClazz = fieldClazz.toLowerCase();

		//字符类型
		if(fieldClazz == "string"){
			if(__paramObj.maxLength == undefined || __paramObj.maxLength == "") return true;
			if(__paramObj.maxLength < _len){
				inputObj.msg = "最多能输入" + _len + "/" + __paramObj.maxLength + "个字符,超出的部分将会自动截断！！！";
				inputObj.err = true;
				var value = inputObj.value;
				inputObj.value = value.substring(0, __paramObj.maxLength);
				return false;
			}
		}

		//数字整型
		if(fieldClazz == "int" || fieldClazz == "integer" || fieldClazz == "double" || fieldClazz == "long"){
			//如果该字段允许空值，不进行正则表达式验证
			var patn = /\d/;
			if(__value.trim() != "" && !patn.test(__value)){
				inputObj.msg = "此项只能输入数字";
				inputObj.err = true;
				return false;
			}
		}

		//日期类型
		if(fieldClazz == "date"){
			//如果该字段允许空值，不进行正则表达式验证
			var patn = /^\d{4}\-\d{1,2}-\d{1,2}| \d{1,2}:\d{1,2}:\d{1,2}.\d{1,1}$/;
			if(__value.trim() != "" && !patn.test(__value)){
				inputObj.msg = "请输入一个正确的日期格式，如：2012-12-12";
				inputObj.err = true;
				return false;
			}
		}

		//时间类型
		if(fieldClazz == "time"){
			//如果该字段允许空值，不进行正则表达式验证
			var patn = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
			if(__value.trim() != "" && !patn.test(__value)){
				inputObj.msg = "请输入一个正确的时间格式，如：2012-12-12 12:12:00";
				inputObj.err = true;
				return false;
			}
		}

		//自定义验证
		if(inputObj.vcb != null){
			var result = inputObj.vcb(inputObj, __value.trim());
			if(result == null || (result != false && result != true)){
				inputObj.msg = inputObj.id + " 的自定义字段验证方法必须返回一个Boolean值";
				inputObj.err = true;
				return false;
			}
			return result;
		}
		return true;
	}

	//正则表达式验证
	function regexVerify(inputObj){
		var __paramObj = inputObj.paramObj;
		if(__paramObj == undefined) return true;
		var value = inputObj.value;
		if(__paramObj.regex == undefined || __paramObj.regex == "") return true;
		var patn = __paramObj.regex;
		if(!patn.test(value)){
			inputObj.msg = "此项验证不通过，请确认你的输入是否正确";
			inputObj.err = true;
			return false;
		}
		return true;
	}

	//显示错误
	function showError(__inputObj){
		if(__inputObj.type == "hidden"){
			jaf.alert(__inputObj.msg,null,"提示","warning");
			return;
		}

		clearError(__inputObj);
		displayMsg(__inputObj);
		var parentNode = __inputObj.parentNode;
		var msgObj = parentNode.getElementsByTagName("div")[0];
		//var target = msgObj.getElementsByTagName("div")[0];
		msgObj.className = "msg error";
		//__inputObj.focus();
	}

	/**
	 * 显示错误
	 * @method error
	 * @param __inputObj HtmlElement对象
	 * @param msg 错误消息
	 */
	this.error = function(__inputObj, msg){
		if(__inputObj == null || msg == "") return;
		if(typeof(__inputObj) == "string"){
			__inputObj = document.getElementById(__inputObj);
		}
		if(__inputObj == null){
			alert("show field verify has error: input object was null!");
		}else {
			__inputObj.msg = msg;
			showError(__inputObj);
		}
	}

	//显示警告
	function showWarning(__inputObj){
		clearError(__inputObj);
		displayMsg(__inputObj);
		var parentNode = __inputObj.parentNode;
		var msgObj = parentNode.getElementsByTagName("div")[0];
		var target = msgObj.getElementsByTagName("div")[0];
		msgObj.className = "msg warning";
		target.focus();
	}

	/**
	 * 显示警告
	 * @param __inputObj HtmlElement对象
	 * @param msg 警告消息
	 */
	this.warning = function(__inputObj, msg){
		if(__inputObj == null || msg == "") return;
		__inputObj.msg = msg;
		showWarning(__inputObj);
	};

	//清除错误
	function clearError(__inputObj){
		if(__inputObj.type == "hidden") return;
		var parentNode = __inputObj.parentNode;
		var msgObj = parentNode.getElementsByTagName("div")[0];
		try{
			if(msgObj != null){
				parentNode.removeChild(msgObj);
			}
		}catch(e){}
	}

	//显示提示信息
	function displayMsg(__inputObj){
		var parentNode = __inputObj.parentNode;
		var msgObj = parentNode.getElementsByTagName("div")[0];
		if(msgObj == null){
			msgObj = document.createElement("div");
		}
		msgObj.id = __inputObj.id + "_msg";
		var msgContainer = document.createElement("div");
		var em = document.createElement("em");
		em.innerHTML = __inputObj.msg;
		var closeBtn = document.createElement("a");
		closeBtn.href = "javascript:;";
		closeBtn.onclick = function(){
			clearError(__inputObj);
		};
		em.appendChild(closeBtn);
		msgContainer.appendChild(em);
		msgObj.className = "msg";
		msgObj.appendChild(msgContainer);
		//parentNode.appendChild(msgObj);
		if (parentNode.lastChild == __inputObj) {
			// 如果最后的节点是目标元素，则直接添加。因为默认是最后
			parentNode.appendChild(msgObj);
		}else {
			//如果不是，则插入在目标元素的下一个兄弟节点 的前面。也就是目标元素的后面
			parentNode.insertBefore(msgObj, __inputObj.nextSibling);
		}
		//msgContainer.style.marginLeft = - (msgContainer.offsetWidth - 2) + "px";
	}

	function DisabledBtnTimer(){
		var timer = 5000;
		var disabledBtnTimerInterval = null;
		this.disabled = function(btnObj){
			var value = btnObj.value;
			btnObj.disabled = "disabled";
			btnObj.value = value + "(" + timer / 1000 + ")";
			disabledBtnTimerInterval = window.setInterval(function(){
				if(timer <= 0){
					window.clearInterval(disabledBtnTimerInterval);
					disabledBtnTimerInterval = null;
					btnObj.disabled = false;
					btnObj.value = value;
					return;
				}
				timer -= 1000;
				btnObj.value = value + "(" + timer / 1000 + ")";
			}, 1000);
		};
	}

	/**
	 * 控制是否验证字段数据
	 * @method setFieldVerify
	 * @param value true|false
	 */
	this.setFieldVerify = function(value){
		fieldVerify = value;
	};

	this.banding = function(form, __config){
		if(__config != undefined && __config != null){
			config = __config;
		}
		var btns = null;
		try{
			btns = document.getElementById("form.btns").getElementsByTagName("input");
		}catch(e){}
		var initialAction = form.action;
		var submitBtn = null;
		addCursorControlEvent(form);
		form.onsubmit = function(){
			var verify = HqSoftFormFieldValidator.verification();
			if(!verify) return false;
			try{btns["submit"].disabled = true;}catch(e){}
			if(submitBtn == null) return true;
			new DisabledBtnTimer().disabled(submitBtn);
			return true;
		};

		if(btns == null) return;

		try{
			btns["save"].onclick = function(){
				form.action = initialAction;
				submitBtn = this;
			};
		}catch(e){}

		try{
			btns["__reset__"].onclick = function(){
				try{form.reset();}catch(e){}
			};
		}catch(e){}

		try{
			var oldCancelFun = btns["cancel"].onclick;
			btns["cancel"].onclick = function(){
				try{oldCancelFun();}catch(e){}
				try{CancelBtnEvent();}catch(e){}
			};
		}catch(e){}

		try{
			btns["invoke"].onclick = function(){
				form.action = initialAction.replace("save", "invoke");
				if(form.onsubmit()) {
					var targetFrame = $("iframe#__form_target__");
					if(targetFrame.length){
						$(targetFrame).load(function() {
							top.jaf.loading.close();
						});
						top.jaf.loading.open(null, true);
					}
					form.submit();
				}
				submitBtn = this;
			};
		}catch(e){}
	};
};

var FieldVerify = new function(){
	this.msg = function(msg){
        jaf.alert(msg);
	};
};