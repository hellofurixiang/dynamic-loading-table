/**
 * 菜单
 * @module ME
 * @class MenuEvent
 * @type MenuEvent
 */
function MenuEvent(){
	var menu = document.getElementById("menu");
	if(menu == null) return;
	var menuItems = menu.getElementsByTagName("li");
	if(menuItems == null || menuItems.length <= 0) return;

	/**
	 * 返回所有菜单的 A 标签数组
	 * @method items
	 * @returns {NodeList}
	 */
	this.items = function(){
		return menu.getElementsByTagName("a");
	};

	/**
	 * 选择第一个标签页
	 * @method index
	 */
	this.index = function(eventObj){
		FSC.SCZ();
	};

	/**
	 * 返回第一个菜单的 A 标签 HtmlElement 对象
	 * @method first
	 * @returns {*}
	 */
	this.first = function(){
		return menu.getElementsByTagName("a")[0];
	};

	/**
	 * 打开菜单
	 * @method open
	 * @param menuObj 菜单对象：可以是一个HTMLElement的A标签对象，A标签中的 rel 属性表示了该菜单的URL地址
	 * @param title 菜单的标题
	 * @param __url 菜单的地址
	 */
	this.open = function(menuObj, title, __url){
		window.scrollTo(0,0);
		var name = title;
		if(title == undefined || title == null || title == "") {
			name = getMenuName(menuObj);
		}
		var url = __url == null ? menuObj.rel : __url;
		var id = (menuObj == null || menuObj.id == null || menuObj.id == "") ? url : menuObj.id;
		var from = null;
		try{
			from = FSC.getFrame().id;
		}catch(e){
		}
		FSC.create(id, name.trim(), url, from);
	};

	function getMenuName(menuObj){
		var target = null;
		try{
			target = menuObj.getElementsByTagName("span")[0];
		}catch(e){}
		if(target == null) target = menuObj;
		return target.innerText;
	}
	this.name = getMenuName;
}
var ME = null;

/**
 * 帧页面控制
 */
