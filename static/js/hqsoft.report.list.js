function isEmptyObject(source){
	for (var prop in source){
		return false
	}
	return true;
}
var L = new function (){
	var SELECTED_ITEMS_COOKIE_NAME = "REPORT_SELECTED_ITEMS_COOKIE_NAME";
	var dataListTable = null;
	var tableMenu = null;
	var cookieHandler = new CookieHandler();
	var dataSelectedListHandler = null;
	var selectedRelationObj = null;
	var rightMouseEvent = true;
	var lastCheckRow = null;
	var allowLock = false;
	var selectionColumnIndex = 1; // 数据列表中第0列为序号列，若有selection-column，则selection-column为第1列

	this.init = function(__selectedRelationObj, columnStyles){
		selectedRelationObj = __selectedRelationObj;
		dataListTable = document.getElementById("report-list");
		$(dataListTable).find("tbody td input[type=text]").click(function(){
			this.select();
		});

		$(dataListTable).find("tbody td input.Number").keyup(function(){
			var tmptxt = $(this).val();
			$(this).val(tmptxt.replace(/\D|^0/g,''));
		}).bind("paste",function(){
			var tmptxt=$(this).val();
			$(this).val(tmptxt.replace(/\D|^0/g,''));
		}).css("ime-mode", "disabled");

		$(dataListTable).find("tbody td input.Date").click(function(){
			jaf.editor.date(this, "yyyy-mm-dd");
		});

		$(dataListTable).find("tbody td input.Timer").click(function(){
			jaf.editor.date(this, "yyyy-mm-dd");
		});

		$(window).load(function() {
			allowLock = document.body.clientWidth + 100 < dataListTable.offsetWidth;
			initColumnStyle(columnStyles);
			dataListTable.style.visibility = "visible";
		});

		$(window).resize(function() {
			allowLock = document.body.clientWidth + 100 < dataListTable.offsetWidth;
			initColumnStyle(columnStyles);
			dataListTable.style.visibility = "visible";
		});

		if(dataListTable == null) return;

		try {
			var fields = [];
			$(dataListTable).find("thead th").each(function () {
				var name = this.innerHTML;
				if(name == "") return;
				try {
					name = this.children[0].childNodes[0].nodeValue;
				}catch(e){
					try {
						name = this.childNodes[0].nodeValue;
					}catch(e){
						return;
					}
				}
				if(name == null || name == "") return;
				var obj = {id: this.id, name: name};
				fields.push(obj);
			});
			Q.initFields(fields);
		}catch(e){}

		new ColumnResize();

		//为列表表格加入点击事件
		if (window.addEventListener){
			dataListTable.addEventListener("mouseup",tableListClickEvent,false);
			dataListTable.addEventListener("dblclick",tableListDoubleClickEvent,false);
			//dataListTable.addEventListener("click",tableListClickEvent,false);
			document.addEventListener("click",documentBodyClickEvent,false);
		}else{
			dataListTable.attachEvent("mouseup",tableListClickEvent);
			dataListTable.attachEvent("ondblclick",tableListDoubleClickEvent);
			//dataListTable.attachEvent("onclick",tableListClickEvent);
			document.attachEvent("onclick",documentBodyClickEvent);
		}
		tableMenu = new MenuCreator();
		dataSelectedListHandler = new DataSelectedListHandler();

		dataListTable.oncontextmenu = function(){
			return false;
		};

		try {
			var instance = top.MD.getInstance();
			instance.addCloseListener(function(){
				cookieHandler.clear();
			});
		}catch(e){
		}
	};

	function isLocked(source){
		try {
			return source.className.indexOf("locked") != -1;
		}catch(e){
			return false;
		}
	}

	function initColumnStyle(columnStyles){
		if(columnStyles == null || columnStyles == undefined) return;
		var selectionColumn = $(dataListTable).find("th.selection-column");
		var snColumn = $(dataListTable).find("th.sn-column");
		if(selectionColumn){
			if(allowLock) {
				L.lockColumn(selectionColumn[0], true);
				L.lockColumn(snColumn[0], true);
				dataListTable.style.marginLeft = "-2px";
			}else{
				L.lockColumn(selectionColumn[0], false);
				L.lockColumn(snColumn[0], false);
				dataListTable.style.marginLeft = "0px";
			}
		}

		for(var key in columnStyles){
			var style = columnStyles[key];
			//L.hiddenColumn(key, style.hidden);
			L.lockColumn(key, style.lock);
			//L.setColumnWidth(key, style.width);
			//L.setColumnAlign(key, style.align);
		}
	}

	function MenuCreator(){
		var panel = document.createElement("div");
		panel.id = "list-menu";
		dataListTable.parentNode.parentNode.parentNode.appendChild(panel);

		function getLinksHtml(activeEle) {
			var html = "";
			try {
				var cells = activeEle.cells;
				var linksCell = cells[cells.length - 1];
				if (linksCell.className == "o-links") {
					html = linksCell.innerHTML;
				}
			} catch (e) {
			}

			var eventElement = window.event.srcElement;
			if(eventElement.tagName == "TH"){
				if(eventElement.id == null || eventElement.id == "") return html;
				//控制最后显示的列不能隐藏
				var tr = eventElement.parentNode;
				var columns = tr.cells;
				var hiddenColumns = 0;
				for(var i = 0; i < columns.length; ++i) {
					if(columns[i].className.indexOf("hidden") != -1) {
						++hiddenColumns;
					}
				}

				// 允许显示列控制时才显示"隐藏该列"菜单项
				if(H.showColumnControl()) {
					if(hiddenColumns + 3 >= columns.length) {
						html += "<span>" + lang["column.hidden"] + "</span>"
					} else {
						html += "<a href=\"javascript:\" onclick=\"L.hiddenColumn('" + eventElement.id + "',true);\">" + lang["column.hidden"] + "</a>";
					}
				}

				if(!allowLock) return html;

				// 允许显示列控制时才显示"锁定该列"菜单项
				if(H.showColumnControl()) {
					if(eventElement.className.indexOf("locked") == -1){
						html += "<a href=\"javascript:\" onclick=\"L.lockColumn('" + eventElement.id + "',true);\">" + lang["column.lock"] + "</a>";
					}else {
						html += "<a href=\"javascript:\" onclick=\"L.lockColumn('" + eventElement.id + "',false);\">" + lang["column.unlock"] + "</a>";
					}
				}
			}
			return html;
		}

		//显示方法
		this.display = function(activeEle){
			var html = getLinksHtml(activeEle);
			if(html == "") return;
			var position = jaf.position(dataListTable);
			var tableY = position.y + dataListTable.offsetHeight;

			panel.innerHTML = html;
			panel.style.display = "block";

			var _x = window.event.x + 3;
			var _y = jaf.position(activeEle).y;

			var o_w = panel.offsetWidth;

			var over_body_right = _x + o_w / 2 - document.body.clientWidth;
			var over_body_left = _x - o_w / 2;

			if(over_body_right > 0){
				panel.style.left = _x - over_body_right - 5 + "px";
			}else if(over_body_left < 0){
				panel.style.left = 0 + "px";
			}else{
				panel.style.left = _x + "px";
			}

			var panelY = _y + activeEle.offsetHeight;
			if(panelY + panel.offsetHeight > tableY){
				panelY = _y - panel.offsetHeight;
				panel.className = "top";
			}else{
				panel.className = "";
			}

			panel.style.top = panelY + "px";
		};

		//隐藏方法
		this.hidden = function(){
			panel.style.display = "none";
		};
	}

	function ColumnResize(){
		var startX = -1;
		var fixed = dataListTable.currentStyle ? dataListTable.currentStyle["table-layout"] : document.defaultView.getComputedStyle(dataListTable,false)["table-layout"];
		if(fixed!="fixed") return;

		var resizeLine = document.createElement("div");
		resizeLine.className = "resize-line";
		document.body.appendChild(resizeLine);

		if (window.addEventListener){
			dataListTable.addEventListener("mousemove",move,false);
			dataListTable.addEventListener("mousedown",down,false);
			dataListTable.addEventListener("mouseup",up,false);
			resizeLine.addEventListener("mouseup",up,false);
		}else{
			dataListTable.attachEvent("onmousemove",move);
			dataListTable.attachEvent("onmousedown",down);
			dataListTable.attachEvent("onmouseup",up);
			resizeLine.addEventListener("mouseup",up,false);
		}

		document.ondragstart = function(){
			event.returnValue=false;
		};

		document.onselectstart = function(){
			event.returnValue=false;
		};

		var eventCell = null;

		function move(){
			var e = window.event || event;
			var td = e.srcElement;
			if(td == null || !(td.tagName == "TD" || td.tagName == "TH")) return;
			if(isLocked(td)) return;
			if (e.offsetX >= td.clientWidth - 10){
				td.style.cursor = 'w-resize';
			}else{
				td.style.cursor = 'default';
			}
			var scrollLeft = dataListTable.parentNode.scrollLeft;
			if(td == eventCell && e.x < td.offsetLeft - scrollLeft + 30) {
				dataListTable.mousedown = false;
			}else if(eventCell != null && e.x > eventCell.offsetLeft - scrollLeft){
				dataListTable.mousedown = true;
			}
			if (dataListTable.mousedown != null && dataListTable.mousedown == true) {
				resizeLine.style.left = e.x + "px";
			}
		}

		function down(){
			var e = window.event || event;
			if(e.button != 0) return;
			var td = e.srcElement;
			if(td == null || !(td.tagName == "TD" || td.tagName == "TH")) return;
			if (e.offsetX <= td.clientWidth - 10) return;
			if(isLocked(td)) return;
			eventCell = td;
			startX = e.offsetX;
			resizeLine.style.display = "block";
			dataListTable.mousedown = true;
			var scrollLeft = dataListTable.parentNode.scrollLeft;
			var marginLeft = dataListTable.parentNode.style.marginLeft;
			marginLeft = marginLeft == null || marginLeft == "" ? 0 : parseInt(marginLeft);
			var top = $(dataListTable).offset().top;
			var left = td.offsetLeft + marginLeft + scrollLeft + td.offsetWidth - 1;
			resizeLine.style.left = left + "px";
			resizeLine.style.top = top + "px";
			resizeLine.style.height = dataListTable.offsetHeight + "px";
		}

		function up(){
			resize();
			dataListTable.mousedown = false;
			resizeLine.style.display = "none";
			startX = -1;
			eventCell = null;
		}

		function resize(){
			if(eventCell == null) return;
			var e = window.event || event;
			var index = eventCell.cellIndex;
			var th = dataListTable.rows[0].cells[index];
			if(th == null || isLocked(th)) return;
			var scrollLeft = dataListTable.parentNode.scrollLeft;
			var marginLeft = dataListTable.parentNode.style.marginLeft;
			marginLeft = marginLeft == null || marginLeft == "" ? 0 : parseInt(marginLeft);
			var width = e.x - marginLeft + scrollLeft - eventCell.offsetLeft;
			L.setColumnWidth(th.id, width);
		}
	}

	//Cookie记录选择
	function CookieHandler(){
		var selections = null;
		var cookie = jaf.cookie.read(SELECTED_ITEMS_COOKIE_NAME);
		if(cookie == "" || cookie == "null") selections = [];
		else selections = cookie.split("#");

		this.add = function(str){
			if(str == null) return;
			for(var i=0;i<selections.length;i++){
				if(str == selections[i]) return;
			}
			selections.push(str);
		};
		this.remove = function(str){
			if(str == null) return;
			selections.str_pop(str);
		};

		this.clear = function(){
			jaf.cookie.write(SELECTED_ITEMS_COOKIE_NAME, null, null, "/");
		};

		this.remember = function(){
			var str = selections.join("#");
			jaf.cookie.write(SELECTED_ITEMS_COOKIE_NAME, str, null, "/");
		};
	}

	//列表表格点击事件
	function tableListClickEvent(){
		var e = window.event;
		var activeEle = e.srcElement;
		if(activeEle.tagName.toUpperCase() == "TD" || activeEle.tagName.toUpperCase() == "TH"){
			if(activeEle.className == "no-data") return;
			activeEle = activeEle.parentNode;
		}

		try{
			lastCheckRow.className = lastCheckRow.className.replace(" selected", "");
		}catch(e){}
		activeEle.className += " selected";
		lastCheckRow = activeEle;

		if(rightMouseEvent){
			if(e.button.toString() != "2"){
				tableMenu.hidden();
				return;
			}
		}

		if(activeEle.tagName.toUpperCase() == "TR"){
			tableMenu.display(activeEle);
		}
	}

	//网页内容点击事件
	function documentBodyClickEvent(){
		var activeEle = window.event.srcElement;
		try{
			if(activeEle.parentNode.parentNode.tagName.toUpperCase() == "TBODY"){
				return;
			}
		}catch(e){
			tableMenu.hidden();
		}
		tableMenu.hidden();
	}

	//列表表格双击事件
	function tableListDoubleClickEvent(){
		tableMenu.hidden();
		var activeEle = window.event.srcElement;
		if(activeEle.tagName.toUpperCase() == "TD"){
			activeEle = activeEle.parentNode;
		}

		if(activeEle.tagName.toUpperCase() != "TR") return;

		var cells = activeEle.cells;
		var selectionCell = cells[selectionColumnIndex];
		var radio = null;
		try{
			radio = selectionCell.getElementsByTagName("input")[0];
		}catch(e){
			return;
		}
		try{
			radio.onclick();
		}catch(e){
		}
	}

	//已选择的数据列表控制器
	function DataSelectedListHandler(){
		var table = null;
		var dataSelectedListTableFrame = document.getElementById("data-selected-list-frame");
		if(dataSelectedListTableFrame != null) {
			table = getTable();
			init();
		}

		//获取已选择表格，如果该表格不存在，就创建一个表格
		function getTable(){
			var id = "report-selected-list";
			var table = document.getElementById(id);
			if(table != null) return table;
			table = document.createElement("table");
			table.id = id;
			table.className = dataListTable.className;
			var newTHead = dataListTable.tHead.cloneNode(true);
			newTHead.getElementsByTagName("th")[0].innerHTML = "";
			newTHead.getElementsByTagName("th")[1].innerHTML = "";
			table.appendChild(newTHead);
			var newTBody = document.createElement("tbody");
			table.appendChild(newTBody);
			var panel = dataSelectedListTableFrame.children[0].children[0].children[0];
			var panelClassName = panel.className;
			panelClassName = panelClassName.replace(" no-field", "");
			panel.className = panelClassName;
			panel.appendChild(table);
			return table;
		}

		//一些初始化的操作，如：根据已选择的项目勾选数据列表中的项
		function init(){
			var dataListRows = dataListTable.tBodies[0].rows;
			var dataSelectedListRows = table.tBodies[0].rows;
			for(var i=0;i<dataSelectedListRows.length;i++){
				var selectedDataObj = getRowDataObj(dataSelectedListRows[i]);
				if(selectedDataObj == null) continue;
				var selectedDataObjKey = selectedDataObj[selectedRelationObj.to];
				for(var j=0;j<dataListRows.length;j++){
					var dataObj = getRowDataObj(dataListRows[j]);
					if(dataObj == null) continue;
					var dataObjKey = dataObj[selectedRelationObj.to];
					if(dataObjKey == selectedDataObjKey){
						var __cell = dataListRows[j].cells[selectionColumnIndex];
						var __input = __cell.getElementsByTagName("input")[0];
						if(__input.type != "checkbox" && __input.type != "radio") continue;
						__input.checked = true;
						break;
					}
				}
				cookieHandler.add(selectedDataObjKey);
			}
			cookieHandler.remember();
		}

		//将选择的项目加入到已选择面板中
		this.add = function(eventObj, dataObj){
			if(table == null) return;
			var index = valueOf(dataObj);
			if(index != -1) return;

			var tBody = table.tBodies[0];
			var tr = eventObj.parentNode.parentNode;
			var newTRHtml = tr.innerHTML;
			var newTR = tBody.insertRow(tBody.rows.length);
			newTR.innerHTML = newTRHtml;
			var indexCell = newTR.cells[eventObj.parentNode.cellIndex];
			var removeSelfHref = document.createElement("a");
			removeSelfHref.href = "javascript:;";
			removeSelfHref.onclick = function(){
				L.doRemoveSelected(this);
			};
			removeSelfHref.innerHTML = "r";
			indexCell.getElementsByTagName("input")[0].style.display = "none";
			indexCell.appendChild(removeSelfHref);
		};

		//移除一个
		this.remove = function(dataObj){
			if(table == null) return;
			var index = valueOf(dataObj);
			if (index == -1) return;
			table.tBodies[0].deleteRow(index);
		};

		//获取已选择的数据
		this.getList = function(){
			var rows = table.tBodies[0].rows;
			var array = [];
			for(var i=0;i<rows.length;i++){
				var dataObj = getRowDataObj(rows[i]);
				if(dataObj == null) continue;
				array.push(dataObj);
			}
			return array;
		};

		function valueOf(dataObj){
			if(dataObj == null) return -1;
			var rows = table.tBodies[0].rows;
			for(var i=0;i<rows.length;i++){
				var rowDataObj = getRowDataObj(rows[i]);
				if(rowDataObj == null) continue;
				if(dataObj == rowDataObj) return i;
				if(selectedRelationObj.to == null || selectedRelationObj.to == "" || selectedRelationObj.to == "null") return -1;
				if(dataObj[selectedRelationObj.to] == rowDataObj[selectedRelationObj.to]) return i;
			}
			return -1;
		}
	}

	function getRowDataObj(row){
		var input = row.cells[selectionColumnIndex].getElementsByTagName("input")[0];
		if(input == null) return null;
		var dataObj = null;
		try{
			dataObj = JSON.parse(input.value);
		}catch(e){
			dataObj = eval("[" + input.value + "]")[0];
		}
		var inputs = row.getElementsByTagName("input");
		var selects = row.getElementsByTagName("select");
		for(var i=0;i<inputs.length;i++){
			var input = inputs[i];
			if(input.type == "checkbox") continue;
			var name = input.name;
			if(name == "") continue;
			dataObj[name] = input.value;
		}
		for(var i=0;i<selects.length;i++){
			var select = selects[i];
			var name = select.name;
			if(name == "") continue;
			dataObj[name] = select.value;
		}
		return dataObj;
	}

	this.getAllowLock = function(){
		return allowLock;
	};
	this.doRemoveSelected = function(eventObj){
		var selectedDataObj = null;
		var input = eventObj.parentNode.getElementsByTagName("input")[0];
		try{
			selectedDataObj = JSON.parse(input.value);
		}catch(e){
			selectedDataObj = eval("[" + input.value + "]")[0];
		}

		var selectedDataObjValue = null;
		try{
			selectedDataObjValue = selectedDataObj[selectedRelationObj.to];
		}catch(e){
		}

		dataSelectedListHandler.remove(selectedDataObj);
		cookieHandler.remove(selectedDataObjValue);
		cookieHandler.remember();

		if(selectedRelationObj.to == null || selectedRelationObj.to == "" || selectedRelationObj.to == "null") return;

		var rows = dataListTable.tBodies[0].rows;
		var cellIndex = eventObj.parentNode.cellIndex;
		for(var i=0;i<rows.length;i++){
			var dataObj = getRowDataObj(rows[i]);
			if(dataObj == null) continue;
			var dataObjValue = null;
			try{
				dataObjValue = dataObj[selectedRelationObj.to];
			}catch(e){
			}
			if(dataObj == selectedDataObj || dataObjValue == selectedDataObjValue){
				var __input = rows[i].cells[cellIndex].getElementsByTagName("input")[0];
				if(__input.type == "radio" || __input.type == "checkbox"){
					__input.checked = false;
				}
			}
		}
	};
	this.hiddenColumn = function(code, val){
		var trs = dataListTable.rows;
		var colIndex = null;
		var columns = trs[0].cells;
		for(var i=1;i<trs.length;i++){
			var tds = trs[i].cells;
			for(var j=0;j<columns.length;j++){
				if(columns[j].id != code) continue;
				colIndex = j;
				try {
					tds[j].className = val ? "hidden" : "";
				}catch(e){}
				break;
			}
		}
		if(colIndex == null) return;
		if(isLocked(columns[colIndex])) L.lockColumn(columns[colIndex],false);
		trs[0].cells[colIndex].className = val?"hidden":"";

		H.getColumnController().sync(columns[colIndex]);
	};
	this.lockColumn = function(source, val){
		if(!allowLock && val) return;
		var rows = dataListTable.rows;
		if(typeof(source) == "string") {
			source = rows[0].getElementsByTagName("th")[source];
		}
		if(source == null) return;
		if(source.className.indexOf("locked") != -1 && val) return;
		var index = source.cellIndex;
		var capacity = dataListTable.parentNode;
		var oldMarginLeft = getMarginLeft();
		var width = source.offsetWidth;

		var styleWidth = source.style.width;
		var styleAlign = source.style.textAlign;

		source.className = source.className.replace(/(^|\s+)locked/g, "");

		//增加列头的CSS类
		if (val) {
			source.style.width = source.offsetWidth + "px";
			source.className += " locked";
		} else {
			source.removeAttribute("style");
			source.style.width = styleWidth;
			source.style.textAlign = styleAlign;
		}

		for(var i=0;i<rows.length;i++) {
			try {
				width = Math.max(width, rows[i].cells[index].offsetWidth);
			}catch(e){
				console.log(e.message);
			}
		}

		for(var i=0;i<rows.length;i++) {
			var cells = rows[i].cells;
			oldMarginLeft = 0;
			for(var j=0;j<cells.length;j++) {
				var cell = rows[i].cells[j];
				if (rows[0].cells[j].className.indexOf("locked") != -1) {
					cell.style.zIndex = i;
					if (i == 1) {
						cell.style.marginTop = "1px";
						//column.style.height = column.offsetHeight - 1 + "px";
					}
					//cell.style.width = width + "px";
					var ow = rows[0].cells[j].offsetWidth;
					cell.style.width = ow + "px";
					cell.style.left = oldMarginLeft + "px";
					cell.className = cell.className.replace(/(^|\s+)locked/g, "");
					cell.className += " locked";
					oldMarginLeft += ow;
				} else {
					cell.className = cell.className.replace(/(^|\s+)locked/g, "");
					styleWidth = cell.style.width;
					styleAlign = cell.style.textAlign;
					cell.removeAttribute("style");
					cell.style.width = styleWidth;
					cell.style.textAlign = styleAlign;
				}
			}
		}

		if(val) {
			capacity.style.marginLeft = oldMarginLeft + 1 + "px";
		}else{
			capacity.style.marginLeft = getMarginLeft() + "px";
		}

		if(H.showColumnControl()) {
			H.getColumnController().sync(source);
		}

		function getMarginLeft(){
			var cells = rows[0].cells;
			var width = 0;
			for(var i=0;i<cells.length;i++){
				if(cells[i].className.indexOf("locked") == -1) continue;
				width += cells[i].offsetWidth;
			}
			return width;
		}
	};
	this.setColumnWidth = function(source, val){
		var tr = dataListTable.rows[0];
		var column = tr.getElementsByTagName("th")[source];
		if(column == null) return;
		if(val == ""){
			column.style.width = "";
		}else {
			column.style.width = val + "px";
		}
	};
	this.setColumnAlign = function(source, val){
		var trs = dataListTable.rows;
		var column = trs[0].getElementsByTagName("th")[source];
		if(column == null) return;
		var index = column.cellIndex;
		for(var i=0;i<trs.length;i++){
			var cell = trs[i].cells[index];
			cell.style.textAlign = val;
		}
	};
	this.selectAll = function(eventObj){
		var rows = dataListTable.tBodies[0].rows;
		var cellIndex = eventObj.parentNode.cellIndex;
		for(var i=0;i<rows.length;i++){
			var selectionCell = rows[i].cells[cellIndex];
			var selectionObj = selectionCell.getElementsByTagName("input")[0];
			if(selectionObj == null || selectionObj.type != "checkbox") continue;

			var dataObj = null;
			try{
				dataObj = JSON.parse(selectionObj.value);
			}catch(e){
				dataObj = eval("[" + selectionObj.value + "]")[0];
			}
			var value = null;
			try{
				value = dataObj[selectedRelationObj.to];
			}catch(e){
			}

			selectionObj.checked = eventObj.checked;

			if(selectionObj.checked){
				dataSelectedListHandler.add(selectionObj, dataObj);
				cookieHandler.add(value);
			}else{
				dataSelectedListHandler.remove(dataObj);
				cookieHandler.remove(value);
			}
		}
		cookieHandler.remember();
	};
	this.selection = function(eventObj){
		var dataObj = null;
		try{
			dataObj = JSON.parse(eventObj.value);
		}catch(e){
			dataObj = eval("[" + eventObj.value + "]")[0];
		}

		if(eventObj.type == "checkbox"){
			var value = null;
			try{
				value = dataObj[selectedRelationObj.to];
			}catch(e){
			}
			if(eventObj.checked){
				dataSelectedListHandler.add(eventObj, dataObj);
				cookieHandler.add(value);
			}else{
				dataSelectedListHandler.remove(dataObj);
				cookieHandler.remove(value);
			}
			cookieHandler.remember();
			return;
		}

		var instance = top.MD.getInstance();
		if(instance == null) return;

		try{
			var callback = instance.callback();
			if(typeof(callback) == "string"){
				callback = instance.event.window.eval(callback);
			}
			if(eventObj.type == "radio"){
				callback(instance.event, dataObj);
			}else if(eventObj.type == "button"){
				// bug#2091更正，当表体参照没有选择任何数据时，不能清空原有数据
				var dataList = dataSelectedListHandler.getList();
				if((dataList instanceof Array) && (dataList.length > 0)) {
					callback(instance.event, dataList);
				}
			}
			top.FSC.resize();
		}catch(e){
		}
		cookieHandler.clear();
		top.MD.close();
	};
	this.getSelected = function(){
		var rows = dataListTable.tBodies[0].rows;
		var array = [];
		for(var i=0;i<rows.length;i++){
			var input = rows[i].cells[selectionColumnIndex].getElementsByTagName("input")[0];
			if(input== null || input.type != "checkbox" || !input.checked) continue;
			var dataObj = getRowDataObj(rows[i]);
			if(dataObj == null) continue;
			array.push(dataObj);
		}
		return array;
	};
	this.getData = function(wrapper){
		var rows = dataListTable.tBodies[0].rows;
		var array = [];
		for(var i=0;i<rows.length;i++){
			var input = rows[i].cells[selectionColumnIndex].getElementsByTagName("input")[0];
			var dataObj = {};
			if(input != null && input.type == "checkbox"){
				dataObj = getRowDataObj(rows[i]);
			}
			if(dataObj == null) continue;
			if(wrapper != null){
				dataObj = wrapper(dataObj, rows[i]);
			}
			array.push(dataObj);
		}
		return array;
	};
	this.getTable = function(){
		return dataListTable;
	};
};

