/**
 * 树型结构选择
 * 需要 global.js 支持，用到里面的 getPosition、addLoadEvent 方法
 * 内置了 HashMap对象，不需要外部 HashMap.js 支持
 */
jaf.editor.tree = new HqsoftTreeComponent();
function HqsoftTreeComponent(){
	var treeMap = new HashMap();
	//当前活动的对象
	var activeInstance = null;
	//回调函数
	var callback = null;

	/**
	 * 初始化
	 */
	function init(){

	}

	/**
	 * Loading 事件
	 */
	var loading = {
		show : function(){
			//先将IFRAME的高度设置为0
			//加载缓冲DIV
			if(activeInstance == null) return;
			activeInstance.body.loading.style.filter = "alpha(Opacity=100)";
			activeInstance.body.loading.style.display = "block";
		},
		hidden : function(){
			//当页面加载完成，动态隐藏缓冲DIV
			//重新设置IFRAME的高度
			if(activeInstance == null) return;
			var hiddenInterval = null;
			var alpha = 100;
			hiddenInterval = window.setInterval(function(){
				if(alpha <= 0){
					window.clearInterval(hiddenInterval);
					activeInstance.body.loading.style.display = "none";
					//目标页面对象
					activeInstance.body.iframe.style.height = "250px";
					return;
				}
				activeInstance.body.loading.style.filter = "alpha(Opacity=" + alpha + ")";
				alpha -= 5;
			}, 1);
		}
	};

	/**
	 * 创建一个新实例
	 * @param id
	 */
	function newInstance(id, name, btnsJsonObj){
		var component = document.createElement("div");
		component.id = id;
		with(component.style){
			display = "none";
			padding = "0px";
			position = "absolute";
			width = "300px";
			backgroundColor = "#fff";
			border = "2px solid #d1ccc7";
			margin = "2px 0px 0px -1px";
			height = "auto";
		}
		//search
		//TODO

		//body
		var bodyDiv = document.createElement("div");
		bodyDiv.className = "ts-body";
		var bodyLoadingDiv = document.createElement("div");
		bodyLoadingDiv.className = "loading";
		with(bodyLoadingDiv.style){
			filter = "alpha(opacity=100)";
			background = "#fff url(" + ctp + "/images/ajax-loader.gif) no-repeat center center";
			height = "250px";
		}
		var bodyIframeDiv = document.createElement("div");
		bodyIframeDiv.className = "iframe";
		bodyDiv.appendChild(bodyLoadingDiv);
		bodyDiv.appendChild(bodyIframeDiv);
		var iframe = document.createElement("iframe");
		iframe.frameBorder = 0;
		iframe.style.height = "0px";
		//获取目标页面对象，事件监听判断是否加载完成
		if(iframe.attachEvent){
			iframe.attachEvent("onload", function(){
				loading.hidden();
			});
		}else{
			iframe.onload = function(){
				loading.hidden();
			};
		}
		bodyIframeDiv.appendChild(iframe);

		//btns
		var btnsDl = document.createElement("dl");
		with(btnsDl.style){
			margin = "0px 0px 0px 0px";
			float = "right";
			//border = "2px solid #d8dfeb";
			backgroundColor = "#d1ccc7";
			fontSize = "9pt";
		}
		if(btnsJsonObj == null){
			btnsJsonObj = {all:name};
		}
		for(var key in btnsJsonObj){
			var item = document.createElement("dd");
			with(item.style){
				float = "left";
				padding = "2px 5px";
				margin = "0px";
			}
			item.className = key;
			item.innerHTML = "<span>" + btnsJsonObj[key] + "</span>";
			btnsDl.appendChild(item);
		}
		component.appendChild(bodyDiv);
		component.appendChild(btnsDl);
		return {"id":id, "component":component, "body":{"loading":bodyLoadingDiv, "iframe":iframe}, "btn":btnsDl};
	}

	/**
	 * 隐藏
	 */
	function hidden(componentObj){
		componentObj = componentObj == null ? activeInstance : componentObj;
		if(componentObj == null) return;
		componentObj.component.style.display = "none";
	}

	/**
	 * 选择
	 */
	this.select = function(params){
		if(callback == null) return;
		callback(params);
		hidden();
	};

	/**
	 * 显示
	 */
	this.display = function(eventObj,treeName,dataSourceUrl,__callback){
		callback = __callback;
		if(activeInstance != null){
			hidden(activeInstance);
		}
		var id = eventObj.id || eventObj.name || "__tree_selector_" + Math.random();
		var instance = treeMap.get(id);
		if(instance == null) {
			instance = newInstance(id, treeName);
			instance.body.iframe.src = dataSourceUrl;
		}
		instance.component.style.display = "block";
		activeInstance = instance;
		treeMap.put(id, instance);
		eventObj.parentNode.insertBefore(instance.component,eventObj.nextSibling);
	};

	function bodyEvent(){
		if(activeInstance == null) return;
		var activeEle = document.activeElement;
		if(activeEle == null) return;
		if(activeEle.id == activeInstance.id) return;
		hidden();
	}

	jaf.addOnLoadListener(function(){
		if (window.addEventListener){
			document.addEventListener("click",bodyEvent,false);
		}else{
			document.attachEvent("onclick",bodyEvent);
		}
	});
}