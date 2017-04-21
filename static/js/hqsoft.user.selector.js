/**
 * 用户选择器，支持单选/多选
 * 通过URL参数判断是否单选，赋值控件
 * 如：selector.html?display=usernames&value=userids&type=sign
 * display 表示显示用户名的 input 控件ID
 * value 表示向 隐藏的 input 控件ID
 * type 表示为单选,如果为空表示为多选
 * 注：只支持向父级窗口/或当前窗口中的 INPUT 控件赋值,优先父级窗口
 * @param configObj
 * @return
 */
function UserSelector(ajaxUrl, type, configObj){
	var sourcePanel = document.getElementById("sourceusers");
	var targetPanel = document.getElementById("targetusers");
	var lastSelectFullPath = "";
	
	init();
	
	function AllToTarget(){
		if(configObj.type == "sign" || configObj.type == "ONE" || configObj.type == "one" || configObj.type == "radio") return;
		var slis = sourcePanel.getElementsByTagName("li");
		var len = slis.length;
		var tmpArg = new Array();
		for(var j=0;j<len;j++){
			tmpArg.push(slis[j]);
		}
		for(var i=0;i<tmpArg.length;i++){
			targetPanel.appendChild(tmpArg[i]);
		}
		//init();
	};
	this.allToTarget = AllToTarget;
	
	
	function AllToSource(){
		var slis = targetPanel.getElementsByTagName("li");
		var len = slis.length;
		var tmpArg = new Array();
		for(var j=0;j<len;j++){
			tmpArg.push(slis[j]);
		}
		for(var i=0;i<tmpArg.length;i++){
			sourcePanel.appendChild(tmpArg[i]);
		}
		//init();
	};
	this.allToSource = AllToSource;
	
	//初始化已选择的人员
	function init(){
		var tlis = targetPanel.getElementsByTagName("li");
		for(var i=0;i<tlis.length;i++){
			bandEvent(tlis[i]);
			tlis[i].ondblclick = function(){
				targetPanel.removeChild(this);
			};
		}
		
		var slis = sourcePanel.getElementsByTagName("li");
		for(var j=0;j<slis.length;j++){
			bandEvent(slis[j]);
			slis[j].ondblclick = function(){
				this.style.backgroundColor = "";
				if(this.parentNode == targetPanel){
					sourcePanel.appendChild(this);
				}else{
					if(check(this)){
						targetPanel.appendChild(this);
					}
				}
			};
		}
	}
	
	//AJAX获取到数据后，打印数据
	function print(data){
		sourcePanel.innerHTML = "";
		for(var i=0;i<data.length;i++){
			var li = document.createElement("li");
			li.innerHTML = data[i].name + " (" + data[i].account + ")";
			li.id = data[i].account;
			li.title = data[i].name + "(" + data[i].email + ")";
			bandEvent(li);
			li.ondblclick = function(){
				this.style.backgroundColor = "";
				if(this.parentNode == targetPanel){
					sourcePanel.appendChild(this);
				}else{
					if(check(this)){
						targetPanel.appendChild(this);
					}
				}
			};
			sourcePanel.appendChild(li);
		}
	}
	//绑定事件
	function bandEvent(li){
		li.onmouseover = function(){
			this.style.backgroundColor = "#F4F8FB";
		};
		li.onmouseout = function() {
			this.style.backgroundColor = "";
		};
	}
	
	//单选/多选验证,目标PANEL中是否已经选择了该NODE验证
	function check(node){
		var lis = targetPanel.getElementsByTagName("li");
		if(configObj.type == "sign" || configObj.type == "ONE" || configObj.type == "one" || configObj.type == "radio"){
			if(lis.length > 0){
				return false;
			}
		}
		
		for(var i=0;i<lis.length;i++){
			if(node.id == lis[i].id){
				return false;
			}
		}
		return true;
	}
	
	//AJAX获取指定群组下所有的用户
	function GetUsers(fullpath){
		var fullPathFlag = document.getElementById("dept-flag");
		if(fullpath != null && fullpath != "."){
			var fullpathArg = fullpath.split(".");
			fullPathFlag.innerHTML = "<div>在 <b>“" + fullpathArg[fullpathArg.length - 1] + "”</b> 下搜索用户</div>";
		}else{
			fullPathFlag.innerHTML = "<div>在 <b>“根目录”</b> 下搜索用户</div>";
		}
		var configObjString = JSON.stringify(configObj);
		$.post(ajaxUrl, {paths : fullpath, type: type, properties : configObjString},
				function (data, textStatus){
					print(data);
				}, "json");
		lastSelectFullPath = fullpath;
	}
	this.getUsers = GetUsers;
	
	//快速查询
	var intervalCount = 0;
	var interval = null;
	this.qsearch = function(name){
		intervalCount = 0;
		
		window.clearInterval(interval);
		var configObjString = JSON.stringify(configObj);
		interval = window.setInterval(function(){
			intervalCount ++;
			if(intervalCount >= 5){
				window.clearInterval(interval);
				$.post(ajaxUrl, {paths : lastSelectFullPath == null ? "" : lastSelectFullPath, accounts : name, type: type, properties : configObjString},
						function (data, textStatus){
							print(data);
						}, "json");
			}
		}, 100);
	};
	
	//通过已选择的用户，构建 1,2,3,4,5 类似的用户ID字符串
	function buildUserString(){
		var selectedUsers = targetPanel.getElementsByTagName("li");
		if (selectedUsers.length==0){
			jaf.alert("请至少选择一条记录");
			return false;
		}
		var idsArg = new Array();
		var namesArg = new Array();
		for(var i=0;i<selectedUsers.length;i++){
			idsArg.push(selectedUsers[i].id);
			namesArg.push(selectedUsers[i].innerText);
		}
		top.jaf.picker.users.callback(idsArg, namesArg);
		var dc = parent == self ? document : parent.document;
		
		if(configObj.frame != null && configObj.frame != ""){
			dc = dc.frames[configObj.frame].document || document.getElementsByTagName("iframe")[configObj.frame].contentDocument;
		}
		
		var displayObj = dc.getElementById(configObj.display);
		if(displayObj != null){
			if(displayObj.tagName.toLowerCase() == "input" || displayObj.tagName.toLowerCase() == "textarea"){
				displayObj.value = namesArg.join(",");
			}else{
				displayObj.innerHTML = namesArg.join(",");
			}
		}
		try{
			dc.getElementById(configObj.input).value = idsArg.join(",");
		}catch(e){}
		
		try{
			parent.HqSoftFormFieldValidator.signVerification(configObj.display);
		}catch(e){}
		return idsArg.join(",");
	}
	this.bulit = buildUserString;
}