function FrameSwitchControl(){
	var COOKIE_NAME = "__FRAME__SWITCH_NAV_BARS__";
	var cookies = jaf.cookie.read(COOKIE_NAME);
	var lastSelection = null;
	var SC = null;
	var barPanel = null;
	var btnIdFlag = "frame_btn_";
	var framesPanel = null;
	var frames = {};
	var ic = new ItemCreator();
	var popMenu = new BarMenu();
	var INDEX_BTN_ID = "frame_btn_index";

	init();

	window.onresize = function(){
		selection(lastSelection, null, false);
	};

	function init(){
		barPanel = document.getElementById("frame-switch-bar").getElementsByTagName("div")[0].getElementsByTagName("ul")[0];
		framesPanel = document.getElementById("frames-panel").getElementsByTagName("dl")[0];
		popMenu.init();
		var indexBtn = barPanel.getElementsByTagName("li")[0];
		indexBtn.onclick = function(){
			selection(frames["index"],null, false);
			remember();
		};
		frames = {"index":{id: INDEX_BTN_ID, btn:indexBtn, panel:{frame:null, element:framesPanel.getElementsByTagName("dd")[0]}}};
		lastSelection = frames["index"];
		var params = cookies.split(":");
		var menuIds = params[0].split(",");
		for(var i=menuIds.length-1;i>=0;i--){
			var menuId = menuIds[i];
			var menuItems = ME.items();
			var menuObj = menuItems[menuId];
			if(menuObj == null) continue;
			ic.create(menuObj.id, ME.name(menuObj), menuObj.rel, false, (ME.first().id != menuId));
		}

		var frameObj = null;
		try{
			if(frames[params[1]] == null) {
				frameObj = frames["index"];
			}else{
				frameObj = frames[params[1]];
			}
		}catch(e){
			frameObj = frames["index"];
		}

		selection(frameObj, null, false);
		SC = new SlidingController();
		SC.getBarMarginLeft();
	}

	this.SCZ = function(){
		//barPanel.style.marginLeft = "0px";
		selection(frames["index"], null, false);
	};

	function BarMenu(){
		var menuUL = null;
		var menus = {};
		var closeBtn = null;

		this.init = function() {
			var capacity = document.getElementById("frame-switch-bar").getElementsByTagName("em")[0];
			menuUL = document.createElement("ul");
			menuUL.className = "pop-menu";
			capacity.appendChild(menuUL);
			closeBtn = doCreateCloseItem();
		};

		function doCreateCloseItem(){
			var li = document.createElement("li");
			li.className = "close-all";
			li.onclick = function () {
				for(var id in menus){
					var frameObj = frames[id.replace("frame_btn_", "")];
					if(frameObj == null) continue;
					remove(frameObj);
				}
				selection(frames["index"], null, false);
				remember();
				menuUL.innerHTML = "";
				menus = {};
				closeBtn = doCreateCloseItem();
			};
			li.innerText = "全部关闭";
			menuUL.appendChild(li);
			return li;
		}

		this.add = function(source){
			var sourceId = source.id.replace("frame_btn_", "");
			if(menus[sourceId] != null) return;
			var li = document.createElement("li");
			li.onclick = function () {
				var id = this.id.replace("frame_btn_", "");
				selection(frames[id], null, false);
				remember();
			};
			li.title = source.title;
			li.innerHTML = source.getElementsByTagName("b")[0].innerText;
			li.id = source.id;
			menuUL.appendChild(li);
			menus[sourceId] = li;
		};

		this.remove = function(id){
			id = id.replace("frame_btn_", "");
			var target = menus[id];
			try {
				menuUL.removeChild(target);
			}catch(e){}
		};

		this.setTitle = function(id, title, remark){
			id = id.replace("frame_btn_", "");
			var target = menus[id];
			if(target == null) return;
			target.innerText = title;
			target.title = remark || title;
		};
	}

	function SlidingController(){
		var inter = null;
		var slidingBtns = barPanel.parentNode.parentNode.getElementsByTagName("em")[0].getElementsByTagName("a");
		if(slidingBtns.length == 2){
			slidingBtns[0].onmousedown = function(){
				start(-10);
			};
			slidingBtns[0].onmouseup = function(){
				end();
			};

			slidingBtns[1].onmousedown = function(){
				start(10);
			};
			slidingBtns[1].onmouseup = function(){
				end();
			};
		}

		this.getBarMarginLeft = getButtonsBarMarginLeft;
		function getButtonsBarMarginLeft(){
			var marginLeft = barPanel.style.marginLeft.replace("px", "");
			if(marginLeft == ""){
				marginLeft = 0;
			}else{
				marginLeft = parseInt(marginLeft);
			}
			return marginLeft;
		}

		this.sliding = start;
		function start(count){
			inter = window.setInterval(function(){
				var marginLeft = getButtonsBarMarginLeft();
				var distance = marginLeft + count;
				if(count > 0){
					if(distance > 0){
						end();
						return;
					}
				}else{
					var barItemsWidth = barPanel.getElementsByTagName("li").length * 86 + 150;
					var barPanelWidth = barPanel.parentNode.offsetWidth + 100;
					if(barItemsWidth + distance < barPanelWidth){
						end();
						return;
					}
				}
				barPanel.style.marginLeft = distance + "px";
			}, 10);
		}

		function end(){
			window.clearInterval(inter);
			inter = null;
		}
	}

	function remove(frameObj){
		barPanel.removeChild(frameObj.btn);
		framesPanel.removeChild(frameObj.panel.element);
		delete frames[frameObj.id];
		popMenu.remove(frameObj.id);
	}

	function autoVisible(frameObj){
		var btns = barPanel.getElementsByTagName("li");
		var barWidth = barPanel.offsetWidth;
		var targetLeft = 0;
		var targetLeftFinded = false;
		for(var i=0;i<btns.length;i++){
			btns[i].style.display = "block";
			if(!targetLeftFinded) {
				targetLeft += btns[i].offsetWidth + 2;
			}
			var id = btns[i].id.replace("frame_btn_","");
			if(id == frameObj.id){
				targetLeftFinded = true;
			}
		}
		var w1 = targetLeft;
		if(barWidth >= w1) return;
		var w2 = w1 - barWidth;
		var w3 = 0;
		for(var i=1;i<btns.length;i++){
			var li = btns[i];
			var id = li.id.replace("frame_btn_","");
			var obj = frames[id];
			w3 += obj.btn.offsetWidth + 2;
			if((w3 - 150) <= w2){
				li.style.display = "none";
			}
			if(frames[id].id == frameObj.id){
				break;
			}
		}
	}

	function remember(){
		if(frames == null || frames.length <= 0){
			jaf.cookie.write(COOKIE_NAME, "", -1);
			return;
		}
		var arg = [];
		var selectionVal = null;
		var liElements = barPanel.getElementsByTagName("li");
		for(var i=0;i<liElements.length;i++){
			if(liElements[i].id == INDEX_BTN_ID) continue;
			var id = liElements[i].id.replace(btnIdFlag, "");
			if(liElements[i].className == "selected"){
				selectionVal = id;
			}
			arg.push(id);
		}
		var cookieVal = arg.join(",");
		if(selectionVal != null && selectionVal != ""){
			cookieVal += ":" + selectionVal;
		}
		jaf.cookie.write(COOKIE_NAME, cookieVal);
	}

	function selection(frameObj, refresh, noAutoVisible){
		if(frameObj == null){
			var btns = barPanel.getElementsByTagName("li");
			if(btns != null && btns.length > 0){
				var id = btns[0].id;
				id = id.replace(btnIdFlag, "");
				frameObj = frames[id];
			}
		}
		if(frameObj == null) return;

		try{
			lastSelection.btn.className = "";
			lastSelection.panel.element.style.display = "none";
		}catch(e){
		}
		frameObj.btn.className = "selected";
		frameObj.panel.element.style.display = "block";
		if(frameObj.panel.frame != null && frameObj.panel.frame.src == ""){
			jaf.loading.open();
			frameObj.panel.frame.src = frameObj.panel.frame.className;
		}else if(refresh != null && refresh){
			frameObj.panel.frame.contentWindow.location.reload();
		}
		if(frameObj.id == INDEX_BTN_ID){
			jaf.loading.close();
		}
		lastSelection = frameObj;

		if(noAutoVisible != null && !noAutoVisible) autoVisible(frameObj);
	}

	function ItemCreator(){
		var index = 0;
		var menuId = null;
		var menuName = null;
		var menuUrl = null;
		var openUrl = false;
		var closeable = true;

		this.create = function(__menuId, __menuName, __menuUrl, __openUrl, __closeable){
			menuId = __menuId;
			menuName = __menuName;
			menuUrl = __menuUrl;
			openUrl = __openUrl;
			closeable = __closeable == null ? true : __closeable;
			if(frames.length >= 10){
				var btns = barPanel.getElementsByTagName("li");
				var id = btns[btns.length - 1].id;
				id = id.replace(btnIdFlag, "");
				remove(frames[id]);
			}

			var __obj__ = frames[menuId];
			if(__obj__ == null){
				var btn = createBtn();
				var frame = createFrame();
				__obj__ = {id: menuId, btn:btn, panel:frame};
				frames[menuId] = __obj__;
			}
			popMenu.add(__obj__.btn);
			return __obj__;
		};

		function createBtn(){
			var btns = barPanel.getElementsByTagName("li");
			index ++;
			var btnLi = document.createElement("li");
			btnLi.id = btnIdFlag + menuId;
			btnLi.style.zIndex = index;
			btnLi.title = menuName;
			btnLi.onclick = function(){
				var srcElementName = window.event.srcElement.tagName;
				if(srcElementName == "A") return;
				var id = this.id.replace("frame_btn_","");
				selection(frames[id]);
				remember();
			};

			if(closeable){
				var href = document.createElement("a");
				href.href = "javascript:;";
				href.title = "关闭";
				href.onclick = function(){
					var id = this.parentNode.id.replace("frame_btn_","");
					var selectFrame = null;
					try{
						var frameId = frames[id].from.replace("frame_","");
						selectFrame = frames[frameId];
					}catch(e){
					}
					remove(frames[id]);
					selection(selectFrame, null, false);
					remember();
				};
				btnLi.appendChild(href);
			}

			var text = document.createElement("b");
			text.innerText = menuName;
			btnLi.appendChild(text);

			try{
				barPanel.insertBefore(btnLi, btns[1]);
			}catch(e){
				barPanel.appendChild(btnLi);
			}
			return btnLi;
		}

		function createFrame(){
			var frameId = "frame_" + menuId;
			var __target = frames[frameId];
			if(__target != null){
				hidden();
				show(__target.panel);
				return __target;
			}

			jaf.loading.open();
			var dd = document.createElement("dd");
			framesPanel.appendChild(dd);

			var __frame = document.createElement("iframe");
			__frame.id = frameId;
			__frame.name = frameId;
			__frame.width = "100%";
			__frame.frameBorder = 0;
			__frame.border = 0;
			__frame.scrolling = "no";
			__frame.className = menuUrl;
			//__frame.setAttribute("frameBorder", 0); // 用我没有border
			//获取目标页面对象，事件监听判断是否加载完成
			if(__frame.attachEvent){
				__frame.attachEvent("onload", function(){
					show(__frame);
				});
			}else{
				__frame.onload = function(){
					show(this);
				};
			}
			if(openUrl){
				__frame.src = menuUrl;
			}
			dd.appendChild(__frame);
			var obj = {frame:__frame, element:dd};
			return obj;

			function hidden(){
				/*if(lastSelection== null) return;
				lastSelection.panel.element.style.display = "none";*/
				$("#frame-switch-bar div li").not("#"+INDEX_BTN_ID).each(function(){
					document.getElementById("frame_"+this.id.replace("frame_btn_","")).parentNode.style.display = "none";
				});
			}

			function show(__iframe){
				hidden();
				if(__iframe.src == "") return;
				var frame_btn = document.getElementById("frame_btn_"+__iframe.id.replace("frame_",""));
				if(!$(frame_btn).hasClass("selected")){
					frame_btn = null;
					var mId = $("#frame-switch-bar div li[class='selected']")[0].id.replace("frame_btn_","");
					__iframe = 	document.getElementById("frame_"+mId);
				}
				__iframe.parentNode.style.display = "block";
				FrameResize(__iframe);
				jaf.loading.close();
			}
		}
	}

	function FrameResize(__iframe){
		if(__iframe == null){
			try{
				__iframe = lastSelection.panel.frame;
			}catch(e){}
		}
		if(__iframe == null) return;
		try{
			var clientHeight  = document.documentElement.clientHeight;
			var iframeDoc = __iframe.contentWindow.document || __iframe.document;
			//var iframeDocClientHeight = iframeDoc.body.offsetHeight;
			//<html xmlns="http://www.w3.org/1999/xhtml">新标准：document.documentElement替代document.body，不替代有bug
			var iframeDocClientHeight = iframeDoc.documentElement.offsetHeight;
			if(iframeDocClientHeight < clientHeight - 200){
				iframeDocClientHeight = clientHeight - 200;
			}
			__iframe.style.height = iframeDocClientHeight + 10 + "px";
		}catch(e){
			jaf.alert(e);
		}
	}
	this.resize = FrameResize;

	this.create = function(__menuId, __menuName, __menuUrl, __from){
		var obj = ic.create(__menuId, __menuName, __menuUrl, true);
		obj.from = __from;
		selection(frames[__menuId], null, false);
		remember();
	};

	/**
	 * 关闭一个帧页面
	 * @param refreshFromSource 引用的帧页面。如果帧页面A是从帧页面B中通过 ME.open 打开，那么 A引用的帧页面就是B
     */
	this.close = function(refreshFromSource){
		if(lastSelection == null) return;
		var selectFrame = null;
		try{
			var frameId = lastSelection.from.replace("frame_","");
			selectFrame = frames[frameId];
		}catch(e){
		}
		var refresh = refreshFromSource && selectFrame != null;
		remove(lastSelection);
		selection(selectFrame, refresh, false);
		remember();
	};

	/**
	 * 获取一个帧页面
	 * @returns 帧页面的 iframe HtmlElement对象
     */
	this.getFrame = function(){
		return lastSelection.panel.frame;
	};

	/**
	 * 重新设置某一个帧页面显示的标题及备注
	 * @param id 帧页面的编号
	 * @param text 标题
	 * @param remark 备注
     */
	this.setText = function(id, text, remark){
		var item = null;
		try {
			if(id == null){
				item = lastSelection.btn;
			}else {
				item = frames[id.split("frame_")[1]].btn;
			}
		} catch (e) {
		}

		item.title = remark || text;
		item.getElementsByTagName("b")[0].innerText = text;

		id = item.id.replace("frame_btn_","");
		popMenu.setTitle(id, text, remark);
	}
}
var FSC = null;

function MessageRefresh(){
	function startRefresh(){
		$.post(
			ctx + "/user/message!unreads.jhtml",
			{},
			function(data, textStatus){
				panel.innerHTML = "(" + data.count + ")";
			},
			"json");
	}

	var panel = document.getElementById("msg_refresh");
	if(panel == null) return;

	var time = 1000 * 60 * 5;//5分钟
	window.setInterval(startRefresh, time);

	startRefresh();
}

jaf.addOnLoadListener(function(){
	ME = new MenuEvent();
	FSC = new FrameSwitchControl();
	try{
		new MessageRefresh();
	}catch(e){}
});