var H = new function (){
	var preceptUrlTemplate = "";
	var dataListSwitchHandler = null;
	var report = null;
	var columnController = null;
	this.init = function(__report, __precept, __reference){
		report = __report;
		try {
			var __temp = document.getElementById("data-list-operate").getElementsByTagName("div");
			if(this.showColumnControl()) {
				columnController = new ColumnController(__temp["column-control"], __precept, __report);
			}
			new ExportController(__temp["export-control"], __report);
			if(this.showColumnPrecept()) {
				new FieldPreceptList(document.getElementById("column-precept"), __report, __reference, __precept);
			}
		}catch(e){}
		preceptUrlTemplate = __precept.url;
		dataListSwitchHandler = new DataListSwitchHandler();
	};

	this.showColumnControl = function () {
		return document.getElementById("column-control") != null;
	};

	this.showColumnPrecept = function () {
		return document.getElementById("column-precept") != null;
	};

	this.doSwitch = function(eventObj, displayTarget){
		dataListSwitchHandler.doSwitch(displayTarget);
	};

	this.getReport = function(){
		return report;
	};

	this.getColumnController = function(){
		return columnController;
	};

	function DataListSwitchHandler(){
		var items = [];
		try{
			items = document.getElementById("data-list-control").children;
		}catch(e){}
		try {
			disabledAllQueryInputs(items[1].className == "selected");
		}catch(e){}

		this.doSwitch = function(targetItem){
			try {
				if (targetItem == "data-list-frame") {
					document.getElementById("data-list-frame").style.display = "block";
					document.getElementById("data-selected-list-frame").style.display = "none";
					items[0].className = "selected";
					items[1].className = "";
					disabledAllQueryInputs(false);
				} else if (targetItem == "data-selected-list-frame") {
					document.getElementById("data-selected-list-frame").style.display = "block";
					document.getElementById("data-list-frame").style.display = "none";
					items[0].className = "";
					items[1].className = "selected";
					disabledAllQueryInputs(true);
				}
			}catch(e){}
		};

		function disabledAllQueryInputs(bol){
			var searchBox = document.getElementById("search-box");
			var inputs = searchBox.getElementsByTagName("input");
			var selects = searchBox.getElementsByTagName("select");
			for(var i=0;i<inputs.length;i++){
				inputs[i].disabled = bol;
			}
			for(var i=0;i<selects.length;i++){
				selects[i].disabled = bol;
			}
		}
	}

	function FieldPreceptList(panel, report, reference, __precept){
		if(panel == null) return;
		panel.getElementsByTagName("h1")[0].getElementsByTagName("label")[0].onclick = function(){
			getPrecepts();
			panel.className = "hover";
		};

		panel.getElementsByTagName("h1")[0].getElementsByTagName("em")[0].onclick = function(){
			initPanel(panel);
		};

		var lastSetDefNode = null;
		function getPrecepts(){
			beginLoading(panel);
			var ul = panel.getElementsByTagName("ul")[0];
			ul.innerHTML = "";
			var params = {"report.id":report};
			$.post(ctx + "/report/report-customization!getFieldPrecepts.jhtml", params, function (data){process(data);endLoading(panel);}, "json");

			function process(data){
				if(data == null || isEmptyObject(data)) {
					var li = document.createElement("li");
					li.innerHTML = "无";
					li.className = "default";
					ul.appendChild(li);
					return;
				}

				var li = document.createElement("li");
				li.className = "default";
				li.innerHTML = "<a class=\"name\" href=\"" + preceptUrlTemplate.replace("%{precept}", "") + "\">" + lang["field.precept.default"] + "</a>";
				ul.appendChild(li);

				for(var prop in data) {
					var item = document.createElement("li");
					var folderLabel = document.createElement("em");
					folderLabel.innerHTML = lang[prop];
					folderLabel.onclick = function(){
						var target = this.parentNode;
						var className = target.className;
						target.className = className == "collapse" ? "" : "collapse";
					};
					item.appendChild(folderLabel);

					var folder = document.createElement("ul");

					var array = data[prop];
					for (var i = 0; i < array.length; i++) {
						li = document.createElement("li");
						li.index = array[i].id;
						var url = preceptUrlTemplate.replace("%{precept}", array[i].id);
						var html = "<a class=\"name\" href=\"" + url + "\">" + (i + 1) + "." + array[i].name + "</a>";
						if(array[i].del) {
							html += "<a class=\"del\" href=\"javascript:;\">删除</a>";
						}
						if (array[i].def) {
							html += "<strong></strong>";
							lastSetDefNode = li;
						} else {
							html += "<a class=\"def\" href=\"javascript:;\">设为默认</a>";
						}
						li.innerHTML = html;
						folder.appendChild(li);
						bandItemEvent(li);
					}
					item.appendChild(folder);
					ul.appendChild(item);
				}
			}
		}

		function bandItemEvent(li){
			var hrefs = li.getElementsByTagName("a");
			var delHref = hrefs[1];
			var setDefHref = hrefs[2];
			if(delHref != null) {
				delHref.onclick = function () {
					del(this);
				};
			}
			if(setDefHref != null){
				setDefHref.onclick = function(){
					setDef(this);
				};
			}
		}

		function setDef(eventObj){
			var liObj = eventObj.parentNode;
			var id = liObj.index;
			$.post(ctx + "/report/report-customization!setFieldPreceptDef.jhtml", {"fieldPrecept.id":id},
				function (data){
					if(!data.result) return;
					liObj.appendChild(document.createElement("strong"));
					liObj.removeChild(liObj.children[2]);
					if(lastSetDefNode != null){
						var html = lastSetDefNode.innerHTML;
						html = html.replace("<strong></strong>", "<a class=\"def\" href=\"javascript:;\">设为默认</a>");
						lastSetDefNode.innerHTML = html;
						bandItemEvent(lastSetDefNode);
					}
					lastSetDefNode = liObj;
				}, "json");
		}

		function del(eventObj){
			var liObj = eventObj.parentNode;
			var ulObj = liObj.parentNode;
			var id = liObj.index;
			$.post(ctx + "/report/report-customization!delFieldPrecept.jhtml", {"fieldPrecept.id":id},
				function (data){
					if(!data.result) return;
					ulObj.removeChild(liObj);
					var lis = ulObj.getElementsByTagName("li");
					if(lis.length <= 0) {
						var li = document.createElement("li");
						li.innerHTML = "无";
						ulObj.appendChild(li);
					}
					__precept.id="";
					__precept.name="";
					__precept.public=true;
				}, "json");
		}
	}

	function ExportController(panel, report){
		if(panel == null) return;
		panel.getElementsByTagName("label")[0].onclick = function(){
			panel.className = "hover";
			$(this).html('全部');
			getExportColumns(panel);
		};
		panel.getElementsByTagName("em")[0].onclick = function(){
			$(this).siblings('label').html('导出');
			initPanel(panel);
		};
		panel.getElementsByTagName("h1")[0].getElementsByTagName("input")[0].onclick = function(){
			selectAll(panel, this.checked);
		};
		panel.getElementsByTagName("h2")[0].getElementsByTagName("input")[0].onclick = function(){
			doExport();
		};

		function doExport(){
			if(!verify()) return;
			var iframe = panel.getElementsByTagName("iframe")[0];
			if(iframe == null){
				iframe = document.createElement("iframe");
				iframe.frameBorder = 0;
				iframe.name = "__report_target__";
				iframe.width = "0px";
				iframe.height = "0px";
				panel.appendChild(iframe);
			}
			var locationParams = location.search;
			var form = panel.getElementsByTagName("form")[0];
			var action = form.action;
			action += locationParams;
			action += action.indexOf("?") != -1 ? "&" : "?";
			var queried = "";
			var ordered = "";
			try{
				queried = Q.queried();
			}catch(e){}
			try{
				ordered = Q.ordered();
			}catch(e){}
			var search = queried + (ordered == "" ? "" : "&" + ordered);
			action += search;
			form.action = action;
			form.target = "__report_target__";

			jaf.loading.open("<span style=\"font-size:14px\">请稍候，该窗口将于10秒钟后关闭。</span>")
			form.submit();
			window.setTimeout(function(){jaf.loading.close();}, 10000);

			function verify(){
				var checked = false;
				var ul = panel.getElementsByTagName("ul")[0];
				var checkboxs = ul.getElementsByTagName("input");
				for(var i=0;i<checkboxs.length;i++){
					if(checkboxs[i].type == "checkbox" && checkboxs[i].checked){
						return true;
					}
				}
				if(!checked){
					jaf.alert("您没有选择字段，请选择至少一个字段");
				}
				return false;
			}
		}

		function getExportColumns(){
			beginLoading(panel);
			var ul = panel.getElementsByTagName("ul")[0];
			ul.innerHTML = "";
			var params = {"report.id":report};
			$.post(ctx + "/report/report-customization!getExportFields.jhtml", params,
				function (data, textStatus){
					process(data);
				}, "json");

			function process(data){
				for(var i=0;i<data.length;i++){
					var li = document.createElement("li");
					li.innerHTML = "<label><input name=\"fields[" + i + "].id\" type=\"checkbox\" value=\"" + data[i].id + "\" /> " + data[i].name + "</label>";
					ul.appendChild(li);
				}
				endLoading(panel);
			}
		}
	}

	function ColumnController(panel, precept, report){
		var isAlreadyInit = false;
		panel.getElementsByTagName("label")[0].onclick = function(){
			panel.className = "hover";
			getListColumns(panel);
		};
		panel.getElementsByTagName("em")[0].onclick = function(){
			initPanel(panel);
		};
		/*
		 panel.getElementsByTagName("h1")[0].getElementsByTagName("input")[0].onclick = function(){
		 selectAll(panel, this.checked);
		 };
		 */

		var inputs = panel.getElementsByTagName("h2")[0].getElementsByTagName("input");
		if(precept.id == ""){
			inputs[2].disabled = true;
		}
		inputs[0].value = precept.name;
		inputs[1].checked = precept.public;
		inputs[2].onclick = function(){
			saveFieldPrecept(this, precept.id);
		};
		inputs[3].onclick = function(){
			saveFieldPrecept(this, null);
		};

		function saveFieldPrecept(eventObj, id){
			eventObj.disabled = true;
			var params = {};
			params["fieldPrecept.report.id"] = report;
			if(id != null && id != ""){
				params["fieldPrecept.id"] = id;
			}
			var name = inputs[0].value;
			inputs[0].value = "";
			params["fieldPrecept.name"] = name;
			params["fieldPrecept.isDef"] = false;
			params["fieldPrecept.isPublic"] = inputs[1].checked;
			var items = panel.getElementsByTagName("ul")[0].getElementsByTagName("li");
			for(var i=0;i<items.length;i++){
				var _inputs = items[i].getElementsByTagName("input");
				var _selects = items[i].getElementsByTagName("select");
				params["fields[" + i + "].field.id"] = _inputs[0].value;
				params["fields[" + i + "].hidden"] = _inputs[0].checked;
				params["fields[" + i + "].lock"] = _inputs[1].checked;
				params["fields[" + i + "].width"] = _inputs[2].value;
				params["fields[" + i + "].align"] = _selects[0].value;
			}
			$.post(ctx + "/report/report-customization!saveFieldPrecept.jhtml", params,
				function (data){
					process(data);
				}, "json");

			function process(data){
				var msg = data.result ? "操作成功！" : (data.msg == undefined || data.msg == "" ? "操作失败！" : data.msg);
				var msgPanel = panel.getElementsByTagName("h2")[0].getElementsByTagName("span")[0];
				msgPanel.innerHTML = "<span>" + msg + "</span>";
				msgPanel.style.marginLeft = eventObj.offsetLeft + "px";
				msgPanel.style.display = "block";
				window.setTimeout(function(){
					msgPanel.style.display = "none";
					eventObj.disabled = false;
					initPanel(panel);
				}, 2000);
			}
		}

		function getListColumns(panel){
			beginLoading(panel);
			if(isAlreadyInit){
				endLoading(panel);
				return;
			}
			var ul = panel.getElementsByTagName("ul")[0];
			ul.innerHTML = "";
			var params = {"report.id":report};
			if(precept.id != ""){
				params["fieldPrecept.id"] = precept.id;
			}
			$.post(ctx + "/report/report-customization!getColumnFields.jhtml", params,
				function (data){
					process(data);
					isAlreadyInit = true;
				}, "json");

			function process(data){
				var Aligns = [{key:"left", value:lang["align.left"]},{key:"center", value:lang["align.center"]},{key:"right", value:lang["align.right"]}];
				var columns = L.getTable().rows[0].getElementsByTagName("th");
				var hiddenColumns = 0;
				var allowedHidden = true;
				for(var i = 0; i < columns.length; ++i) {
					if(columns[i].className.indexOf("hidden") != -1) {
						++hiddenColumns;
					}
				}
				if(hiddenColumns + 3 >= columns.length) {
					allowedHidden = false;
				}
				for(var i=0;i<data.length;i++){
					var column = columns[data[i].code];
					var lock = false;
					var hidden = false;
					var allowLock = L.getAllowLock();
					var align = "left";
					var width = 80;
					var hiddenDisabled = "";
					var hiddenChecked = "";
					if(column != null){
						lock = column.className.indexOf("locked") != -1;
						hidden = column.className.indexOf("hidden") != -1;
						//align = column.style.textAlign;
						align = column.attributes["data-align"].value;
						width = column.style.width;
					}
					width = (width == undefined || width == null || width == "") ? 80 : width;
					width = (width + "").replace("px","");
					align = (align == undefined || align == null) ? "" : align;
					var li = document.createElement("li");
					li.id = "fp_____" + data[i].code;
					hiddenChecked = hidden? "checked=\"checked\"" : "";
					hiddenDisabled = (!allowedHidden && !hidden) ? "disabled=\"disabled\"" : "";
					var html = "<label>" + data[i].name + "</label>";
					html += "<label class='ck'><input name=\"hidden\" type=\"checkbox\" value=\"" + data[i].id + "\"" + hiddenDisabled + hiddenChecked + " /></label>";
					html += "<label class='ck lock'><input name=\"lock\" type=\"checkbox\" value=\"" + data[i].id + "\"" + (lock?" checked":"") + (hidden || !allowLock ? " disabled" : "") + " /></label>";
					if(i == data.length - 1) {
						html += "<label class='input width'><input name=\"width\" type=\"text\" maxlength=\"3\" value=\"\" disabled /></label>";
					}else{
						html += "<label class='input width'><input name=\"width\" type=\"text\" maxlength=\"3\" value=\"" + width + "\" /></label>";
					}
					html += "<label class='input'><select name=\"align\">";
					for(var j=0;j<Aligns.length;j++){
						var selected = Aligns[j].key == align ? " selected=\"selected\"" : "";
						html += "<option value=\"" + Aligns[j].key + "\"" + selected + ">" + Aligns[j].value + "</option>"
					}
					html += "</select></label>";
					li.innerHTML = html;
					ul.appendChild(li);

					var inputs = li.getElementsByTagName("input");
					var selects = li.getElementsByTagName("select");
					inputs[0].onclick = function(){
						var $checkbox = $(this).closest("ul").find(":checkbox[name='hidden']");
						var totalLength = $checkbox.length;
						var checkedLength = $checkbox.filter(":checked").length;
						if(checkedLength + 1 == totalLength) {
							$checkbox.not(":checked").attr("disabled", true);
						} else if (checkedLength + 2 == totalLength) {
							$checkbox.not(":checked").attr("disabled", false);
						}

						var code = this.parentNode.parentNode.id.replace("fp_____", "");
						L.hiddenColumn(code, this.checked);
					};
					inputs[1].onclick = function(){
						var code = this.parentNode.parentNode.id.replace("fp_____", "");
						L.lockColumn(code, this.checked);
					};
					inputs[2].onchange = function(){
						var code = this.parentNode.parentNode.id.replace("fp_____", "");
						L.setColumnWidth(code, this.value);
					};
					inputs[2].onkeyup = function(){
						this.value=this.value.replace(/\D/g,'');
					};
					inputs[2].onafterpaste = function(){
						this.value=this.value.replace(/\D/g,'');
					};
					selects[0].onchange = function(){
						var code = this.parentNode.parentNode.id.replace("fp_____", "");
						L.setColumnAlign(code, this.value);
					};
				}
				endLoading(panel);
			}
		}

		this.sync = function(column){
			var li = panel.getElementsByTagName("ul")[0].getElementsByTagName("li")["fp_____" + column.id];
			if(li == null) return;
			var lock = column.className.indexOf("locked") != -1;
			var hidden = column.className.indexOf("hidden") != -1;
			var inputs = li.getElementsByTagName("input");
			inputs[0].checked = hidden;
			inputs[1].checked = lock;
			inputs[1].disabled = hidden;
		};
	}

	function selectAll(panel, selection){
		var ul = panel.getElementsByTagName("ul")[0];
		var inputs = ul.getElementsByTagName("input");
		for(var i=0;i<inputs.length;i++){
			if(inputs[i].type != "checkbox") continue;
			inputs[i].checked = selection;

			if(panel.id != "column-control") continue;
			var code = inputs[i].parentNode.id.replace("fp_____", "");
			L.hiddenColumn(code, selection);
		}
	}

	function initPanel(panel){
		panel.className = "";
		var loading = panel.getElementsByTagName("h3")[0];
		loading.style.display = "none";
		var ul = panel.getElementsByTagName("ul")[0];
		ul.style.display = "none";
		var div = panel.getElementsByTagName("div")[0];
		if(div != null) {
			div.style.display = "none";
		}
		var btns = panel.getElementsByTagName("h2")[0];
		if(btns != null) {
			btns.style.display = "none";
		}
	}

	function beginLoading(panel){
		var loading = panel.getElementsByTagName("h3")[0];
		loading.style.display = "block";
		var ul = panel.getElementsByTagName("ul")[0];
		ul.style.display = "none";
		var div = panel.getElementsByTagName("div")[0];
		if(div != null) {
			div.style.display = "none";
		}
		var btns = panel.getElementsByTagName("h2")[0];
		if(btns != null) {
			btns.style.display = "none";
		}
	}

	function endLoading(panel){
		var loading = panel.getElementsByTagName("h3")[0];
		loading.style.display = "none";
		var ul = panel.getElementsByTagName("ul")[0];
		ul.style.display = "block";
		var div = panel.getElementsByTagName("div")[0];
		if(div != null) {
			div.style.display = "block";
		}
		var btns = panel.getElementsByTagName("h2")[0];
		if(btns != null) {
			btns.style.display = "block";
		}
	}
};

