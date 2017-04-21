/**
 * 群组选择组件，支持单选/多选
 * @constructor
 */
function HqsoftGroupSelectorComponent(){

    var sources = null;
    var targets = null;
    var queryInput = null;
    var configObject = {};

    var QuickSearch = new function(){
        var ajaxUrl = ctx + "/sys/group-selection!array.jhtml";
        var intervalCount = 0;
        var interval = null;
        this.query = function(name){
            intervalCount = 0;
            window.clearInterval(interval);
            interval = window.setInterval(function(){
                intervalCount ++;
                if(intervalCount >= 5){
                    window.clearInterval(interval);
                    $.post(ajaxUrl, {"keyword":name}, print, "json");
                }
            }, 100);
        };

        function print(data){
            sources.innerHTML = "";
            for(var i=0;i<data.length;i++){
                var li = document.createElement("li");
                var innerText = data[i].code + " - " + data[i].name;
                li.innerHTML = "<em>" + data[i].id + "</em><a>" + innerText + "</a>";
                li.title = innerText;
                li.ondblclick = function(){
                    if(this.parentNode == targets){
                        sources.appendChild(this);
                    }else{
                        if(check(this)){
                            targets.appendChild(this);
                        }
                    }
                };
                sources.appendChild(li);
            }
        }
    };

    this.init = function(param){
        sources = document.getElementById("sources");
        targets = document.getElementById("targets");
        queryInput = document.getElementById("qsearch").getElementsByTagName("input")[0];
        configObject.sign = param.sign == null ? true : param.sign;

        var items = targets.getElementsByTagName("li");
        for(var i=0;i<items.length;i++){
            items[i].ondblclick = function(){
                targets.removeChild(this);
            };
        }

        items = sources.getElementsByTagName("li");
        for(var j=0;j<items.length;j++){
            items[j].ondblclick = function(){
                if(this.parentNode == targets){
                    sources.appendChild(this);
                }else{
                    if(check(this)){
                        targets.appendChild(this);
                    }
                }
            };
        }
    };

    this.allToTarget = function(){
        if(configObject.sign) return;
        var items = sources.getElementsByTagName("li");
        var len = items.length;
        var tmp = [];
        for(var j=0;j<len;j++){
            tmp.push(items[j]);
        }
        for(var i=0;i<tmp.length;i++){
            targets.appendChild(tmp[i]);
        }
    };

    this.allToSource = function(){
        var items = targets.getElementsByTagName("li");
        var len = items.length;
        var tmp = [];
        for(var j=0;j<len;j++){
            tmp.push(items[j]);
        }
        for(var i=0;i<tmp.length;i++){
            sources.appendChild(tmp[i]);
        }
    };

    this.getData = function(){
        var items = targets.getElementsByTagName("li");
        if(items == null || items.length <= 0) return [];
        var result = [];
        for(var i=0;i<items.length;i++){
            var item = items[i];
            var id = item.getElementsByTagName("em")[0].innerHTML;
            var tmp = item.getElementsByTagName("a")[0].innerText.split(" - ");
            var code = tmp[0];
            var name = tmp[1];
            result.push({"id":id, "code": code, "name":name});
        }
        return result;
    };

    this.query = QuickSearch.query;

    function check(node){
        var items = targets.getElementsByTagName("li");
        if(configObject.sign && items.length > 0){
            return false;
        }

        for(var i=0;i<items.length;i++){
            if(node.children[0].innerText == items[i].children[0].innerText){
                return false;
            }
        }
        return true;
    }
}
var GSC = new HqsoftGroupSelectorComponent();