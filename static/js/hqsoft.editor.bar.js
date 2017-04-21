/**
 * 编辑页面的操作条操作对象
 * @module OBF
 * @class OBF
 * @type {OBF}
 */
var OBF = new function(){
	var btns = {};
	var panel = null;
	var page = null;
	var listeners = [];//二维数组

	/**
	 * 事件类型
	 * @property  Events
	 * @type {{save: string, delete: string}}
	 */
	this.Events = {save: "save", delete: "delete"};
	
	var SMS = new StatusMachineSwitch();
	
	function StatusMachineSwitch() {
		function reset(){
			for(var btn in btns){
				try{
					btns[btn].obj.input.disabled = false;
				}catch(e){}
			}
		}
		this.execute = function(method){
            try {
                $(btns[method].obj).attr("class","curr");
            }catch(e){}
            /*
			if(paramsObj == null) return;
			var disabledRadioTargets = paramsObj.disableds;
			if(disabledRadioTargets == null || disabledRadioTargets.length <= 0) return;
			for(var i=0;i<disabledRadioTargets.length;i++){
				try{
					btns[disabledRadioTargets[i]].obj.element.className = "disabled";
					btns[disabledRadioTargets[i]].obj.input.disabled = true;
				}catch(e){}
			}
            */
		};
    }

	function fireInvokeListener(event){
		for(var i=0;i<listeners.length;i++){
			if(listeners[i][0] != event) continue;
			try {
				listeners[i][1]();
			}catch(e){
				//jaf.alert(e.message);
				return false;
			}
		}
		return true;
	}

	/**
	 * 增加一个监听器
	 * @method addListener
	 * @param event 监听器的类型
	 * @param listener 监听器
	 */
	this.addListener = function(event, listener){
		if(event == null || event == "" || listener == null) return;
		listeners.push([event, listener]);
	};

	/**
	 * 刷新当前标签中的页面内容
	 * @method refresh
	 */
    this.refresh = function(){
		location.reload();
	};

	/**
	 * 关闭
	 * @event close
	 */
	this.close = function(){
		if(window.name == "lightbox_iframe_body"){
			top.MD.close();
		}else{
			top.FSC.close();
		}
	};

	/**
	 * 撤销
	 * @event undo
	 */
	this.undo = function(){
		var url = btns["open"].param.url;
		url = url.replace("{id}", page.id == null ? "" : page.id);
		document.location.assign(ctx + url);
	};

	/**
	 * 保存
	 * @event save
	 */
	this.save = function(){
		if(!page.form.onsubmit()) return;
		var targetFrame = $("#" + page.form.target);
		if(targetFrame.length){
			$(targetFrame).load(function() {
				jaf.loading.close();
			});
			jaf.loading.open(null, true);
		}
		page.form.submit();
	};

	/**
	 * 查找
	 * @event search
	 * @param url 对应的报表URL地址
	 */
	this.search = function(url){
		var eventObj = window.event.srcElement;
		eventObj.window = window;
		top.MD.newInstance(ctx + url, "700", "查找", eventObj, function(){
			return function(eventObj, data){
				eventObj.window.OBF.dselection(data);
			};
		});
	};

	/**
	 * 列表
	 * @event list
	 * @param url url 对应的报表URL地址
	 * @param title 显示标题，默认为'列表'
	 */
	this.list = function(url, title){
		//top.MD.newInstance(ctx + url, "90%", "列表", window.event.srcElement);
		var _title = "列表";
		if(typeof(title) === "string" && title.trim().length > 0) {
			_title = title.trim();
		}
		top.ME.open({id:url, rel:(ctx + url), innerText:_title});
	};

	/**
	 * 初始化
	 * @method init
	 * @param __page 页面的 Object 对象 {form:HTMLElement, method:"add|editor...."}
	 * @param params 按钮的参数集，是一个JSON格式的参数集合，如：[{name:"新增", icon:"add.gif", target:"_blank", url:"**", syncpermission:false, remark:""},{...}]
	 */
	this.init = function(__page, params){
		if(typeof(__page.form) == "string"){
			__page.form = document.getElementById(__page.form);
		}
		page = __page;


		var groups = [];
		try{
			groups = params.params;
		}catch(e){}
		for(var i=0;i<groups.length;i++) {
            var group = new Group();
            for (var j = 0; j < groups[i].length; j++) {
                var __param = groups[i][j];
                group.add(new Link(__param));
            }

            if (!group.empty() && panel == null) {
                document.write("<ul id=\"operate-btns-bar\"></ul>");
                panel = $("#operate-btns-bar");
            }

            if (!group.empty() && panel != null) {
                panel.append(group.obj);
            }
		}

        if(panel != null) {
            panel.append($("<li id='operate-pop-messages'></li>"));
        }
		
		SMS.execute(__page.method);
	};

	this.dselection = function(data){
		var openEvent = btns["open"];
		if(openEvent == null || openEvent.param == null) return;
		var url = openEvent.param.url;
		var id = data.id;
		if(id == null) return;
		url = url.replace("{id}", id);
		document.location.assign(ctx + url);
	};

	/**
	 * 工具条的消息提示
	 * @method alert
	 * @param type 消息类型 success|warning|error
	 * @param msg 消息内容
	 */
	this.alert = function(type, msg){
		var msgPanel = panel.getElementsByTagName("li")["operate-pop-messages"];
		msgPanel.innerHTML = "";
		var msgPanelBody = document.createElement("em");
		msgPanel.style.display = "block";
		msgPanelBody.style.display = "block";
		msgPanelBody.className = type;
		msgPanelBody.innerHTML = "<span>" + msg + "</span>";
		msgPanel.appendChild(msgPanelBody);
		try{jaf.dialog.close();}catch(e){}
		window.setTimeout(function(){msgPanel.style.display = "none";}, 3000);
	};

	/**
	 * 获取当前页的事件对象
	 * @method getPage
	 * @returns {form:HTMLElement, method:"当前操作事件（add|editor....）",id:当前单据的编号}
	 */
	this.getPage = function(){
		return page;
	};
	
	function Link(paramObj){
		this.param = paramObj;
		var buttonHTML = "<button type='button' title='" + paramObj.remark + "'>";

		if(paramObj.icon != null && paramObj.icon != ""){
			buttonHTML += "<i style=\"background-image: url(" + ctp + "/images/operate-btns/" + paramObj.icon + ");\"></i>";
		}

        buttonHTML += paramObj.name + "</button>";
		var __button = $(buttonHTML);

        if(paramObj.disabled){
            __button.attr("disabled","disabled");
        }

		var target = paramObj.target == null ? "" : paramObj.target;
		if(target.indexOf("_win") != -1){
			var size = target.split(":")[1];
			__button.click(function(){
				if(!fireInvokeListener(paramObj.id)) return;
				jaf.dialog.open(ctx + paramObj.url, size, paramObj.name);
			});
		}else if(target.indexOf("_js") != -1){
			var __url = paramObj.url.replace("%{ctx}", ctx);
			__button.click(function(){
				if(!fireInvokeListener(paramObj.id)) return;
				try{
					eval(__url);
				}catch(e){
					jaf.alert(e.message);
				}
				__button.attr("disabled","disabled");
				setTimeout(function(){
					__button.removeAttr("disabled");
				},1000);
			});
		}else{
			if(paramObj.url != null){
				__button.click(function(){
                    if(this.className == "curr") return;
                    if(paramObj.url == null || paramObj.url == "") return;
					if(!fireInvokeListener(paramObj.id)) return;
					var frame = document.getElementById(target);
					var __url = ctx + paramObj.url;
					if(frame == null){
						window.location.assign(__url);
					}else{
						frame.src = __url;
					}
				});
			}
		}

        var children = getLinkChildren(paramObj.childs);
        if(children != null){
            __button.append(children);
        }

		this.obj = __button;
	}

    function getLinkChildren(childrenArrayObject){
        if(childrenArrayObject == null || childrenArrayObject.length == 0) return null;
        var ul = document.createElement("ul");
        for(var i=0;i<childrenArrayObject.length;i++){
            var children = childrenArrayObject[i];
            var li = document.createElement("li");

			if(children.disabled) {
				var span = document.createElement("span");
				span.innerText = children.name;
				li.appendChild(span);
				li.className += " disabled";
			} else {
				var __target = children.target == null ? "" : children.target;
				var href = document.createElement("a");
				href.id = children.id;
				href.href = "javascript:;";
				var url = children.url;
				if(url != null && url != "") {
					url = children.url.replace("%{ctx}", ctx);
					if (__target.indexOf("_js") != -1) {
						href.rel = url;
						href.onclick = function () {
							if (!fireInvokeListener(this.id)) return;
							try {
								eval(this.rel);
							} catch (e) {
								jaf.alert(e);
							}
						};
					} else if (__target.indexOf("_frame") != -1) {
						href.rel = ctx + url;
						href.onclick = function () {
							if (!fireInvokeListener(this.id)) return;
							top.ME.open(this, this.innerText);
						};
					} else {
						href.href = ctx + url;
					}
				}
				href.innerHTML = children.name;
				li.appendChild(href);
			}

            children = getLinkChildren(children.childs);
            if(children != null){
                li.className = "has-child";
                li.appendChild(children);
                li.onmouseover = function(){
                   var __ul = this.getElementsByTagName("ul")[0];
                    __ul.style.top = "0px";
                    __ul.style.left = this.offsetWidth + "px";
                    __ul.style.display = "block";
                };
                li.onmouseout = function(){
                    var __ul = this.getElementsByTagName("ul")[0];
                    __ul.style.display = "none";
                };
            }
            ul.appendChild(li);
        }
        return ul;
    }
	
	function Group(){
		var obj = $("<li></li>")
		var empty = true;
		this.add = function(link){
			if(link.param.id != "open"){
				obj.append(link.obj);
				empty = false;
			}
			btns[link.param.id] = link;
		};
		this.empty = function(){return empty};
		this.obj = obj;
	}
};