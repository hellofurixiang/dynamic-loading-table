function TableListControl(tableListId){
	String.prototype.trim = function(){
		return this.replace(/^\s+|\s+$/g, '');
	};
	var table = document.getElementById(tableListId);
	var html = "<div id=\"list-menu\" class='links'></div>";
	document.write(html);
	var panel = document.getElementById("list-menu");

	var rightMouseEvent = true;
	var lastCheckRow = null;
	var selectionCallback = null;

	function getLinksHtml(activeEle){
		try{
			var cells = activeEle.cells;
			var linksCell = cells[cells.length - 1];
			if(linksCell.className != "o-links") return "";
			return linksCell.innerHTML;
		}catch(e){
			return "";
		}
	}
	
	//显示方法
	function display(activeEle){
		var position = jaf.position(table);
		var tableY = position.y + table.offsetHeight;

		var btnHtml = getLinksHtml(activeEle);
		if(btnHtml.trim() == "") {hidden();return;}
		panel.innerHTML = btnHtml;
		panel.style.display = "block";
		
		var _x = window.event.x;
		var _y = jaf.position(activeEle).y;

		var o_w = panel.offsetWidth;

		var over_body_right = _x + o_w / 2 - document.body.clientWidth;
		var over_body_left = _x - o_w / 2;

		if(over_body_right > 0){
			panel.style.left = _x - o_w / 2 - over_body_right - 5 + "px";
		}else if(over_body_left < 0){
			panel.style.left = 0 + "px";
		}else{
			//panel.style.left = _x - o_w / 2 + "px";
			panel.style.left = _x + 5 + "px";
		}

		var panelY = _y + activeEle.offsetHeight;
		if(panelY + panel.offsetHeight > tableY){
			panelY = _y - panel.offsetHeight;
			panel.className = "top";
		}else{
			panel.className = "";
		}

		panelY = panelY < 0 ? 0 : panelY;
		
		panel.style.top = panelY + "px";
	}
	
	//隐藏方法
	function hidden(){
		panel.style.display = "none";
	}
	
	//列表表格加入点击事件
	function tableListEvent(){
		var e = window.event;

		var activeEle = e.srcElement;
		if(activeEle.tagName.toUpperCase() != "TD") return;
		if(activeEle.className == "no-data") return;
		activeEle = activeEle.parentNode;

		try{
			lastCheckRow.className = lastCheckRow.className.replace("selected", "");
		}catch(e){}
		activeEle.className += " selected";
		lastCheckRow = activeEle;
        //0为左键，2为右键，此处改为右键 by huangxs
		if(selectionCallback != null && e.button.toString() != "2"){
			selectionCallback(activeEle);
		}

		if(e.button.toString() != "2"){
			hidden();
			if (e.button.toString() == "0" && activeEle.tagName.toUpperCase() == "TR") {
				var btnHtml = getLinksHtml(activeEle);
				$("#list-menu").html(btnHtml);
				//位置:用户第一，权限第二
				if ($("fieldset").attr("name") == 'user') {
					$("#list-menu a")[0].click();
				}
				else if ($("fieldset").attr("name") == 'functional') {
					$("#list-menu a")[1].click();
				}
			}
			return;
		}
		/*if(rightMouseEvent){
			if(e.button.toString() != "2"){
				hidden();
				return;
			}
		}*/

		if(activeEle.tagName.toUpperCase() == "TR"){
			display(activeEle);
		}
	}
	
	//网页内容点击事件
	function bodyEvent(){
		var activeEle = window.event.srcElement;
		try{
			if(activeEle.parentNode.parentNode.tagName.toUpperCase() == "TBODY"){
				return;
			}
		}catch(e){
			hidden();
		}
		hidden();
	}

	//为列表表格加入点击事件
	if (window.addEventListener){
		if(table == null) return;
		table.addEventListener("mouseup",tableListEvent,false);
		document.addEventListener("click",bodyEvent,false);
	}else{
		if(table == null) return;
		table.attachEvent("mouseup",tableListEvent);
		document.attachEvent("onclick",bodyEvent);
	}

	table.oncontextmenu = function(){
		return false;
	};

	this.addSelectionListener = function(call){
		selectionCallback = call;
	};
}

