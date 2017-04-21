var MM = new function(){
	this.pchecked = function(eventObj){
		var __panel = eventObj.parentNode.parentNode.parentNode;
		var inputs = __panel.getElementsByTagName("dd");
		var hadChildChecked = false;
		for(var i=0;i<inputs.length;i++){
			var input = inputs[i].getElementsByTagName("input")[0];
			if(input.type != "checkbox") continue;
			if(input.checked){
				hadChildChecked = true;
				break;
			}
		}
		var labelCheck = __panel.getElementsByTagName("dt")[0].getElementsByTagName("input")[0];
		labelCheck.checked = hadChildChecked;
	};

	this.achecked = function(eventObj){
		if(eventObj.type != "checkbox") return;
		var __panel = eventObj.parentNode.parentNode.parentNode;
		var inputs = __panel.getElementsByTagName("dd");
		for(var i=0;i<inputs.length;i++){
			var input = inputs[i].getElementsByTagName("input")[0];
			if(input.type != "checkbox") continue;
			input.checked = eventObj.checked;
		}
	};

	this.auto = function(){
		var panel = $(".menus-panel");
		var dls = panel.find("dl");
		if(dls == null || dls.length <= 0) return;
		var clientWidth = document.documentElement.clientWidth;
		var xNums = Math.floor(clientWidth / 200);
		var yNums = Math.floor(dls.length / xNums);
		var capacity = null;
		for(var i=0;i<dls.length;i++){
			if($(dls[i]).find("dd").length <= 0) {
				$(dls[i]).remove();
				continue;
			}
			if(i == 0 || i % yNums == 0){
				capacity = $("<div></div>")
				capacity.appendTo(panel);
			}
			$(dls[i]).appendTo(capacity);
		}
	};
};

$(window).resize(MM.auto);
$(window).load(MM.auto);