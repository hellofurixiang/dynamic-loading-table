/*---------------------------------------------------------------------
 分页处理办法
 参数
 page 			当前页码
 pageCount	总页数
 param			携带参数字符
 record			记录数
 first				首记录游标
 max				最后一条记录游标
 param			查询参数
 theme			风格
 minStyle		是否最小化
 defaultPageSize	默认的分页大小
 objectsPerPage	当前分页大小
 ---------------------------------------------------------------------*/
function pagination(page, pageCount, record, first, max, param, theme, minStyle, defaultPageSize, objectsPerPage) {
	var CTX = "";
	try{
		CTX = ctp;
	}catch(e){
		CTX = "../";
	}

	minStyle = minStyle == null || minStyle == undefined ? false : minStyle;
	theme = (theme == undefined || theme == null || theme == "") ? "taobao" : theme;
	theme = minStyle ? "small" : theme;

	var paginationString = "<form name=\"pageForm\" action=\"?" + param + "\" method=\"post\" class=\"" + theme + "\">";
	
	if(theme == "taobao"){
		paginationString += taobao();
	}else if(theme == "simple"){
		paginationString += simple();
	}else if(theme == "small"){
		paginationString += small();
	}
	paginationString += "</form>";
	document.write(paginationString);
	
	function taobao(){
		var total = "(" + first + "-" + max + "/" + record + ") ";
		if(defaultPageSize > 0) {
			total += lang["page.size"];
			var n = defaultPageSize;
			var pageSize = max - first + 1;
			for (var i = 1; i <= 3; i++) {
				if(pageSize == n){
					total += "<b>" + n + "</b>";
				}else {
					total += "<a href=\"?page.p=1&page.size=" + n + "&" + param + "\">" + n + "</a>";
				}
				if (i < 3) total += ",";
				n += n;
			}
			total += " &nbsp;";
		}
		var parBtnSimpleImg = "<img src=\"" + CTX + "/images/pre_page_simple.gif\" alt=\"" + lang["page.pre"] + "\" border=\"0\" />";
		var parBtnActImg = "<img src=\"" + CTX + "/images/pre_page_simple_act.gif\" alt=\"" + lang["page.pre"] + "\" border=\"0\" />";
		var nextBtnSimpleImg = "<img src=\"" + CTX + "/images/next_page.gif\" alt=\"" + lang["page.next"] + "\" border=\"0\" />";
		var nextBtnActImg = "<img src=\"" + CTX + "/images/next_page_act.gif\" alt=\"" + lang["page.next"] + "\" border=\"0\" />";
		var submitBtnImg = "<img src=\"" + CTX + "/images/btn_ok.gif\" border=\"0\" />";
	
		var pageStr = "";
		pageStr += total;
		pageStr += lang["page.curr"] + page + "/" + pageCount + " ";
	
		// 上一页按钮
		if (page <= 1) {
			pageStr += parBtnSimpleImg + " ";
		} else {
			pageStr += "<a href=\"?page.p=" + (page - 1) + "&page.size=" + objectsPerPage + "&" + param + "\">" + parBtnActImg
					+ "</a> ";
		}
	
		// 中间部分
		for ( var i = 1; i <= pageCount; i++) {
			var href = null;
			if (i == page) {
				href = "<a href=\"?page.p=" + i + "&page.size=" + objectsPerPage + "&" + param + "\"><b>" + i + "</b></a> ";
			} else {
				href = "<a href=\"?page.p=" + i + "&page.size=" + objectsPerPage + "&" + param + "\">" + i + "</a> ";
			}
	
			if (page >= 5 && page <= (pageCount - 2)) {
				if (i <= 2) {
					pageStr += href;
				} else if (i > (pageCount - 2)) {
					pageStr += href;
				} else {
					if (i == (page - 2)) {
						pageStr += "... ";
					}
					if (i >= (page - 2) && i <= (page + 2)) {
						pageStr += href;
					}
					if (i == (page + 2)) {
						pageStr += "...";
					}
				}
			} else if (page < 5) {
				if (i <= (page + 2)) {
					pageStr += href;
				} else if (i > (pageCount - 2)) {
					pageStr += href;
				} else if (i == (page + 3)) {
					pageStr += "... ";
				}
			} else if (page > (pageCount - 2)) {
				if (i <= 3 || i >= (page - 2)) {
					pageStr += href;
				} else if (i == (page - 3)) {
					pageStr += "... ";
				}
			}
		}
	
		// 下一页按钮
		if (page >= pageCount) {
			pageStr += nextBtnSimpleImg;
		} else {
			pageStr += "<a href=\"?page.p=" + (page + 1) + "&page.size=" + objectsPerPage + "&" + param + "\">"
					+ nextBtnActImg + "</a>";
		}
	
		// 转跳部分
		pageStr += " <span class=\"jump\">" + lang["page.jump"] + "<input type=\"hidden\" name=\"page.size\" value=\"" + objectsPerPage + "\" /><input id=\"pageNumber\" name=\"page.p\" type=\"text\" maxlength=\"10\" onkeypress=\"jaf.text.number(this, 1, 'Integer', 2);\" onkeydown=\"jaf.text.onkeydown(this);\" onchange=\"jaf.text.fixInput(this);\"/> " + lang["page"] + " <a onclick=\"javascript:pages.check();\" style=\"cursor:hand\">" + submitBtnImg + "</a></span>";
		return pageStr;
	}
	
	function simple(){
		var total_img = "<em title=\"总数\">" + record + "</em> ";
		var parBtn_simpleImg = "<strong title=\"" + lang["page.pre"] + "\">3</strong>";
		var parBtn_actImg = "<strong title=\"" + lang["page.pre"] + "\" class=\"act\">3</strong>";
		var nextBtn_simpleImg = "<strong title=\"" + lang["page.next"] + "\">4</strong>";
		var nextBtn_actImg = "<strong title=\"" + lang["page.next"] + "\" class=\"act\">4</strong>";
		var submitBtn_img = "<span class=\"submit\">确定</span>";
	
		var pageStr = "";
		pageStr += total_img;
		pageStr += page + "/" + pageCount + " ";
	
		// 上一页按钮
		if (page <= 1) {
			pageStr += parBtn_simpleImg + " ";
		} else {
			pageStr += "<a href=\"?page.p=" + (page - 1) + "&" + param + "\">" + parBtn_actImg + "</a>";
		}
	
		// 中间部分
		for ( var i = 1; i <= pageCount; i++) {
			var href = null;
			if (i == page) {
				href = "<a href=\"?page.p=" + i + "&" + param + "\" class=\"curr\"><b>" + i + "</b></a>";
			} else {
				href = "<a href=\"?page.p=" + i + "&" + param + "\">" + i + "</a>";
			}
	
			if (page >= 5 && page <= (pageCount - 2)) {
				if (i <= 2) {
					pageStr += href;
				} else if (i > (pageCount - 2)) {
					pageStr += href;
				} else {
					if (i == (page - 2)) {
						pageStr += " ... ";
					}
					if (i >= (page - 2) && i <= (page + 2)) {
						pageStr += href;
					}
					if (i == (page + 2)) {
						pageStr += " ...";
					}
				}
			} else if (page < 5) {
				if (i <= (page + 2)) {
					pageStr += href;
				} else if (i > (pageCount - 2)) {
					pageStr += href;
				} else if (i == (page + 3)) {
					pageStr += " ... ";
				}
			} else if (page > (pageCount - 2)) {
				if (i <= 3 || i >= (page - 2)) {
					pageStr += href;
				} else if (i == (page - 3)) {
					pageStr += " ... ";
				}
			}
		}
	
		// 下一页按钮
		if (page >= pageCount) {
			pageStr += nextBtn_simpleImg;
		} else {
			pageStr += "<a href=\"?page.p=" + (page + 1) + "&" + param + "\">" + nextBtn_actImg + "</a>";
		}
	
		// 转跳部分
		pageStr += "<span class=\"jump\">转到第 <input id=\"pageNumber\" name=\"page.p\" type=\"text\" maxlength=\"10\" onkeypress=\"jaf.text.number(this, 1, 'Integer', 2);\" onkeydown=\"jaf.text.onkeydown(this);\" onchange=\"jaf.text.fixInput(this);\"/> 页 <a onclick=\"javascript:pages.check();\" style=\"cursor:hand\">" + submitBtn_img + "</a></span>";
		return pageStr;
	}

	function small(){
		var preDisableImage = "<img src=\"" + CTX + "/images/pre_page_simple.gif\" alt=\"" + lang["page.pre"] + "\" border=\"0\" />";
		var preActiveImage = "<img src=\"" + CTX + "/images/pre_page_simple_act.gif\" alt=\"" + lang["page.pre"] + "\" border=\"0\" />";
		var nextDisableImage = "<img src=\"" + CTX + "/images/next_page.gif\" alt=\"" + lang["page.next"] + "\" border=\"0\" />";
		var nextActiveImage = "<img src=\"" + CTX + "/images/next_page_act.gif\" alt=\"" + lang["page.next"] + "\" border=\"0\" />";

		var str = "";
		if (page <= 1) {
			str += preDisableImage + " ";
		} else {
			str += "<a href=\"?page.p=" + (page - 1) + "&" + param + "\">" + preActiveImage + "</a> ";
		}

		if (page >= pageCount) {
			str += nextDisableImage;
		} else {
			str += "<a href=\"?page.p=" + (page + 1) + "&" + param + "\">" + nextActiveImage + "</a>";
		}
		return str;
	}
	
	this.check = function() {
		var obj = document.getElementById("pageNumber");
		var patn = /\d/;
		if (patn.test(obj.value)) {
			pageForm.submit();
		}
	};
}