function DataImport(){
	var statusAjaxUrl = ctx + "/import.jhtml";
	this.loading = function(form, ajaxUrl){
		if(ajaxUrl != undefined && ajaxUrl != null){
			statusAjaxUrl = ajaxUrl;
		}
		lightbox.loading();
		lightbox.display(500);
		/*
		$.ajax({
			type : "post",
			url : statusAjaxUrl,
			data : "referer:" + Math.random(),
			async : false,
			success : function(data) {
				data = eval("(" + data + ")");
				if(data.processing == "processing"){
					arrowSubmit = false;
				}
			}
		});
		*/
		$.post(statusAjaxUrl, "{referer:" + Math.random() + "}",
				function (data, textStatus){
					submitForm(data);
				}, "json");
		
		function submitForm(data){
			if(data.processing == "processing"){
				lightbox.simple();
				lightbox.setBodyContent("该列表的数据导入正在进行中，您必须在完成导入后才可以进行第二次操作。");
				lightbox.display(500);
			}else{
				form.submit();
			}
		}
	};
	
	var interval = null;
	this.process = function(){
		lightbox.simple();
		lightbox.setBodyContent("<div id=\"__import_process_status_\"><div id=\"process\"><div>正在准备，请稍候。。。。。</div><img src=\"" + ctx + "/images/loading-bar.gif\" /></div><div id=\"msg\"></div></div>");
		lightbox.display(500);
		var statusBody = document.getElementById("__import_process_status_").getElementsByTagName("div");
		var processorBody = statusBody["process"];
		var msgBody = statusBody["msg"];
		interval = window.setInterval(function(){
			$.post(statusAjaxUrl, "{referer:" + Math.random() + "}",
				function (data, textStatus){
					clearInterval(data, processorBody, msgBody);
				}, "json");
		}, 500);
	};
	
	function clearInterval(data, processorBody, msgBody){
		if(data.processing == "init") return;
		
		var count = data.count;
		var curr = data.curr;
		var err = data.err;
		var percentage = count == 0 ? "0%" : parseInt((curr) / count * 100) + "%";
		var statusFlag = data.curr + "/" + data.count;
		processorBody.innerHTML = "<span>" + percentage + "<em><font color=\"red\">" + err + "</font>/" + statusFlag + "</em></span>";
		
		if(data.msgs != ""){
			msgBody.style.display = "block";
			msgBody.innerHTML += data.msgs;
		}
		
		if(data.processing == "done"){
			window.clearInterval(interval);
			if(msgBody.innerHTML != "") return;
			
			msgBody.style.display = "block";
			msgBody.innerHTML = "数据导入成功，现在请关闭该窗口查看您刚才导入的数据。";
			lightbox.setButtons(new Array( {
				"name" :"确定",
				'action' :"ref"
			}));
		}
	}
}
var dataImport = new DataImport();

