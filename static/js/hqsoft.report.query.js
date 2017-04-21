var Q = new function(){
	var params = [];
	var queried = null;
	var summaried = null;
	var orders = null;
	var fields = null;
	var ordered = null;
	var isSimpleQuery = true;
	var advQueryBox = null;
	var controller = null;
	var report = null;
	var publicPreceptMgr = false;
	
	var advQueryContextHTMLTemplate = null;
	var advQueryPanelCreator = new AdvQueryPanelCreator();

	this.init = function(__queries, __queried, __orders, __ordered, __summaried, __report, __publicPreceptMgr){
		$("#search-box").addClass(__queries.model);
		isSimpleQuery= __queries.model == "simple" ? true : false;
		orders = __orders;
		ordered = __ordered;
		report = __report;
		summaried = __summaried;
		publicPreceptMgr = __publicPreceptMgr;
		__queries = __queries.data;
		for(var i=0;i<__queries.length;i++){
			var groupName = __queries[i].group;
			if(groupName != null && groupName != "") continue;
			params.push(__queries[i]);
		}
		
		queried = __queried;
		
		//简单查询
		var simpleQueryContainer = $("#search-box").find("form")[0];

		if(isSimpleQuery){
			simpleQueryContainer.appendChild(new CreateSimpleQueryItem(0), false);
		}else{
			simpleQueryContainer.appendChild(new CreateGeneralQueryItems());
		}
		
		var simpleQueryBtnContainer = document.createElement("div");
		simpleQueryContainer.appendChild(simpleQueryBtnContainer);
		simpleQueryBtnContainer.className = "buttons";
		simpleQueryBtnContainer.innerHTML = "<button type=\"submit\" class=\"btn btn-purple\"><i class=\"fa fa-search\"></i> " + lang["query"] + "</button>";
		
		var advQueryContainer = document.getElementById("query-box");
		if(advQueryContainer != null){
			advQueryContextHTMLTemplate = advQueryContainer.innerHTML;
			simpleQueryBtnContainer.innerHTML += "<button type=\"button\" class=\"btn btn-default\">高级查询 ...</button>";
			simpleQueryBtnContainer.childNodes[1].onclick = function(){advQueryPanelCreator.open();};
		}
	};

	this.queried = function(){
		if(queried == null || !isArray(queried)) return "";
        var result = "";
        for(var i=0;i<queried.length;i++){
            result += "&query[" + i + "].name=" + queried[i].name;
            result += "&query[" + i + "].condition=" + queried[i].condition;
            result += "&query[" + i + "].clazz=" + queried[i].clazz;
            var values = queried[i].value;
            for(var j=0;j<values.length;j++){
                result += "&query[" + i + "].value=" + values[j];
            }
        }
        return result.substring(1, result.length);
	};

	this.ordered = function(){
        if(ordered == null ) return "";
        var result = "";
        var index = 0;
        for (var prop in ordered) {
            result += "&order[" + index + "].name=" + prop;
            result += "&order[" + index + "].sorting=" + ordered[prop];
            index ++;
        }
        return result.substring(1, result.length);
	};

	this.initFields = function(_fields){
		fields = _fields;
	};

	function close(){
		advQueryBox.style.display = "none";
	}
	
	function getInitValue(itemIndex, key, index){
		// 修改函数定义，同时支持按索引查询和按name查询，若itemIndex为数字则表示按索引查询(liming修改)
		try {
			var value = null, temp = null;
			var valueKey = itemIndex;
            var itemIndex2=itemIndex;
			itemIndex = parseInt(itemIndex);
			if(isNaN(itemIndex)) { // 按name查询
				for(var idx = 0; idx < queried.length; ++idx) {
					temp = queried[idx];
					if(valueKey === temp["name"]) {
						value = temp[key];
						break;
					}
				}
			} else { // 按index查询
				value = queried[itemIndex][key];
			}

            //对高级查询做特殊处理 start  bug#3586
            if(value == null){
                value =queried[itemIndex2][key];
            }
            //对高级查询做特殊处理 end

			if(index != null){
				if(jaf.isArray(value)) {
					return value[index];
				}
			}
			return value;
		}catch(e){
			return null;
		}
	}
	
	function NavBarCreator(){
		var lastActionItem = null;
		var bar = null;
		
		this.create = function(){
			bar = document.createElement("ul");
			bar.className = "nav-bar";
			/*
            var closeButton = document.createElement("li");
            closeButton.className = "close";
            closeButton.onclick = function(){
               close();
            };
            bar.appendChild(closeButton);
			*/
			return bar;
		};
		
		this.selection = function(currActionItem){
			var panels = currActionItem.parentNode.parentNode.children[1].children;
			if(lastActionItem != null){
				lastActionItem.className = "";
				showPanel(false, lastActionItem);
			}
			currActionItem.className = "selection";
			lastActionItem = currActionItem;
			showPanel(true, currActionItem);
			
			function showPanel(val, item){
				var id = item.id.replace("item", "panel");
				panels[id].style.display = val ? "block" : "none";
			}
		};
	}
	
	/**
	 * 排序
	 */
	function OrderPanelCreator(__source, __ordered){
		var __orders = [];
		this.create = function(){
			if(__orders == null) return null;
			__orders = __source;
			orderliness();
			return {panel: createPanel(), item : createNavItem()};
		};

		function orderliness(){
			if(__ordered == null) return;
			//从小到大排序
			__orders.sort(function(a,b){
					var obj1 = __ordered[a.field];
					var obj2 = __ordered[b.field];
					if(obj1==null||obj2==null) return -1;
					return obj1.orderliness > obj2.orderliness? 1 : -1;
				}
			);
		}
		
		function createNavItem(){
			var li = document.createElement("li");
			li.innerText = "排序";
			li.id = "order-item";
			return li;
		}
		
		function createPanel(){
			var li = document.createElement("li");
			li.id = "order-panel";
			for(var i=0;i<__orders.length;i++){
				var ul = document.createElement("ul");
				var __li = document.createElement("li");
				__li.className = "name-no-selector";
				var hiddenInput = document.createElement("input");
				hiddenInput.name = "order[" + i + "].name";
				hiddenInput.type = "hidden";
				hiddenInput.value = orders[i].field;
				__li.appendChild(hiddenInput);
				var div = document.createElement("div");
				div.innerHTML = orders[i].name;
				div.title = orders[i].name;
				__li.appendChild(div);
				ul.appendChild(__li);
				
				__li = document.createElement("li");
				__li.className = "condition";
				var selector = document.createElement("select");
				selector.name = "order[" + i + "].sorting";
				var orderOptions = {"":"-----无-----", "asc":"升序", "desc":"降序"};
				for(var key in orderOptions){
					var option = new Option(orderOptions[key], key);
					selector.options.add(option);
					if(option.value == getValue(orderOptions[i])){
						option.selected = true;
					}
				}
				__li.appendChild(selector);
				ul.appendChild(__li);

				__li = document.createElement("li");
				__li.className = "orderliness";
				var upButton = document.createElement("i");
				upButton.className = "fa fa-arrow-up";
				upButton.onclick = function(){
					doSwitchOrderliness(true, this);
				};
				__li.appendChild(upButton);
				var downButton = document.createElement("i");
				downButton.className = "fa fa-arrow-down";
				downButton.onclick = function(){
					doSwitchOrderliness(false, this);
				};
				__li.appendChild(downButton);

				ul.appendChild(__li);
				li.appendChild(ul);
			}
			return li;
		}

		function doSwitchOrderliness(up, eventObj){
			var panel = eventObj.parentNode.parentNode;//ul
			var target = up ? panel.previousSibling : panel.nextSibling;
			if(target == null) return;
			if(up){
				panel.parentNode.insertBefore(panel, target);
			}else{
				panel.parentNode.insertBefore(target, panel);
			}
		}
		
		function getValue(orderParam){
			try{
				return __ordered[orderParam.field].order;
			}catch(e){
				return "";
			}
		}
	}
	
	/**
	 * 查询
	 */
	function QueryPanelCreator(){
		this.create = function(){
			if(params == null) return null;
			return {panel: createPanel(), item : createNavItem()};
		};
		
		function createNavItem(){
			var li = document.createElement("li");
			li.innerText = "查询";
			li.id = "query-item";
			return li;
		}
		
		function createPanel(){
			var li = document.createElement("li");
			li.id = "query-panel";
			for(var i=0;i<params.length;i++){
				if(params[i].adv == null || !params[i].adv) continue;
				li.appendChild(new CreateSimpleQueryItem(i, true));
			}
			return li;
		}
	}

	/**
	 * 快速定位
	 */
	function ItemFinder(){
		var findTimes = 0;
		var lastFindValue = "";
		this.create = function(){
			var li = document.createElement("li");
			li.className = "item-finder";
			var input = document.createElement("input");
			input.type = "text";
			var button = document.createElement("button");
			button.className = "btn btn-blue btn-xs";
			button.type = "button";
			//<button class="btn btn-purple"> Button <i class="fa fa-arrow-circle-right"></i></button>
			button.innerHTML = "快速定位 <i class=\"fa fa-arrow-circle-right\"></i>";
			button.onclick = function(){
				var value = input.value;
				value = value.replace(/\s+/,"");
				if(value == "") return;
				if(lastFindValue != value){
					findTimes = 0;
				}
				scroll(value);
				findTimes ++;
				lastFindValue = value;
			};
			li.appendChild(input);
			li.appendChild(button);
			return li;
		};

		var lastFindLabel = null;
		function color(target, key){
			if(lastFindLabel != null) {
				lastFindLabel.innerHTML = lastFindLabel.innerText;
			}

			var html = target.innerText;
			html = html.replace(key, "<span style=\"background-color:darkorange\">" + key + "</span>");
			target.innerHTML = html;

			lastFindLabel = target;
		}
		function scroll(name){
			var items = advQueryBox.children[0].children[1].children[1].children;
			var target = null;
			for(var i=1;i<items.length;i++){
				if(items[i].style.display == "block"){
					target = items[i];
					break;
				}
			}
			if(target == null) return;
			items = target.getElementsByTagName("ul");
			var finded = 0;
			target = null;
			for(var i=0;i<items.length;i++){
				var labelObj = items[i].children[0].children[1];
				var label = labelObj.title;
				var patn = eval("/" + name + "/");
				if(!patn.test(label)) continue;
				if(finded >= findTimes){
					target = items[i];
					color(labelObj, name);
					break;
				}
				finded ++;
			}

			if(target == null) {
				findTimes = 0;
				return;
			}

			var container = $(target.parentNode);
			container.animate({scrollTop: $(target).offset().top - container.offset().top + container.scrollTop()}, 100);
		}
	}

	/**
	 * 高级查询
	 */
	function AdvQueryPanelCreator() {

        var initialized = false;

		this.open = function(){
			init();
			var display = advQueryBox.style.display;
			if(display == "block"){
				close();
				// bug#2538更正，当查询条件很多，报表行数很少时，高级查询界面的操作按钮就会不见
				resetIFrameHeight();
				return;
			}

			advQueryBox.style.display = "block";
			controller = new Controller(report);
			controller.getData();
			// bug#2538更正，当查询条件很多，报表行数很少时，高级查询界面的操作按钮就会不见
			resetIFrameHeight();
		};

		function resetIFrameHeight() {
			try {
				var frame = parent.document.getElementsByName(window.name)[0];
				frame.style.height = document.body.scrollHeight + "px";
			} catch(error) {
				console.log(error);
			}
		}

        function init() {
            if(initialized) return;

            //高级查询
            advQueryBox = document.getElementById("query-box");

            var advQueryForm = advQueryBox.getElementsByTagName("form")[0];

			var advQuerySchemesBox = document.createElement("div");
			advQuerySchemesBox.className = "scheme-box";
			advQuerySchemesBox.innerHTML = "<ul class=\"schemes collapse-panel\"></ul><div class=\"loading\"></div>";
			advQueryForm.appendChild(advQuerySchemesBox);

            var advQueryPanel = document.createElement("div");
            advQueryPanel.className = "panel";
            advQueryForm.appendChild(advQueryPanel);

            var navBarCreator = new NavBarCreator();
            var navBar = navBarCreator.create();
			advQueryPanel.appendChild(navBar);
            //advQueryBox.insertBefore(navBar, advQueryForm);

			var advQueryPanelUL = document.createElement("ul");
			advQueryPanelUL.className = "panel-items";
			advQueryPanel.appendChild(advQueryPanelUL);

			var finder = new ItemFinder();
			advQueryPanelUL.appendChild(finder.create());

            var queryPanelCreator = new QueryPanelCreator();
            var queryPanel = queryPanelCreator.create();
            if (queryPanel != null) {
                var item = queryPanel.item;
                var panel = queryPanel.panel;
                item.onclick = function () {
                    navBarCreator.selection(this);
                };
                navBar.appendChild(item);
				advQueryPanelUL.appendChild(panel);

                navBarCreator.selection(item);
            }

            var orderPanelCreator = new OrderPanelCreator(orders, ordered);
            var orderPanel = orderPanelCreator.create();
            if (orderPanel != null) {
                var item = orderPanel.item;
                var panel = orderPanel.panel;
                item.onclick = function () {
                    navBarCreator.selection(this);
                };
                navBar.appendChild(item);
				advQueryPanelUL.appendChild(panel);
            }

			var summaryPanelCreator = new SummaryPanelCreator();
			var summaryPanel = summaryPanelCreator.create();
			if(summaryPanel != null) {
				var item = summaryPanel.item;
				var panel = summaryPanel.panel;
				item.onclick = function () {
					navBarCreator.selection(this);
				};
				navBar.appendChild(item);
				advQueryPanelUL.appendChild(panel);
			}

            var advQueryBtnPanel = document.createElement("li");
            advQueryBtnPanel.className = "btns";
            advQueryBtnPanel.innerHTML = "" +
				"<div class=\"msg\"><div>保存成功</div></div>" +
                "<div class=\"save-as\"><div><input type=\"text\" /><label class=\"public-" + publicPreceptMgr + "\"><input type=\"checkbox\"/> 公有的</label><input type=\"button\" value=\"确定\" class=\"red\" /></div></div>" +
                "<div class=\"left\"><input type=\"button\" value=\"保存方案\" class=\"red\" disabled=\"disabled\" /> <input type=\"button\" value=\"另存为 ...\" class=\"green\" /></div>" +
                "<div class=\"right\"><input type=\"submit\" value=\"  查询  \" class=\"blue\" /> <input type=\"button\" value=\"  关闭  \" /></div>";
			advQueryForm.appendChild(advQueryBtnPanel);

            var btnPanelChild = advQueryBtnPanel.childNodes;
            var saveBtn = btnPanelChild[2].children[0];
            var saveAsBtn = btnPanelChild[2].children[1];
            var saveAsPanel = btnPanelChild[1];
            var submitBtn = saveAsPanel.childNodes[0].childNodes[2];
            var schemeNameText = saveAsPanel.childNodes[0].childNodes[0];
            var closeBtn = btnPanelChild[3].children[1];
            saveAsBtn.onclick = function () {
                var display = saveAsPanel.style.display;
                saveAsPanel.style.display = (display == "none" || display == "") ? "block" : "none";
            };
            saveBtn.onclick = function () {
                controller.save(this);
            };
            submitBtn.onclick = function () {
				var isPublic = saveAsPanel.childNodes[0].childNodes[1].childNodes[0].checked;
                controller.saveAs(schemeNameText.value, isPublic, this);
            };
            closeBtn.onclick = function () {
                close();
            };

            initialized = true;
        }
	}

	/**
	 * 汇总
     */
	function SummaryPanelCreator(){
		this.create = function(){
			if(fields == null || fields.length <= 0) return null;
			return {panel: createPanel(), item : createNavItem()};
		};

		function createNavItem(){
			var li = document.createElement("li");
			li.innerText = "汇总";
			li.id = "summary-item";
			return li;
		}

		function createPanel(){
			var li = document.createElement("li");
			li.id = "summary-panel";
			for(var i=0;i<fields.length;i++){
				var _ul = $("<ul></ul>");
				var selected = false;
				if(summaried != null && summaried.length > 0){
					for(var j=0;j<summaried.length;j++){
						if(fields[i].id == summaried[j]){
							selected = true;
							break;
						}
					}
				}

				$("<li class='name-no-selector'><input type='hidden' name='summary[" + i + "].name' value='" + fields[i].id + "'/><div title='" + fields[i].name + "'>" + fields[i].name + "</div></li>").appendTo(_ul);
				$("<li class='condition'><label><input type='checkbox' name='summary[" + i + "].group' value='true' " + (selected ? "checked" : "") + "/> 分组</label></li>").appendTo(_ul);
				$("<li class='value'></li>").appendTo(_ul);

				li.appendChild(_ul[0]);
			}
			return li;
		}
	}
	
	//核心控制器
	function Controller(report){
		var precept_id = null;
		var precept_name = null;
		
		function encode(){
			var childs = advQueryBox.children;
			//query
			var ulItems = childs[0].children[1].children[1].children[1].children;
			var queryStr = "{";
			for(var i=0;i<ulItems.length;i++){
				var ulItem = ulItems[i];
				var lis = ulItem.children;
				var nameInputObj = lis[0].children[0];
				var name = nameInputObj.value;
				if(nameInputObj.tagName == "SELECT-ONE"){
					name = nameInputObj.options[nameInputObj.selectedIndex].value;
				}else{
					name = nameInputObj.value;
				}
				var conditionInputObj = lis[1].children[0];
				var condition = conditionInputObj.options[conditionInputObj.selectedIndex].value;
				var clazz = lis[2].children[0].value;
				var value1 = lis[3].children[0].children[0].children[0].value;
				var value2 = null;
				var value = null;
				try{
					value2 = lis[3].children[1].children[0].children[0].value;
					value = "[" + value1 + "," + value2 + "]";
				}catch(e){
					value = "'" + value1 + "'";
				}
				queryStr += "" + name + ":{'name':'" + name + "','condition':'" + condition + "','clazz':'" + clazz + "','value':" + value + "}";
				if(i < ulItems.length - 1){
					queryStr += ",";
				}
			}
			queryStr += "}";
			
			//orders
			ulItems = childs[0].children[1].children[1].children[2].children;
			var orderStr = "{";
            if(orders != null) {
                for (var i = 0; i < ulItems.length; i++) {
                    var ulItem = ulItems[i];
                    var lis = ulItem.children;
                    var nameInputObj = lis[0].children[0];
                    var name = nameInputObj.value;
                    if (nameInputObj.tagName == "SELECT-ONE") {
                        name = nameInputObj.options[nameInputObj.selectedIndex].value;
                    } else {
                        name = nameInputObj.value;
                    }
                    var conditionInputObj = lis[1].children[0];
                    var condition = conditionInputObj.options[conditionInputObj.selectedIndex].value;
                    orderStr += "" + name + ":{'order':'" + condition + "', 'orderliness':" + i + "}";
                    if (i < ulItems.length - 1) {
                        orderStr += ",";
                    }
                }
            }
			orderStr += "}";
			return "{\"query\":" + queryStr + ", \"order\": " + orderStr + "}";
		}
		
		function popMsg(msg){
			var msgPanel = advQueryBox.children[0].children[2].children[0];
			msgPanel.children[0].innerHTML = msg;
			msgPanel.style.display = "block";
			window.setTimeout(function(){
				msgPanel.style.display = "none";
			}, 2000);
		}
		
		this.selection = function(eventObj){
            var panelElements = advQueryBox.children[0].children[1].children[1].children;
			var queryElementsPanel = panelElements[1];
            var btnElementsPanel = advQueryBox.children[0].children[2];
			var saveBtn = btnElementsPanel.children[2].children[0];
			var precept = eventObj.parentNode.id.replace("precept_","");
			$.post(ctx + "/report/report-customization!getQueries.jhtml", {"queryPrecept.id":precept},
				function (data){
					process(data);
				}, "json");
			
			function process(data){
				precept_id = data.id;
				precept_name = data.name;
				saveBtn.disabled = !data.own;
				if(data.context == null) return;
				queryElementsPanel.innerHTML = "";
				queried = data.context.query;
				ordered = data.context.order;
				for(var i=0;i<params.length;i++){
					queryElementsPanel.appendChild(new CreateSimpleQueryItem(i, true));
				}
				
				var orderPanelCreator = new OrderPanelCreator(orders,ordered);
				var oldOrderElementsPanel = advQueryBox.children[0].children[1].children[1].children[2];
				var newOrderElementsPanel = orderPanelCreator.create().panel;
				newOrderElementsPanel.style.display = oldOrderElementsPanel.style.display;
				newOrderElementsPanel.className = oldOrderElementsPanel.className;
				oldOrderElementsPanel.parentNode.replaceChild(newOrderElementsPanel, oldOrderElementsPanel);
			}
		};
		
		this.del = function(eventObj){
			var precept = eventObj.parentNode.id.replace("precept_","");
			var deleteNode = eventObj.parentNode;
			var nodePanel = deleteNode.parentNode;
			if(precept == precept_id){
				var saveBtn = advQueryBox.children[0].children[2].children[2].children[0];
				saveBtn.disabled = true;
			}
			$.post(ctx + "/report/report-customization!delQueryPrecept.jhtml", {"queryPrecept.id":precept},
					function (data, textStatus){
						nodePanel.removeChild(deleteNode);
					}, "json");
		};
		
		this.save = function(eventObj){
			eventObj.disabled = true;
			var param = {"queryPrecept.report.id":report, "queryPrecept.id":precept_id, "queryPrecept.name":precept_name, "queryPrecept.context":encode()};
			$.post(ctx + "/report/report-customization!saveQueryPrecept.jhtml", param,
					function (data, textStatus){
						GetData();
						popMsg(data.result ? "操作成功！" : "失败：" + data.msg);
						window.setTimeout(function(){
							eventObj.disabled = false;
						}, 2000);
					}, "json");
		};
		
		this.saveAs = function(name, isPublic, eventObj){
			var saveAsPanel = eventObj.parentNode.parentNode;
			var submitBtn = saveAsPanel.children[0].children[1];
			submitBtn.disabled = true;
			var saveBtn = saveAsPanel.parentNode.children[2];
			saveBtn.disabled = true;
			var param = {"queryPrecept.report.id":report, "queryPrecept.name":name, "queryPrecept.isInner":isPublic, "queryPrecept.context":encode()};
			$.post(ctx + "/report/report-customization!saveQueryPrecept.jhtml", param,
					function (data){
						GetData();
						submitBtn.disabled = false;
						saveAsPanel.style.display = "none";
						popMsg(data.result ? "操作成功！" : "失败：" + data.msg);
						window.setTimeout(function(){
							saveBtn.disabled = false;
						}, 2000);
					}, "json");
		};
		
		function GetData(){
			var childs = advQueryBox.children;
			var loading = childs[0].children[0].children[1];
			var schemesUL = childs[0].children[0].children[0];
			schemesUL.style.display = "none";
			schemesUL.innerHTML = "";
			loading.style.display = "block";
			
			$.post(ctx + "/report/report-customization!getQueryPrecepts.jhtml", {"report.id":report}, function (data){process(data);}, "json");
			
			var lastSelectionObj = null;
			function process(data){
				if(data == null || isEmptyObject(data)) {
					var li = document.createElement("li");
					li.innerHTML = "无";
					li.className = "default";
					schemesUL.appendChild(li);
					loading.style.display = "none";
					schemesUL.style.display = "block";
					return;
				}

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
						var li = document.createElement("li");
						li.id = "precept_" + array[i].id;

						if(array[i].own) {
							var delHref = document.createElement("a");
							delHref.innerHTML = "删除";
							delHref.className = "del";
							delHref.href = "javascript:;";
							delHref.onclick = function () {
								controller.del(this);
							};
							li.appendChild(delHref);
						}

						var nameHref = document.createElement("a");
						nameHref.innerHTML = (i + 1) + "." + array[i].name;
						nameHref.href = "javascript:;";
						nameHref.title = array[i].name;
						nameHref.onclick = function () {
							controller.selection(this);
							if (lastSelectionObj != null) {
								lastSelectionObj.className = "";
							}
							lastSelectionObj = this.parentNode;
							lastSelectionObj.className = "hover";
						};
						li.appendChild(nameHref);
						folder.appendChild(li);
					}

					item.appendChild(folder);
					schemesUL.appendChild(item);
				}
				
				loading.style.display = "none";
				schemesUL.style.display = "block";
			}
		}
		this.getData = GetData;
	}
	
	//创建自定义查询选项	
	function CreateSimpleQueryItem(itemIndex, noFieldSelector){
		//创建查询项目隐藏域
		function getFieldHiddenInput(queryObj, itemsIndex){
			var hiddenInput = document.createElement("input");
			hiddenInput.type = "hidden";
			hiddenInput.name = "query[" + itemsIndex + "].name";
			hiddenInput.itemIndex = itemsIndex;
			hiddenInput.value = queryObj.field;
			return hiddenInput;
		}

		//创建查询项目下拉列表
		function getFieldSelector(queryObjs, itemsIndex, initValue){
			var optionIndex = 0;
			var selector = document.createElement("select");
			selector.name = "query[" + itemsIndex + "].name";
			selector.itemIndex = itemsIndex;
			for(var i=0;i<queryObjs.length;i++){
				var groupName = queryObjs[i].group;
				if(groupName != null && groupName != ""){
					var optgroup = document.createElement("OPTGROUP");
					optgroup.label = groupName;
					selector.appendChild(optgroup);
					continue;
				}
				var isAdvQuery = queryObjs[i].adv;
				isAdvQuery = isAdvQuery == null ? false : isAdvQuery;
				if(!isAdvQuery) continue;
				var option = new Option(queryObjs[i].name, queryObjs[i].field);
				option.id = queryObjs[i].field;
				selector.options.add(option);
				if(option.value == initValue){
					selector.options[optionIndex].selected = true;
				}
				optionIndex ++;
			}
			
			selector.onchange = function(){
				//改变Clazz的值
				var panel = this.parentNode.parentNode;
				var __items = panel.getElementsByTagName("li");
				var clazzHiddenInput = __items[2].childNodes[0];
				var fieldIndex = this.options.selectedIndex;
				clazzHiddenInput.value = params[fieldIndex].clazz;
				//改变对比条件项目
				var conditionLiObj = __items[1];
				var conditions = params[fieldIndex].condition;
				conditionLiObj.removeChild(conditionLiObj.childNodes[0]);
				// 为条件选择器赋初始值(liming修改)
				var conditionSelector = getConditionSelector(conditions, this.itemIndex, getInitValue(params[fieldIndex].field, "condition"));
				conditionLiObj.appendChild(conditionSelector);
				//改变输入条件项目
				var fieldValueLiObj = __items[3];
				panel.removeChild(fieldValueLiObj);
				panel.appendChild(getFieldValueInputLi(params[fieldIndex], this.itemIndex, conditionSelector.value, -1));
			};
			return selector;
		}
		
		//创建对比条件下拉列表
		function getConditionSelector(conditions, itemsIndex, initValue){
			var selector = document.createElement("select");
			selector.name = "query[" + itemsIndex + "].condition";
			
			var i = 0;
			for (var key in conditions) {
				var option = new Option(conditions[key], key);
				selector.options[i] = option;
				if(option.value == initValue){
					selector.options[i].selected = true;
				}
				i++;
			}
			
			selector.onchange = function(){
				var panel = this.parentNode.parentNode;
				var __items = panel.getElementsByTagName("li");
				//改变输入条件项目
				var fieldValueLiObj = __items[3];
				var fieldInputObj = __items[0].childNodes[0];
				var fieldSelectedIndex = 0;
				if(fieldInputObj.tagName == "SELECT-ONE" || fieldInputObj.tagName == "SELECT"){
					fieldSelectedIndex = fieldInputObj.options.selectedIndex;
				}else{
					fieldSelectedIndex = fieldInputObj.itemIndex;
				}
				
				panel.removeChild(fieldValueLiObj);
				panel.appendChild(getFieldValueInputLi(params[fieldSelectedIndex], itemsIndex, this.value));
			};
			return selector;
		}
		
		//创建字段类型
		function getFieldTypeHiddenInput(itemsIndex, queryIndex){
			queryIndex = (queryIndex == null || queryIndex == "") ? 0 : queryIndex;
			var clazzInputHidden = document.createElement("input");
			clazzInputHidden.type = "hidden";
			clazzInputHidden.name = "query[" + itemsIndex + "].clazz";
			clazzInputHidden.value = params[queryIndex].clazz;
			return clazzInputHidden;
		}
		
		var fieldIndex = 0;
		var ul = document.createElement("ul");
		var li = document.createElement("li");
		li.className = "name";
		if(noFieldSelector){
			var fieldInputObj = getFieldHiddenInput(params[itemIndex], itemIndex);
			var text = document.createElement("div");
			text.title = params[itemIndex].name;
			text.innerHTML = params[itemIndex].name;
			li.appendChild(fieldInputObj);
			li.appendChild(text);
			li.className = "name-no-selector";
			fieldIndex = itemIndex;
		}else{
			var fieldInputObj = getFieldSelector(params, itemIndex, getInitValue(itemIndex, "name"));
			li.appendChild(fieldInputObj);
			fieldIndex = fieldInputObj.options.selectedIndex;
		}
		ul.appendChild(li);

		// valueKey统一改为字段名(liming 修改)
		var valueKey = params[fieldIndex].field;

		li = document.createElement("li");
		li.className = "condition";
		var conditionSelector = getConditionSelector(params[fieldIndex].condition, itemIndex, getInitValue(valueKey, "condition"));
		li.appendChild(conditionSelector);
		ul.appendChild(li);
		
		li = document.createElement("li");
		li.className = "clazz";
		var clazzHiddenInput = getFieldTypeHiddenInput(itemIndex, fieldIndex);
		li.appendChild(clazzHiddenInput);
		ul.appendChild(li);
		
		var currCondition = conditionSelector.value;
		ul.appendChild(getFieldValueInputLi(params[fieldIndex], itemIndex, currCondition, valueKey));
		
		return ul;
	}
		
	//创建简单查询选项
	function CreateGeneralQueryItems(){
		//创建查询项目
		function getFieldHiddenInput(queryObj, itemsIndex, initValue){
			var hiddenInput = document.createElement("input");
			hiddenInput.name = "query[" + itemsIndex + "].name";
			hiddenInput.itemIndex = itemsIndex;
			hiddenInput.type = "hidden";
			hiddenInput.value = queryObj.field;
			var span = document.createElement("span");
			span.innerHTML = queryObj.name;
			span.appendChild(hiddenInput);
			return span;
		}
		
		//创建字段类型
		function getFieldTypeHiddenInput(queryObj, itemsIndex){
			var clazzInputHidden = document.createElement("input");
			clazzInputHidden.type = "hidden";
			clazzInputHidden.name = "query[" + itemsIndex + "].clazz";
			clazzInputHidden.value = queryObj.clazz;
			return clazzInputHidden;
		}
		
		var div = document.createElement("div");
		var itemIndex = 0;
		for(var i=0;i<params.length;i++){
			if(params[i].simple == null || !params[i].simple) continue;
			var ul = document.createElement("ul");
			var li = document.createElement("li");
			li.className = "name";
			var fieldSelector = getFieldHiddenInput(params[i], itemIndex);
			li.appendChild(fieldSelector);
			ul.appendChild(li);
			
			li = document.createElement("li");
			li.className = "clazz";
			var clazzHiddenInput = getFieldTypeHiddenInput(params[i], itemIndex);
			li.appendChild(clazzHiddenInput);
			var condition = "=";
			for (var key in params[i].condition) {
				condition = key;
				break;
			}
			var conditionInputHidden = document.createElement("input");
			conditionInputHidden.type = "hidden";
			conditionInputHidden.name = "query[" + itemIndex + "].condition";
			conditionInputHidden.value = condition;
			li.appendChild(conditionInputHidden);
			ul.appendChild(li);
			ul.appendChild(getFieldValueInputLi(params[i], itemIndex, condition));
			div.appendChild(ul);
			itemIndex ++;
		}
		return div;
	}
	
	function getFieldValueInputLi(queryObj, itemsIndex, condition){
		// valueKey统一用字段名(liming修改)
		var valueKey = queryObj.field;
		var li = document.createElement("li");
		if(condition == "between"){
			li.className = "value value2";
			var input1 = getFieldValueInput(queryObj, itemsIndex, getInitValue(valueKey, "value", 0));
			input1.className = "value1 composite";
			li.appendChild(input1);
			var flag = document.createElement("div");
			flag.className = "split";
			flag.innerHTML = "-";
			li.appendChild(flag);
			var input2 = getFieldValueInput(queryObj, itemsIndex, getInitValue(valueKey, "value", 1));
			input2.className = "value2 composite";
			li.appendChild(input2);
		}else{
			li.className = "value";
			li.appendChild(getFieldValueInput(queryObj, itemsIndex, getInitValue(valueKey, "value", 0)));
		}
		return li;
	}
	
	//查询字段值控件
	function getFieldValueInput(queryObj, itemsIndex, initValue){
		var border = document.createElement("div");
		border.className = "composite";
		if(queryObj.input == "Select"){
			var selector = document.createElement("select");
			selector.name = "query[" + itemsIndex + "].value";
			var list = queryObj.list == null ? [] : queryObj.list;
			var emptyOption = new Option("-----无-----", "");
			selector.options.add(emptyOption);
			for(var i=0;i<list.length;i++){
				var option = new Option(list[i].key, list[i].value);
				selector.options.add(option);
				if(option.value == initValue){
					option.selected = true;
				}
			}
			border.appendChild(selector);
		}else{
			var span = document.createElement("span");
			span.className = "input";
			var valueInput = document.createElement("input");
			valueInput.name = "query[" + itemsIndex + "].value";
			valueInput.type = "text";
			valueInput.id = queryObj.field;
			initValue = (initValue == null || initValue == "") ? "" : initValue;
			valueInput.value = initValue;
			if(queryObj.clazz == "Number"){
				valueInput.onkeyup = function(){
					this.value = this.value.replace(/[^\d+\.+]/g,"");
				};
				valueInput.onblur = function(){
					if(isNaN(this.value)) this.value = "";
				};
			}
			span.appendChild(valueInput);
			border.appendChild(span);
			
			if(queryObj.clazz == "Date" || queryObj.clazz == "Timer"){
				var clearIcon = document.createElement("span");
				var clearButton = document.createElement("button");
				clearButton.type = "button";
				clearButton.className = "clear-data";
				clearButton.onclick = function(){
                    jaf.editor.clear(this);
				};
				clearIcon.appendChild(clearButton);
				border.appendChild(clearIcon);
				var dateIcon = document.createElement("span");
				var dateButton = document.createElement("button");
				dateButton.type = "button";
				if(queryObj.clazz == "Date"){
                    dateButton.className = "calendar-icon";
					dateButton.onclick = function(){
                        jaf.editor.date(this);
					};
                    valueInput.onclick = function(){
                        jaf.editor.date(this);
                    };
				}
				if(queryObj.clazz == "Timer"){
                    dateButton.className = "calendar-time-icon";
                    dateButton.onclick = function(){
                        jaf.editor.time(this);
                    };
                    valueInput.onclick = function(){
                        jaf.editor.time(this);
                    };
				}
				dateIcon.appendChild(dateButton);
				border.appendChild(dateIcon);
				valueInput.readOnly = true;
			}else if(queryObj.reference != null){
				var clearIcon = document.createElement("span");
				var clearButton = document.createElement("button");
				clearButton.type = "button";
				clearButton.className = "clear-data";
				
				// 清除所选参照内容后，调用开发人员自定义的清除事件处理函数(bug#3989)
				var params = {};
				if(typeof queryObj.reference == "object"){
					params = queryObj.reference;
				}else if(typeof queryObj.reference == "string"){
					params = eval("[" + queryObj.reference + "]")[0];
				}
				var removeCallback = params.remove;
				clearButton.onclick = function(){
					try {
						var inputObj = this.parentNode.parentNode.getElementsByTagName("input")[0];
						eval(removeCallback + "(inputObj);");
					} catch (error) {
						console.log(error);
					}
					jaf.editor.clear(this);
				};
				clearIcon.appendChild(clearButton);
				border.appendChild(clearIcon);

				border.setAttribute("selected-call", params.callback);
				border.setAttribute("selection", "sign");
				border.setAttribute("remove-call", params.remove);

				delete params.selection;
				delete params.callback;
				delete params.remove;
				delete params.empty;
				delete params.search;
				delete params.selected;

				border.setAttribute("reference", JSON.stringify(params));

				var selectionIcon = document.createElement("span");
				var selectionButton = document.createElement("button");
				selectionButton.type = "button";
				selectionButton.className = "selector-icon";
				selectionButton.onclick = function(){
					var ___input = this.parentNode.parentNode.getElementsByTagName("input")[0];
                    jaf.editor.reference.call(___input);
				};
				selectionIcon.appendChild(selectionButton);
				border.appendChild(selectionIcon);
				valueInput.readOnly = true;
			}
		}
		return border;
	}
};