/**
 * j+ framework 中提供的报表/列表操作JS对象
 * @module Table
 * @class Table
 * @static
 * @type {Object}
 */
var Table = {};

/**
 * 获取表格已选的项目
 * @method getSelected
 * @returns {Object} 该行的值javascript对象
 */
Table.getSelected = function(){return L.getSelected();}

/**
 * 通知服务端某一列发生了改变
 * @method doSynzChange
 * @param id 该行的唯一标识
 * @param field 发生改变的字段编码
 * @param value 发生改变后的值
 * @param callback 服务端处理后的回调函数
 * @param report 目标报表/列表的编号，如果该参数为空，获取当前报表/列表编号
 * @example function tableCellChanged(eventObj){<br/>
		&nbsp; &nbsp;Table.doSynzChange(“123456”, "account", eventObj.value, function(result){<br/>
			&nbsp; &nbsp;&nbsp; &nbsp;alert(result);<br/>
		&nbsp; &nbsp;});<br/>
	}
 */
Table.doSynzChange = function(id, field, value, callback, report) {
	var url = ctx + "/report/report-modify!change.jhtml";
	report = report == null || report == undefined ? H.getReport() : report;
	var params = {"params[0].id": id, "params[0].params.field":field,"params[0].params.value":value, "report.id" : report};
	$.post(url, params, function (data){
		if(callback != null && callback != ""){
			callback(data);
		}
	}, "json");
};