var TableListBathOperate = {
	submit : function(table, url){
		var tableList = document.getElementById(table);
		var checkboxs = tableList.getElementsByTagName("input");
		
		var checkedIds = TableListBathOperate.array(checkboxs);
		if(checkedIds == null || checkedIds.length <= 0){
			TableListBathOperate.msg("请在选择相关数据项后再进行该操作！", null);
			return;
		}
		var urlParamStrFlag = "?";
		if(url.indexOf("?") != -1) urlParamStrFlag = "&";
		url = url + urlParamStrFlag + "referer=" + escape(document.location.href);
		url = url + "&ids=" + checkedIds.join("&ids=");
		TableListBathOperate.msg("你确定要进行此次批量操作？<br/><b>请注意：</b>一旦你完成了该次批量操作，你所更改的这些记录将可能无法找回！", url);
	},
	submitWin:function(table,url,width,title){
		var tableList = document.getElementById(table);
		var checkboxs = tableList.getElementsByTagName("input");
		var checkedIds = TableListBathOperate.array(checkboxs);
		if(checkedIds == null || checkedIds.length <= 0){
			TableListBathOperate.msg("请在选择相关数据项后再进行该操作！", null);
			return;
		}
		
		var urlParamStrFlag = "?";
		if(url.indexOf("?") != -1) urlParamStrFlag = "&";
		url = url + urlParamStrFlag + "referer=" + document.location.href;
		url = url + "&ids=" + checkedIds.join("&ids=");
		lbdis(url,width,title);
	},
	array : function(checkboxs){
		var checkedIdsArg = new Array();
		for(var i=0;i<checkboxs.length;i++){
			if(checkboxs[i].type != "checkbox") continue;
			if(checkboxs[i].id == "select.all.btn") continue;
			if(checkboxs[i].id.indexOf("TableListControlCheckBox") == -1) continue;
			if(checkboxs[i].checked){
				checkedIdsArg.push(checkboxs[i].value);
			}
		}
		return checkedIdsArg;
	},
	msg : function(msg, url){
		var win = window;
		var __lightbox = top.lightbox;
		__lightbox.simple(400);
		__lightbox.setBodyContent(msg);
		if(url == undefined || url == null){
			__lightbox.setButtons(new Array( {
				"name" :"确定",
				'action' : "none"
			}));
		}else{
			__lightbox.setButtons(new Array( {
				"name" :"确定",
				"action" :encodeURI(url),
				"window" : win
			}, {
				"name" :"取消",
				'action' :'none'
			}));
		}
		__lightbox.display();
	}
};

/**
 * AJAX SELECT 回调函数有三个参数 targetObj, paramObj, data
 * @param paramsObj {id:ulId, ajax:{ctx:applicationContext, url:the ajax url, callback:after get date call function}}
 */
var ULSelect = new function(){
	this.init = function(){
		var objects = $(".ul-selector");
		if(objects== null || objects == "") return;
		for(var i=0;i<objects.length;i++){
			if(objects[i].ajax == null || objects[i].ajax == ""){
				StaticSelect(objects[i]);
			}else{
				AjaxSelect(objects[i], {});
			}
		}
	};

	function AjaxSelect(obj, paramObj){
		var label = obj.getElementsByTagName("label")[0];
		label.id = obj.id + "_label";
		var labelId = label.id;
		label.onclick = function(){
			var __ulObj = this.parentNode.getElementsByTagName("ul")[0];
			__ulObj.className = "expend";
			__ulObj.style.width = this.parentNode.offsetWidth - 2 + "px";
			with(this.parentNode.style){
				border = "1px solid #ccc";
			}
			__ulObj.innerHTML = "<li style=\"text-align:center\"><img src=\"" + paramObj.ajax.ctx + "/images/loading.gif\" /></li>";
			$.post(paramObj.ajax.url, {}, function(data, textStatus){printDataList(__ulObj,data);}, "json");
		};

		function printDataList(targetObj,data){
			targetObj.innerHTML = "";
			paramObj.ajax.callback(targetObj, paramObj, data);
		}

		function ajaxSelectEvent(){
			var activeEle = window.event.srcElement;
			if(activeEle.id == obj.id || labelId == activeEle.id) return;
			var __ulObj = obj.getElementsByTagName("ul")[0];
			__ulObj.className = "";
			with(obj.style){
				border = "1px solid #FFF";
			}
		}

		//为document点击事件
		if (window.addEventListener){
			document.addEventListener("click",ajaxSelectEvent,false);
		}else{
			document.attachEvent("onclick",ajaxSelectEvent);
		}
	}

	function StaticSelect(obj){
		obj.onmouseover = function(){
			var __ulObj = this.getElementsByTagName("ul")[0];
			//__ulObj.className = "expend";
			__ulObj.style.width = this.offsetWidth + "px";
			/*
			 with(this.style){
			 border = "1px solid #ccc";
			 }
			 */
			this.className += " expend";
		};
		obj.onmouseout = function(){
			//var __ulObj = this.getElementsByTagName("ul")[0];
			//__ulObj.className = "";
			/*
			 with(this.style){
			 border = "1px solid #FFF";
			 }
			 */
			this.className = this.className.replace(" expend", "");
		};
	}
};

jaf.addOnLoadListener(function(){ULSelect.init();});