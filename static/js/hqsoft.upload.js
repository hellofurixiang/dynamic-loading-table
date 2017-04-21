/**
 * 文件上传组件 V1.1
 * 需要 HashMap.js 支持
 * @returns
 */
var Upload = new function(){
	var itemIndex = 0;
	var component = null;
	var fileContainer = null;
	var tipsContainer = null;
	var addBtnContainer = null;
	var params = null;
	var loadingContainer = null;
	
	/**
	 * 初始化一个文件上传组件
	 */
	this.init = function(paramsString){
		params = compileParamsObj(paramsString);
		component = document.getElementById("upload-component");
		fileContainer = component.children[0];
		tipsContainer = component.children[1];
		var items = fileContainer.getElementsByTagName("li");
		itemIndex = items.length;
		addBtnContainer = items[items.length - 1];
		
		var tips = tipsContainer.getElementsByTagName("font");
		tips[0].innerHTML = params.num;
		tips[1].innerHTML = params.extensions.join(", ");
		tips[2].innerHTML = getSizeDesc(params.size * 1024);
		
		loadingContainer = component.children[4];

        checkFileNums();
	};
	
	/**
	 * 增加一个文件
	 */
	function doCreate(fileInput){
		fileInput.name = "files.doc";
		fileInput.style.display = "none";
		var path = fileInput.value;
		if(path == "") return;
		var ext = getFileExtension(path);
		var container = fileInput.parentNode;
		if(!checkFileExtension(path)){
			jaf.alert(Lang.getText("upload.error.file.ext", [ext]), function(){
				container.removeChild(fileInput);
				appendNewFileInput();
			}, lang["upload.error"], "info");
			return;
		}

		var size = getFileSize(fileInput);
		//如果无法获取文件大小，交给后台判断大小
		/*
		if(size == -1){
			jaf.alert(lang["upload.error.file.size.invalid"], function(){
				container.removeChild(fileInput);
				appendNewFileInput();
			}, lang["upload.error"], "error");
			return;
		}
		*/

		if(size > params.size * 1024){
			jaf.alert(Lang.getText("upload.error.file.size", [getSizeDesc(params.size * 1024), getSizeDesc(size)]), function(){
				container.removeChild(fileInput);
				appendNewFileInput();
			}, lang["upload.error"], "info");
			return;
		}
		
		var li = document.createElement("li");
		li.className = "client";
		
		var delEM = document.createElement("em");
		delEM.title = lang["delete"];
		delEM.onclick = function(){doDel(this);};
		li.appendChild(delEM);
		
		var indexH1 = document.createElement("h1");
		indexH1.innerHTML = "<img src=\"" + ctp + "/images/file-type-icon/" + getFileExtension(path) + ".png\" onerror=\"Upload.noFindExtension(this);\" />";
		li.appendChild(indexH1);
		
		var fileDIV = document.createElement("div");
		fileDIV.className = "file";
		fileDIV.innerHTML = "<a href=\"" + path + "\" target=\"_blank\">" + getFileName(path) + "</a>";
		li.appendChild(fileDIV);
		
		var remarkDIV = document.createElement("div");
		remarkDIV.className = "remark";
		remarkDIV.innerHTML = "<input type=\"text\" name=\"files.remark\" value=\"" + lang["remark"] + "\" />";
		li.appendChild(remarkDIV);
		
		li.appendChild(fileInput);
		fileContainer.insertBefore(li, addBtnContainer);
		itemIndex ++;
		
		appendNewFileInput();
		checkFileNums();
		
		fileContainer.scrollTop = fileContainer.scrollHeight;
		
		function appendNewFileInput(){
			var newFileInput = document.createElement("input");
			newFileInput.type = "file";
			newFileInput.onchange = function(){doCreate(this);};
			container.appendChild(newFileInput);
		}
	};
	this.add = doCreate;
	
	/**
	 * 移除一个文件
	 * @param eventObj
	 */
	function doDel(eventObj){
		var item = eventObj.parentNode;
		fileContainer.removeChild(item);
		checkFileNums();
	}
	this.del = doDel;
	
	/**
	 * 上传文件
	 */
	this.submit = function(){
		var items = fileContainer.getElementsByTagName("li");
		//if(items.length < 2) return false;
		loadingContainer.style.display = "block";
		var serverFileJson = "[";
		for(var i=0;i<items.length;i++){
			var inputs = items[i].getElementsByTagName("input");
			if(items[i].className != "server") continue;
			var id = inputs[0].value;
			var remark = inputs[1].value;
			if(i != 0) serverFileJson += ",";
			var __tmp = "{id:" + id + ", remark:\"" + remark + "\"}";
			serverFileJson += __tmp;
		}
		serverFileJson += "]";
		document.getElementById("uploaded").value = serverFileJson;
		return true;
	};
	
	this.noFindExtension = function(img){
		img.src = ctp + "/images/file-type-icon/unknow.gif";
		img.onerror = null;
	};
	
	this.done = function(ids){
		loadingContainer.style.display = "none";
		top.MD.getInstance().callback(ids);
		top.MD.close();
	};
	
	this.error = function(index, msg){
		loadingContainer.style.display = "none";
		var lis = component.getElementsByTagName("li");
		var clients = [];
		for(var i=0;i<lis.length;i++){
			if(lis[i].className != "client") continue;
			clients.push(lis[i]);
		}
		if(clients[index] == null) return;
		var errorDiv = null;
		try{
			errorDiv = clients[index].getElementsByTagName("h2")[0];
			if(errorDiv == null) throw new Error();
		}catch(e){
			errorDiv = document.createElement("h2");
		}
		errorDiv.className = "error";
		errorDiv.innerHTML = "<div>" + msg + "</div>";
		clients[index].appendChild(errorDiv);
	};
	
	/**
	 * 获取文件名称
	 * @param fileInput
	 */
	function getFileName(path){
		return path.substring(path.lastIndexOf("\\") + 1, path.length);
	}
	
	/**
	 * 获取文件的后缀名
	 * @param path
	 * @returns
	 */
	function getFileExtension(path){
		return path.substring(path.lastIndexOf(".") + 1, path.length);
	}
	
	/**
	 * 检查文件后缀名
	 * @param path
	 */
	function checkFileExtension(path){
		var ext = getFileExtension(path);
		for(var i=0;i<params.extensions.length;i++){
			if(ext.toLowerCase() == params.extensions[i].trim().toLowerCase()) return true;
		}
		return false;
	}

	/**
	 * 检查文件大小
	 * @param path
     */
	function getFileSize(dom){
		try {
			return dom.files.item(0).size;
		} catch (e) {
			try {
				var img = new Image();
				img.dynsrc = dom.value;
				img.style.display = 'none';
				document.body.appendChild(img);
				setTimeout(function () {
					document.body.removeChild(img);
				}, 1000);
				return img.fileSize;
			} catch (e) {
				return -1;
			}
		}
	}
	
	/**
	 * 检查上传文件数量
	 */
	function checkFileNums(){
		var items = fileContainer.getElementsByTagName("li");
		var length = items.length - 1;
		if(length < params.num){
			addBtnContainer.style.display = "block";
		}else{
			addBtnContainer.style.display = "none";
		}
	}
	
	/**
	 * 重新整理初始化参数
	 * @param paramsObj
	 */
	function compileParamsObj(paramsString){
		var paramsObj = null;
		if(typeof(paramsString) == "string"){
			paramsObj = eval("[" + paramsString + "]")[0];
		}else{
			paramsObj = paramsString;
		}
		if(paramsObj.extensions == null || paramsObj.extensions == ""){
			paramsObj.extensions = new Array("gif","png","jpg","jpeg","bmp");
		}else{
			paramsObj.extensions = paramsObj.extensions.split(",");
		}
		if(paramsObj.size == null){
			paramsObj.size = 20480;
		}

		if(paramsObj.num == null){
			paramsObj.num = 10;
		}
		
		return paramsObj;
	}

	function getSizeDesc(size){
		var unit = "KB";
		if(size > 1073741824){
			size = size / 1073741824;
			unit = " GB";
		}else if(size > 1048576){
			size = size / 1048576;
			unit = " MB";
		}else if(size > 1024){
			size = size / 1024;
			unit = " KB";
		}
		return size.toFixed(2) + unit;
	}
};