/**
 * 与服务端同步多行多列的变化<br>
 * 同时该方法也可以将自定义的操作事件及参数反馈到服务端
 * @method doSynzPost
 * @param eventCode 事件的编码
 * @param callback 服务端处理后的回调函数
 * @param params 发生变化的行和列的参数数组，如果该数组为空，默认为获取所有可编辑的行列。<br>
 * @param report 目标报表/列表的编号，如果该参数为空，获取当前报表/列表编号
 * @param async 同步或者异步
 *     该数组的元素是一个 javascript object 对象，对象中需要提供 id属性：<br>
 *     id：表示需要让服务端定位行的唯一标识<br>
 *     @example function doSynzPost(eventCode){<br/>
    	&nbsp; &nbsp;Table.doSynzPost(eventCode, function(result){<br/>
        &nbsp; &nbsp;&nbsp; &nbsp;alert(result);<br/>
    	&nbsp; &nbsp;},[{id:1, arcCode:0001, name:system}]);<br/>
		}
 */
Table.doSynzPost = function(eventCode, callback, params, report, async){
	async = async == null || async == undefined ? false : async;
	report = report == null || report == undefined ? H.getReport() : report;
	var object = {"report.id" : report, "event":eventCode};
	if(params == null){
		params = L.getData(function(dataObj, row){
			var obj = {"id":dataObj.id};
			var inputs = row.getElementsByTagName("input");
			for(var i=0;i<inputs.length;i++){
				if(inputs[i].parentNode.className == "selection-column") continue;
				obj[inputs[i].name] = inputs[i].value;
			}
			var selects = row.getElementsByTagName("select");
			for(var i=0;i<selects.length;i++){
				obj[selects[i].name] = selects[i].value;
			}
			return obj;
		});
	}
	if(params.length <= 0) return;
	for(var i=0;i<params.length;i++){
		for(var key in params[i]){
			if(key == "id"){
				object["params[" + i + "].id"] = params[i].id;
			}else{
				object["params[" + i + "].params." + key] = params[i][key];
			}
		}
	}
	var url = ctx + "/report/report-modify!post.jhtml";
	$.ajax({
		type: "post",
		url: url,
		data: object,
		cache: false,
		async: async,
		dataType: "json",
		success: function (data) {
			if(callback != null && callback != ""){
				callback(data);
			}
		}
	});
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
			__ulObj.innerHTML = "<li style=\"text-align:center\"><img src=\"" + ctp + "/images/loading.gif\" /></li>";
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
			obj.style.border = "1px solid #FFF";
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