/**
 * 文件内容显示器
 * @module grid
 */
function display4files(dataObject, columnObject, cellElement, tableParamObj){

    if(tableParamObj.table.readable){
        readable();
    }else{
        writeable();
    }

    function readable() {
        var fileUL = cellElement.getElementsByTagName("ul")[0];
        if (fileUL == null) return;
        for (var i = 0; i < dataObject.length; i++) {
            var fileObj = dataObject[i];
            var size = fileObj.size;
            size = size == null ? 0 : size;
            var __size = size;
            var unit = " KB";
            if (size > 1073741824) {
                __size = size / 1073741824;
                unit = " GB";
            } else if (size > 1048576) {
                __size = size / 1048576;
                unit = " MB";
            } else if (size > 1024) {
                __size = size / 1024;
                unit = " KB";
            }
            __size = __size.toFixed(2);
            var name = getString(fileObj.name);
            var remark = getString(fileObj.remark);
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.title = name + " " + remark;
            a.href = "javascript:;";
            a.setAttribute("index",i);
            a.onclick = function () {
                jaf.editor.file.download(dataObject[this.getAttribute("index")].name, columnObject.id, dataObject[this.getAttribute("index")].id);
            };
            a.innerHTML = (i + 1) + "." + name + "." + fileObj.extension;
            var em = document.createElement("em");
            em.innerHTML = __size + unit;
            li.appendChild(a);
            li.appendChild(em);
            fileUL.appendChild(li);
        }
    }

    function writeable(){
        if(dataObject == null || dataObject == "") return;
        var inputs = cellElement.getElementsByTagName("input");
        var ids = "", names = "";
        for(var i=0;i<dataObject.length;i++){
            var obj = dataObject[i];
            if(i != 0){
                ids += ",";
                names += ",";
            }
            ids += obj.id;
            names += obj.name + "." + obj.extension;
        }
        inputs[0].value = ids;
        inputs[1].value = names;
    }

    function getString(str){
        if(str == null) return "";
        return str;
    }
}

/**
 * 用户选择显示器
 * @module grid
 */
function display4users(dataObject, columnObject, cellElement, tableParamObj){
    if(tableParamObj.table.readable){
        readable();
    }else{
        writeable();
    }

    function readable(){
        if(dataObject == null || dataObject == "") return;
        var inputs = cellElement.getElementsByTagName("input");
        inputs[0].value = dataObject.name;
    }

    function writeable(){
        if(dataObject == null || dataObject == "") return;
        var inputs = cellElement.getElementsByTagName("input");
        inputs[0].value = dataObject.account;
        inputs[1].value = dataObject.name;
    }
}

/**
 * 表格的事件对象
 * @module grid
 * @param source 事件发生的来源
 * @param oldValue 事件发生前的值
 * @param newValue 事件发生后的值
 * @param event 事件的编码
 * @constructor source, oldValue, newValu
 */
function EventObject(source, oldValue, newValue, event){
    this.source = source;
    this.oldValue = oldValue;
    this.newValue = newValue;
    this.code = event;
}

/**
 * 网格的一些支持的事件
 * @property TableEvent
 * @final
 * @type {Object} {add: string, selected: string, click: string, remove: string, verify: string, insert: string}
 */
var TableEvent = {
    before:{add:"beforeAdd", remove:"beforeRemove",copy:"beforeCopy",clear:"beforeClear"},
    after:{add:"afterAdd", remove:"afterRemove",copy:"afterCopy",refresh:"afterRefresh"},
    //当增加一行
    add : "add",
    //当选择一行时
    selected : "selected",
    //当点击表格时
    click : "click",
    //当移除一行
    remove : "remove",
    //当验证表格时
    verify : "verify",
    //插入一行时
    insert : "insert"
};

/**
 * 该初始器会构建一个表格对象，需要 jquery 支持
 * @class TableInitializer
 * @module grid
 */
function TableInitializer(__params){
    //网格的主要参数
    var params = __params;
    params.table.max = (params.table.max == null || params.table.max <= 0) ? 10 : params.table.max;
    params.table.min = params.table.min == null ? 1 : params.table.min;
    this.param = params;
    var pagination = new Pagination();
    var dataInitialized = __params.data.initialized;

    var ui = new UI();
    var model = new Model();
    var control = new Control();

    /**
     * 返回UI
     * @method getUI
     * @returns UI
     */
    this.getUI = function(){
        return ui;
    };

    /**
     * 返回模型
     * @method getModel
     * @returns Model
     */
    this.getModel = function(){
        return model;
    };

    /**
     * 返回控制器
     * @method getControl
     * @returns Control
     */
    this.getControl = function(){
        return control;
    };

    //安装内置的列选择监听器，用来改变选择后的列的样式
    control.addListener(TableEvent.click, function(eventObj){
        ui.getCellSelection().select(eventObj);
    });
    //安装行选择的监听器，用来改变选择后行的样式及设置模型中的选择行号
    control.addListener(TableEvent.selected, function(eventObj){
        if(eventObj.oldValue == eventObj.newValue) return;
        var rows = ui.getTBody().rows;
        var selectRow = rows[eventObj.newValue - 1];
        if(selectRow.className.indexOf("empty") != -1) return;
        var className = selectRow.className;
        className = className.replace(" selected", "");
        className += " selected";
        selectRow.className = className;

        model.setRowSelectionIndex(eventObj.newValue);

        var lastSelectedRow = rows[eventObj.oldValue - 1];
        if(lastSelectedRow != null){
            lastSelectedRow.className = lastSelectedRow.className.replace(" selected", "");
        }
    });
    //安装内置的行增加监听器，该事件源发生在 model.add()
    control.addListener(TableEvent.add, function(eventObj){
        ui.doCreateRow(eventObj.newValue, eventObj.oldValue);
        //选滚动到底部
        ui.getComponent().children[0].children[2].scrollTop = ui.getComponent().children[0].children[2].scrollHeight;
        try {
            parent.FSC.resize();
        } catch (e) {
        }
    });
    //安装内置的行插入监听器，该事件源发生在 model.insert()
    control.addListener(TableEvent.insert, function(eventObj){
        ui.doCreateRow(eventObj.newValue, eventObj.oldValue, true);
        try {
            parent.FSC.resize();
        } catch (e) {
        }
    });
    //安装内置的行删除监听器，该事件源发生在 model.remove()
    control.addListener(TableEvent.remove, function(eventObj){
        ui.doDeleteRow(eventObj.newValue);
        //control.firePropertyChange(TableEvent.selected, new EventObject(ui.getTable(), eventObj.newValue.rowIndex, 1));
    });

    //一系列初始化的工作，比如创建一些空行，首次加载时的Loading界面
    ui.doInitGUI();
    ui.addDisplay("File", display4files);
    ui.addDisplay("Users", display4users);

    function getColumnString(){
        var str = "";
        for(var i = 0; i<params.columns.length;i++){
            if(i != 0) str += ",";
            str += params.columns[i].id;
        }
        return str;
    }

    /**
     * 数据分页对象
     * @type Pagination
     * @private
     * @extends TableInitializer
     */
    function Pagination() {
        var currPage = 1;

        var element = document.createElement("div");
        element.className = "pagination";

        var totalImage = document.createElement("img");
        totalImage.src = ctp + "/images/page-total.gif";
        totalImage.alt = "总数";
        totalImage.border = "0";
        var preSimpleImage = document.createElement("img");
        preSimpleImage.src = ctp + "/images/pre_page_simple.gif";
        preSimpleImage.alt = "上一页";
        preSimpleImage.border = "0";
        var preActiveImage = document.createElement("img");
        preActiveImage.src = ctp + "/images/pre_page_simple_act.gif";
        preActiveImage.alt = "上一页";
        preActiveImage.border = "0";
        preActiveImage.style.cursor = "pointer";
        preActiveImage.onclick = function(){
            model.fullAjaxData(--currPage);
        };

        var nextSimpleImage = document.createElement("img");
        nextSimpleImage.src = ctp + "/images/next_page.gif";
        nextSimpleImage.alt = "下一页";
        nextSimpleImage.border = "0";
        var nextActiveImage = document.createElement("img");
        nextActiveImage.src = ctp + "/images/next_page_act.gif";
        nextActiveImage.alt = "下一页";
        nextActiveImage.border = "0";
        nextActiveImage.style.cursor = "pointer";
        nextActiveImage.onclick = function(){
            model.fullAjaxData(++currPage);
        };

        var jumpToPageInput = document.createElement("input");
        jumpToPageInput.type = "text";
        jumpToPageInput.maxLength = 3;

        var doPaginationButton = document.createElement("img");
        doPaginationButton.src = ctp + "/images/btn_ok.gif";
        doPaginationButton.border = "0";
        doPaginationButton.style.cursor = "pointer";
        doPaginationButton.onclick = function(){
            var value = jumpToPageInput.value;
            jumpToPageInput.value = "";
            if(value == "" || isNaN(Number(value))) return;
            model.fullAjaxData(value);
        };

        /**
         * 获取分页对象产出的HTML元素
         * @returns {HTMLElement}
         */
        this.getElement = function(){
            return element;
        };

        /**
         * 初始化分页
         * @param page
         * @param pageSize
         * @param recordCount
         * @param first
         */
        this.init = function(page, pageSize, recordCount, first){
            page = page == null || page == undefined ? 1 : page;
            recordCount = recordCount == null || recordCount == undefined ? 0 : recordCount;
            pageSize = pageSize == null || pageSize == undefined ? 20 : pageSize;
            var pageCount = recordCount % pageSize != 0 ? parseInt(recordCount / pageSize) + 1 : parseInt(recordCount / pageSize);
            element.innerHTML = "";
            currPage = page;

            //total
            //element.appendChild(totalImage);
            var total = document.createElement("span");
            total.innerText = " (" + first + "-" + (pageSize * page) + "/" + recordCount + ") "+ lang["page.size"] + pageSize + " ";
            element.appendChild(total);

            //page guider
            var pageGuider = document.createElement("span");
            pageGuider.innerText = lang["page.curr"] + " " + page + "/" + pageCount + " ";
            element.appendChild(pageGuider);

            //pre button
            if (page <= 1) {
                element.appendChild(preSimpleImage);
            } else {
                element.appendChild(preActiveImage);
            }

            element.appendChild(document.createTextNode(" "));

            //pages
            var pageHtmlElement = document.createElement("span");
            for ( var i = 1; i <= pageCount; i++) {
                var href = document.createElement("a");
                href.index = i;
                if (i == page) {//如果是当前页
                    href.innerHTML = " <b>" + i + "</b> ";
                    href.href = "javascript:;";
                    href.onclick = function(){
                        model.fullAjaxData(this.index);
                    };
                } else {
                    href.innerHTML = " " + i + " ";
                    href.href = "javascript:;";
                    href.onclick = function(){
                        model.fullAjaxData(this.index);
                    };
                }

                if (page >= 5 && page <= (pageCount - 2)) {
                    if (i <= 2) {
                        pageHtmlElement.appendChild(href);
                    } else if (i > (pageCount - 2)) {
                        pageHtmlElement.appendChild(href);
                    } else {
                        if (i == (page - 2)) {
                            pageHtmlElement.appendChild(document.createTextNode("..."));
                        }
                        if (i >= (page - 2) && i <= (page + 2)) {
                            pageHtmlElement.appendChild(href);
                        }
                        if (i == (page + 2)) {
                            pageHtmlElement.appendChild(document.createTextNode("..."));
                        }
                    }
                } else if (page < 5) {
                    if (i <= (page + 2)) {
                        pageHtmlElement.appendChild(href);
                    } else if (i > (pageCount - 2)) {
                        pageHtmlElement.appendChild(href);
                    } else if (i == (page + 3)) {
                        pageHtmlElement.appendChild(document.createTextNode("..."));
                    }
                } else if (page > (pageCount - 2)) {
                    if (i <= 3 || i >= (page - 2)) {
                        pageHtmlElement.appendChild(href);
                    } else if (i == (page - 3)) {
                        pageHtmlElement.appendChild(document.createTextNode("..."));
                    }
                }
            }
            element.appendChild(pageHtmlElement);

            //next button
            if (page >= pageCount) {
                element.appendChild(nextSimpleImage);
            } else {
                element.appendChild(nextActiveImage);
            }

            //jump to page
            var jumpToPageElement = document.createElement("span");
            jumpToPageElement.className = "jump";
            jumpToPageElement.appendChild(document.createTextNode(" 转到第 "));
            jumpToPageElement.appendChild(jumpToPageInput);
            jumpToPageElement.appendChild(document.createTextNode(" 页 "));
            jumpToPageElement.appendChild(doPaginationButton);
            element.appendChild(jumpToPageElement)
        };

        /**
         * 获取当前分页
         * @returns {number}
         */
        this.getPage = function(){
            return currPage;
        };
    }

    /**
     * 网格的UI
     * @type TableInitializer.UI
     * @private
     * @extends TableInitializer
     */
    function UI(){
        var displays = new HashMap();
        var tableComponent = document.getElementById(params.table.id);
        var table = tableComponent.getElementsByTagName("table")[0];
        var tHead = table.tHead;
        var tBody = table.tBodies[0];
        var tFoot = tableComponent.children[0].children[3];
        var snapshotElement = tableComponent.children[0].children[1].children[1];
        var messageElement = tableComponent.children[0].children[1].children[2];
        var eventsElement = tableComponent.children[0].children[1].children[0];
        var loadingElement = tableComponent.children[0].children[0];
        var listControlPanel = new ListControlPanel();
        var cellSelection = new CellSelection();
        var inputArrayIndexMeterNumber = 0;
        var belongPreButton, belongNextButton;

        if(tFoot != null && params.table.readable) {
            pagination.init(1, 1, 0, 1);
            tFoot.children[0].appendChild(pagination.getElement());
        }
        if(eventsElement != null && params.table.belong != null){
            var belongControlPreRowButtonContainer = document.createElement("li");
            belongControlPreRowButtonContainer.className = "belong";
            belongPreButton = document.createElement("input");
            belongPreButton.value = "3";
            belongPreButton.type = "button";
            belongPreButton.title = "上一行";
            belongPreButton.disabled = "disabled";
            belongControlPreRowButtonContainer.appendChild(belongPreButton);
            if (eventsElement.children.length > 0) {
                eventsElement.insertBefore(belongControlPreRowButtonContainer, eventsElement.children[0]);
            } else {
                eventsElement.appendChild(belongControlPreRowButtonContainer);
            }

            var belongControlNextRowButtonContainer = document.createElement("li");
            belongControlNextRowButtonContainer.className = "belong";
            belongNextButton = document.createElement("input");
            belongNextButton.value = "4";
            belongNextButton.type = "button";
            belongNextButton.title = "下一行";
            belongNextButton.disabled = "disabled";
            belongControlNextRowButtonContainer.appendChild(belongNextButton);
            if (eventsElement.children.length > 1) {
                eventsElement.insertBefore(belongControlNextRowButtonContainer, eventsElement.children[1]);
            } else {
                eventsElement.appendChild(belongControlNextRowButtonContainer);
            }
        }
        if(eventsElement != null && params.table.readable) {
            var tableRefreshButtonContainer = document.createElement("li");
            tableRefreshButtonContainer.className = "refresh";
            var tableRefreshButton = document.createElement("button");
            tableRefreshButton.innerHTML = "<i></i> 刷新";
            tableRefreshButton.type = "button";
            tableRefreshButton.onclick = function () {
                dataInitialized = false;
                model.setAjaxAsync(true);
                model.fullAjaxData(pagination.getPage(),model.afterRefresh);
                model.setAjaxAsync(false);
                model.setRowSelectionIndex(-1);
            };
            tableRefreshButtonContainer.appendChild(tableRefreshButton);
            if (eventsElement.children.length > 0) {
                eventsElement.insertBefore(tableRefreshButtonContainer, eventsElement.children[0]);
            } else {
                eventsElement.appendChild(tableRefreshButtonContainer);
            }
        }

        //var columns = doSyncRemoteColumns(tBody.rows[0]);
        var cellTemplates = [];
        var __cells = tBody.rows[0].cells;
        //fuck microsoft
        for(var j=0;j<__cells.length;j++){
            cellTemplates[j] = __cells[j].cloneNode(true);
        }
        tBody.deleteRow(0);
        var columns = params.columns;
        var ths = tHead.rows[0].getElementsByTagName("th");
        for(var i=0;i<ths.length;i++){
            var th = ths[i];
            var column = null;
            try{
                column = columns[i - 2];
            }catch(e){
            }
            if(column == null) continue;
            //将列参数对像与列头绑定
            th.columnObject = column;
        }

        this.getThs = function(){
            return ths;
        };
        this.getComponent = function(){
            return tableComponent;
        };
        this.getTable = function(){
            return table;
        };
        this.getTBody = function(){
            return tBody;
        };
        this.getListControlPanel = function(){
            return listControlPanel;
        };
        this.doCreateRow = function(dataObject, rowIndex, insert){
            insert = insert == null ? false : insert;
            var rows = tBody.rows;
            var index = rowIndex == null ? (dataObject == null ? rows.length : model.getSize()) : rowIndex;
            var row = rows[index];
            if(row == null || insert){
                row = tBody.insertRow(index);
            }else{
                row.innerHTML = "";
                row.className = "";
            }
            row.className = dataObject == null ? "empty" : "";

            //inputArrayIndexMeterNumber = index; // bug#3257更正，不能加这一行，否则删除行再新增行会有问题
            //row.innerHTML = rowTemplateHtml;
            for(var i=0;i<cellTemplates.length;i++){
                //var cell = row.insertCell();
                var cell = cellTemplates[i].cloneNode(true);
                if(dataObject == null){
                    cell.innerHTML = "&nbsp;";
                    row.appendChild(cell);
                    continue;
                }

                var cellHTML = cell.innerHTML;
                var field = getInputName();
                var exp = "";
                eval("exp=/name=\"" + field[1] + "\\[(\\d+)\\](.*?)\"/;");
                //exp = /name="parameter.test.f1\[(\d+)\](.*?)"/;
                cellHTML = cellHTML.replace(exp, "name=\"" + field[0] + "[" + inputArrayIndexMeterNumber + "]$2\"");
                if(i == 0 && dataObject != null){
                    cellHTML = cellHTML.replace(/<span>(\d+)<\/span>/, "<span>" + (row.rowIndex) + "</span>");
                }
                cell.innerHTML = cellHTML;
                row.appendChild(cell);
                var columnObject = null;
                if(i != 0){
                    columnObject = params.columns[i - 2];
                }

                 var cellElement = null;
                 try{
                    cellElement = rows[row.rowIndex - 2].cells[i];
                 }catch(e){
                 }

                var value = getValueFromDataObject(dataObject, columnObject, cellElement);
                var display = null;
                try{
                    display = displays.get(columnObject.clazz);
                }catch(e){
                }
                if(display == null) {
                    doSetCellValue(cell, value);
                }else{
                    if(columnObject == null) continue;
                    try {
                        display(value, columnObject, cell, params);
                    }catch(e){
                        alert("自定义显示器无法显示第 " + i + " 列内容:\n" + e.message);
                    }
                }
            }

            //-------------------------------------------------
            // 插入行还需要将源行的下一行的输入控件索引改变
            //TODO
            //-------------------------------------------------

            if(dataObject != null) {
                row.inputArrayIndex = inputArrayIndexMeterNumber ++;
            }

            return row;

            function getInputName(){
                var __currTableObj__ = null;
                var __belongTableObj__ = null;
                try{
                    __belongTableObj__ = params.table.belong.obj;
                }catch(e){
                    __belongTableObj__ = null;
                }
                var __field__ = params.table.field;
                var __fieldExp__ = params.table.field;
                while(__belongTableObj__ != null){
                    var __belongTableField__ = __belongTableObj__.param.table.field;

                    var __belongTableRowIndex__ = __belongTableObj__.getModel().getSelectedRowIndex();
                    __belongTableRowIndex__ = __belongTableRowIndex__ <= 0 ? 1 : __belongTableRowIndex__;
                    var __belongTableRow__ = __belongTableObj__.getUI().getTBody().rows[__belongTableRowIndex__ - 1];

                    __field__ = __field__.replace(__belongTableField__, __belongTableField__ + "[" + __belongTableRow__.inputArrayIndex + "]");
                    __fieldExp__ = __fieldExp__.replace(__belongTableField__, __belongTableField__ + "\\[.*?\\]");
                    __currTableObj__ = __belongTableObj__;
                    try {
                        __belongTableObj__ = __belongTableObj__.param.table.belong.obj;
                    }catch(e){
                        __belongTableObj__ = null;
                    }
                }

                return [__field__, __fieldExp__];
            }
        };
        this.doDeleteRow = function(targetRow){
            var row = targetRow;
            if(row == null) return;
            tBody.removeChild(row);
            var rows = tBody.rows;
            var allRowIsEmpty = true;
            for(var i=0;i<rows.length;i++){
                if(rows[i].className.indexOf("empty") != -1) continue;
                var snCellHtml = rows[i].cells[0].innerHTML;
                snCellHtml = snCellHtml.replace(/<span>(\d+)<\/span>/, "<span>" + (rows[i].rowIndex) + "</span>");
                rows[i].cells[0].innerHTML = snCellHtml;
                if(!allRowIsEmpty) continue;
                allRowIsEmpty = false;
            }
            ui.getListControlPanel().hidden();
            var size = (params.table.min == undefined || params.table.min < 5) ? 5 : params.table.min;
            if(rows.length >= size) return;
            if(allRowIsEmpty){
                ui.doCreateRow({}, 0, true);
            }else{
                ui.doCreateRow(null);
            }
        };
        this.doInitGUI = function(noDefaultDataObj, clear){
            clear = clear == null || clear == undefined ? false : clear;
            if(!dataInitialized || clear) {
                var __obj = ui.getTempalteCellData();
                __obj = __obj == null ? {} : __obj;
                tBody.innerHTML = "";
                inputArrayIndexMeterNumber = 0; // 重置inputArrayIndexMeterNumber
                noDefaultDataObj = noDefaultDataObj == undefined || null ? false : noDefaultDataObj;
                if (!noDefaultDataObj) {
                    for (var n = 0; n < params.table.min; n++) {
                        model.add(__obj);
                    }
                }
            }

            // bug#2438更正，inputArrayIndexMeterNumber应该在这里正确初始化
            inputArrayIndexMeterNumber = tBody.rows.length;

            //初始化空行
            /* var size = noDefaultDataObj ? 5 : (5 - params.table.min);
             * size -= tBody.rows.length;
             * 上面的初始化空行计算方式有误, 对于'普通请购单'这种已经有初始数据的，
             * 只会初始化3个空行，导致总行数只有4行
             */
            var size = noDefaultDataObj ? 5 : (5 - tBody.rows.length);

            for(var i=0;i<size;i++){
                model.add(null);
            }
        };
        this.showLoadElement = function(){
            var panel = tableComponent.children[0].children[2];
            var _h1 = panel.offsetHeight + tFoot.offsetHeight + eventsElement.offsetHeight + 5;
            loadingElement.style.height = _h1 + "px";
            loadingElement.style.marginBottom = -_h1 + "px";
            loadingElement.style.lineHeight = _h1 + "px";
            loadingElement.style.display = "block";
        };
        this.hiddenLoadElement = function(){
            loadingElement.style.display = "none";
        };
        this.showMessage = function(messge, type){
            messageElement.innerHTML = "<div class=\"" + type + "\">" + messge + "</div>";
        };
        this.showSnapshot = function(snapshot){
            snapshotElement.innerHTML = snapshot;
        };
        this.hiddenMessage = function(){
            messageElement.innerHTML = "";
        };
        this.getCellSelection = function(){
            return cellSelection;
        };
        this.getRowData = function(target, verifyCellValueCallback){
            if(target == null) return null;
            var cells;
            if(typeof(target) == "number"){
                cells = tBody.rows[target].cells;
            }else if(jaf.isArray(target)){
                cells = target;
            }else{
                cells = target.cells;
            }
            var dataObj = {};
            dataObj["id"] = cells[0].getElementsByTagName("input")[0].value;
            for(var i=1;i<ths.length;i++){
                var cell = cells[i];
                if(cell == null) continue;
                var columnObject = ths[i].columnObject;
                if(columnObject == null) continue;
                var cellInputs = cell.getElementsByTagName("input");
                var value = "";
                if(cellInputs != null && cellInputs.length > 0){
                    var values = [];
                    for(var m=0;m<cellInputs.length;m++){
                        var inputObj = cellInputs[m];
                        if(inputObj.name == null || inputObj.name == "") continue;
                        if(inputObj.type == "checkbox" && inputObj.checked){
                            values[m] = inputObj.value;
                        }else if(inputObj.type == "radio" && inputObj.checked){
                            values[m] = inputObj.value;
                        }else if(inputObj.type == "text" || inputObj.type == "hidden"){
                            values[m] = inputObj.value;
                        }
                    }
                    value = values.join(",");
                }

                var cellSelects = cell.getElementsByTagName("select");
                if(cellSelects != null && cellSelects.length > 0){
                    var values = [];
                    for(var n=0;n<cellSelects.length;n++){
                        var selectObj = cellSelects[n];
                        values[n] = selectObj.options[selectObj.selectedIndex].value;
                    }
                    value = values.join(",");
                }

                if(verifyCellValueCallback != undefined && verifyCellValueCallback != null) verifyCellValueCallback(cell, columnObject, value);

                dataObj[columnObject.id] = value;
            }
            return dataObj;
        };
        this.getTempalteCellData = function(){
            return ui.getRowData(cellTemplates);
        };
        this.getBelongPreButton =  function(){
            return belongPreButton;
        };
        this.getBelongNextButton = function(){
            return belongNextButton;
        };
        this.addDisplay = function(clazz, display){
            displays.put(clazz, display);
        };
        this.hiddenColumn = function(columnObj, hidden){
            hidden = hidden == null;
            var index = columnObj;
            if(typeof columnObj == "object"){
                index = tHead.rows[0].indexOf(columnObj);
            }
            var target = tHead.rows[0].cells[index];
            doHidden(target, hidden);
            target = cellTemplates[index];
            doHidden(target, hidden);

            var rows = tBody.rows;
            for(var i=0;i<rows.length;i++){
                target = rows[i].cells[index];
                doHidden(target, hidden);
            }

            function doHidden(source, val){
                if(source == null) return;
                var className = source.className;
                className = className.replace(/\s?hidden/, "");
                if(val){
                    className += " hidden"
                }
                source.className = className;
            }
        };

        /**
         * 通过Ajax同步获取列
         * @Deprecated
         */
        function doSyncRemoteColumns(rowTemplate){
            var __cells = rowTemplate.cells;
            var __columns = params.columns;
            var __tmp = params.table.field.split(".");
            var __params = "form.code=" + __tmp[1] + "&field.code=" + __tmp[2] + "&codes=" + getColumnString();
            var newColumns = [];
            var newCells = [];
            newCells.push(__cells[0]);
            $.ajax({
                type : "post",
                url : ctx + "/form/collection!columns.jhtml",
                data : __params,
                dataType: "json",
                async : false,
                success : function(data){
                    for(var i=0;i<__columns.length;i++){
                        for(var j=0;j<data.length;j++){
                            if(data[j] != __columns[i].id) continue;
                            newColumns.push(__columns[i]);
                            newCells.push(__cells[i+1]);
                        }
                    }
                }
            });
            tBody.removeChild(rowTemplate);
            cellTemplates = newCells;
            return newColumns;
        }

        /**
         * 获取某一列中HTML控件的值
         * @param data
         * @param columnObject
         * @param cellElement
         * @returns {*}
         */
        function getValueFromDataObject(data, columnObject, cellElement) {
            var value = "";
            try {
                value = data[columnObject == null ? "id" : columnObject.id];
                value = value == undefined || value == null ? "" : value;
            } catch (e) {
            }
            if(value != "") return value;//解决行号永远自增的问题
            return getSeedValue(value, columnObject);

            function getSeedValue(value, cellParams){
                /** @namespace cellParams.seed */
                if(cellParams == null || cellParams.seed == null || !cellParams.seed || cellParams.step == null) return value;
                var seed = 0;
                if(cellElement != null){
                    var textInputs = cellElement.getElementsByTagName("input");
                    if(textInputs.length != 1) return value;
                    var number = Number(textInputs[0].value);
                    if(!isNaN(number) && number != 0){
                        seed = number;
                    }
                }
                return seed + Number(cellParams.step);
            }
        }

        /**
         * 填充数据
         * @param cellElement
         * @param value
         */
        function doSetCellValue(cellElement, value){
            if(cellElement == null) return;
            //inputs
            var inputs = cellElement.getElementsByTagName("input");
            if(inputs != null && inputs.length > 0){
                var inputType = inputs[0].type;
                if(inputType == "text" || inputType == "hidden"){
                    for(var j=0;j<inputs.length;j++){
                        inputs[j].value = value;
                    }
                }else if(inputType == "checkbox" || inputType == "radio"){
                    var valueArg = value.split(",");
                    for(var i=0;i<inputs.length;i++){
                        var __input = inputs[i];
                        if(__input.type != "checkbox" && __input.type != "radio"){
                            __input.value = value;
                        }else{
                            for(var m=0;m<valueArg.length;m++){
                                if(__input.value == valueArg[m]){
                                    if(__input.type == "checkbox"){
                                        __input.checked = true;
                                    }else {
                                        __input.checked = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            //select
            var selects = cellElement.getElementsByTagName("select");
            if(selects != null && selects.length > 0){
                var select = selects[0];
                var options = select.options;
                for(var n=0;n<options.length;n++){
                    if(options[n].value == value){
                        options[n].selected = true;
                        break;
                    }
                }
            }

            //textarea
            var textAreas = cellElement.getElementsByTagName("textarea");
            if(textAreas != null && textAreas.length > 0){
                textAreas[0].value = value;
            }
        }

        /**
         * 列选择处理
         */
        function CellSelection(){
            var lastSelectedCell = null;
            this.getSelectedCell = function(){
                return lastSelectedCell;
            };

            this.select = function(eventObj){
                var cell = control.getCellFromEvent(eventObj.newValue);
                if(cell == null) return;
                // 要先判断cell是否为null，否则当点击div.tbody时，会触发div.popup的blur和focus事件
                selectText(eventObj.newValue); 
                var className = cell.className;
                //if(cell.children[0].className.indexOf("readonly") != -1) return;
                className = className.replace(" selected","");
                className += " selected";
                cell.className = className;
                if(lastSelectedCell != null && lastSelectedCell != cell) {
                    className = lastSelectedCell.className;
                    className = className.replace(" selected", "");
                    lastSelectedCell.className = className;
                }
                lastSelectedCell = cell;
            };

            function selectText(eventElement){
                if(eventElement.tagName == "INPUT" && eventElement.type == "text"){
                    eventElement.select();
                    return;
                }
                var inputs = eventElement.getElementsByTagName("input");
                for(var i=0;i<inputs.length;i++){
                    if(inputs[i].type != "text") continue;
                    inputs[i].select();
                }
            }
        }

        /**
         * 列表控制面板
         * 提供 新增，插入，删除，复制行的UI
         * @constructor
         */
        function ListControlPanel(){
            var panel = document.createElement("div");
            panel.className = "list-control-panel";
            var container = document.createElement("div");
            panel.appendChild(container);
            tableComponent.children[0].appendChild(panel);

            var lastScrollTop = 0;

            function ScrollListener(/*UIEvent*/){
                var scrollTop = tableComponent.children[0].children[2].scrollTop;
                if(scrollTop == lastScrollTop) return;
                lastScrollTop = scrollTop;
                Hidden();
            }

            if(document.addEventListener){//FireFox
                tableComponent.children[0].children[2].addEventListener("scroll", ScrollListener, false);
            }else{//IE、Opera、Chrome
                tableComponent.children[0].children[2].onscroll = ScrollListener;
            }

            var rowEventButtons = [];

            function addExpendEvents(cell){
                for(var i=0;i<rowEventButtons.length;i++){
                    container.removeChild(rowEventButtons[i]);
                }
                rowEventButtons = [];
                if(cell == null) return;
                var targetRow = cell.parentNode;
                var expendEventsContainerCell = targetRow.cells[1];
                var events = expendEventsContainerCell.innerHTML;
                events = eval(events);
                if(events == null || events.length <= 0) return;
                for(var j=0;j<events.length;j++){
                    var button = document.createElement("input");
                    button.js = events[j].js;
                    button.onclick = function(){
                        try{
                            if(typeof(this.js) == "string"){
                                eval(this.js);
                            }else if(typeof(this.js) == "function"){
                                this.js();
                            }else{
                                return;
                            }
                        }catch(e){
                            top.jaf.alert(e);
                        }
                    };
                    button.value = events[j].name;
                    button.type = "button";
                    rowEventButtons.push(button);
                    container.appendChild(button);
                }
            }

            this.show = function(cell){
                cell = cell == null ? control.getCellFromEvent(window.event.srcElement) : cell;
                if(container.children.length == 0) return;
                panel.style.display = "block";
                //未编辑自定义事件会跑出来 所以移到这
                addExpendEvents(cell);

                //var row = cell.parentNode;
                //getPosition() 在 global.js 中
                var position = jaf.position(cell, tableComponent);
                //row.cells[0].appendChild(panel);
                var _y = position.y;
                var _h = cell.offsetHeight;
                var _w = panel.offsetWidth;
                var _scrollTop = tableComponent.children[0].children[2].scrollTop;
                var maxW = panel.parentNode.offsetWidth;
                var maxH = panel.parentNode.offsetTop + panel.parentNode.offsetHeight;
                var _top = _y + _h - _scrollTop;
                //fuck microsoft
                if(jaf.isIE()){
                    _top -= 1;
                }
                if(_top > maxH){
                    _top = maxH;
                }
                panel.style.right = "30px";
                panel.style.top = _top + "px";
            };

            function Hidden(){
                panel.style.display = "none";
            }
            this.hidden = Hidden;

            /**
             * 该方法只能在内部使用，不允许外部来创建按钮
             * @param styleClass
             * @param text
             * @param actionListener
             */
            this.addButton = function(styleClass, text, actionListener){
                var button = document.createElement("input");
                button.className = styleClass;
                button.onclick = actionListener;
                button.value = text;
                button.type = "button";
                container.appendChild(button);
            };
            this.getHtmlElement = function(){
                return panel;
            }
        }
    }

    /**
     * 网格的数据模型
     * @type TableInitializer.Model
     * @private
     * @extends TableInitializer
     */
    function Model(){
        var ajaxUrl = ctx + "/form/collection.jhtml";
        var lastSelectedIndex = -1;
        var ajaxAsync = true;

        this.setAjaxAsync = function(bol){
            ajaxAsync = bol;
        };

        function doClear(index) {
            if (index == null) {
                ui.getTBody().innerHTML = "";
                return;
            }
            var row = ui.getTBody().rows[index - 1];
            if(row == null) return;
            var inputObjects = row.getElementsByTagName("input");
            for(var i=0;i<inputObjects.length;i++){
                var inputObject = inputObjects[i];
                if(inputObject.readOnly || inputObject.disabled) continue;
                if(inputObject.type == "checkbox"){
                    inputObject.checked = false;
                }else if(inputObject.type == "text" || inputObject.type == "hidden"){
                    inputObject.value = "";
                }
            }

            var selectObjects = row.getElementsByTagName("select");
            for(var i=0;i<selectObjects.length;i++){
                if(inputObject.readOnly || inputObject.disabled) continue;
                var selectObject = selectObjects[i];
                selectObject.options[0].selected = true;
            }

            var textareaObjects = row.getElementsByTagName("textarea");
            for(var i=0;i<textareaObjects.length;i++){
                if(inputObject.readOnly || inputObject.disabled) continue;
                var textareaObject = textareaObjects[i];
                textareaObject.value = "";
            }
        }
        this.clear = function(index){
            ui.doCreateRow({}, index - 1, false);
        };
        this.doClear = doClear;
        /**
         * 增加一行
         */
        function doAddData(rowData, index){
            control.firePropertyChange(TableEvent.add, new EventObject(ui.getTable(), index, rowData, TableEvent.add));
        }
        this.add = doAddData;

        /**
         * 插入一行
         */
        function doInsertData(rowData, index){
            control.firePropertyChange(TableEvent.insert, new EventObject(ui.getTable(), index, rowData, TableEvent.insert));
        }
        this.insert = doInsertData;

        /**
         * 移除指定行
         * @param index
         */
        this.remove = function(index){
            var row = ui.getTBody().rows[index - 1];
            control.firePropertyChange(TableEvent.remove, new EventObject(ui.getTable(), null, row, TableEvent.remove));
            if(index == lastSelectedIndex){
                lastSelectedIndex = -1;
            }
        };
        /**
         * 表体刷新后
         */
        this.afterRefresh = function(){
            try{
                control.firePropertyChange(TableEvent.after.refresh, new EventObject(ui.getTable(), null, ui.getTBody().rows, TableEvent.after.refresh));
            }
            catch (e){}
        }
        /**
         * 设置行选择
         * @param rowIndex 行索引
         */
        this.setRowSelectionIndex = function(rowIndex){
            lastSelectedIndex = rowIndex;
        };

        /**
         * 返回表格已选择的行号
         */
        this.getSelectedRowIndex = function(){
            return lastSelectedIndex;
        };

        /**
         * 获取表格的数据
         */
        this.getData = function(verifyCellValueCallback){
            var rows = ui.getTBody().rows;
            var data = [];
            for(var i=0;i<rows.length;i++){
                if(rows[i].className.indexOf("empty") != -1) continue;
                var obj = ui.getRowData(rows[i], verifyCellValueCallback);
                data.push(obj)
            }
            return data;
        };

        /**
         * 设置表格数据
         * @param list
         */
        function doSetData(list){
            var bol = list != null && list != undefined && list.length > 0;
            ui.doInitGUI(bol);
            if(!bol) return;
            for (var i = 0; i < list.length; i++) {
                doAddData(list[i]);
            }
        }
        this.setData = doSetData;

        /**
         * 通过Ajax方式获取数据
         * @param page
         */
        this.fullAjaxData = function(page, dataFulledCall){
            ui.getListControlPanel().hidden();
            ui.showLoadElement();
            //ui.doInitGUI();
            //加载数据
            page = page == null || page == undefined ? 1 : page;
            var owner = params.data.owner == null || params.data.owner == undefined ? null : params.data.owner;
            var __tmp = params.table.field;
            __tmp = __tmp.replace("parameter.", "");
            __tmp = __tmp.replace(/\[\d+\]/g, "");
            var ajaxLoadParams = {"field":__tmp, "page.p":page, "codes":getColumnString(), "from": OBF.getPage().method, "ft.code":params.data.ft};
            if(params.table.events != null){
                ajaxLoadParams["events"] = params.table.events;
            }
            if(owner != null){
                ajaxLoadParams["id"] = owner;
            }
            if(params.table.parameters != null){
                for ( var prop in params.table.parameters) {
                    ajaxLoadParams[prop] = params.table.parameters[prop];
                }
            }
            if(params.table.belong != null){
                var belongTable = params.table.belong.obj;
                var index = belongTable.getModel().getSelectedRowIndex() - 1;
                index = index <= 0 ? 0 : index;
                var data = belongTable.getUI().getRowData(belongTable.getUI().getTBody().rows[index]);
                ajaxLoadParams["id"] = data.id;
            }
            if(params.data.owner != null && !params.table.readable){
                ajaxLoadParams["page.size"] = -1;
            }
            //$.post(ajaxUrl, ajaxLoadParams, function (data, textStatus){process(data, textStatus);}, "json");
            $.ajax({
                type: "post",
                url: ajaxUrl,
                cache:false,
                async:ajaxAsync,
                dataType: "json",
                data: ajaxLoadParams,
                success: function(data, textStatus){
                    process(data, textStatus);
                    if(dataFulledCall != null){
                        try{
                            dataFulledCall();
                        }catch(e){
                            jaf.alert(e.message);
                        }
                    }
                }
            });
            function process(data, textStatus){
                if(textStatus != "success"){
                    ui.showMessage("加载数据失败！", "error");
                    ui.hiddenLoadElement();
                    return;
                }
                if(!data.success){
                    ui.showMessage(data.msg, "error");
                    ui.hiddenLoadElement();
                    return;
                }
                dataInitialized = false;
                ui.doInitGUI(true);
                var result = data.result;
                pagination.init(result.page.p, result.page.size, result.page.count, result.page.first);
                var list = result.list;
                if(list != null && list != undefined && list.length > 0) {
                    for (var i = 0; i < list.length; i++) {
                        var data = list[i].data;
                        try{
                            //当复制时将 id 值置为空
                            var id = OBF.getPage().id;
                            if(id == null && OBF.getPage().method == "copy"){
                                data["id"] = null;
                            }
                        }catch(e){}
                        doAddData(data);
                        var rows = ui.getTBody().rows;
                        try {
                            rows[i].cells[1].innerHTML = list[i].events;
                        }catch(e){
                            console.error(e);
                        }
                    }
                }else{
                    doAddData(ui.getTempalteCellData());
                }
                ui.hiddenLoadElement();
                dataInitialized = true;
            }
        };

        this.getSize = function(){
            var rows = ui.getTBody().rows;
            var index = 0;
            for(var i=0;i<rows.length;i++){
                var row = rows[i];
                if(row.className.indexOf("empty") != -1) continue;
                index ++;
            }
            return index;
        };
    }

    /**
     * 网格的控制器
     * @type TableInitializer.Control
     * @private
     * @extends TableInitializer
     */
    function Control(){
        //一个二维的监听器数组
        var listeners = [];
        //列宽度控制器
        var columnSizeController = new ColumnSizeController();

        //为列表表格加入点击事件
        if (window.addEventListener){
            ui.getComponent().addEventListener("click",tableClickEvent,false);
            document.addEventListener("click", documentClickEvent, false);
            document.addEventListener("keydown",tableKeyListener,false);
        }else{
            ui.getComponent().attachEvent("onclick",tableClickEvent);
            document.attachEvent("onclick", documentClickEvent);
            document.attachEvent("onkeydown",tableKeyListener);
        }

        if(!params.table.readable) {
            if(checkEvent("add")) {
                //为列表加入默认的控制按钮
                ui.getListControlPanel().addButton("", "新增行", function () {
                    var lastSelectedIndex = model.getSelectedRowIndex();
                    var table = ui.getTable();
                    try {
                        FirePropertyChangeListeners(TableEvent.before.add, new EventObject(table, lastSelectedIndex, model.getSize(), TableEvent.before.add));
                    } catch (e) {
                        return;
                    }
                    model.add(getDataObj(ui.getTempalteCellData()));
                    FirePropertyChangeListeners(TableEvent.selected, new EventObject(table, lastSelectedIndex, model.getSize(), TableEvent.selected));
                    FirePropertyChangeListeners(TableEvent.after.add, new EventObject(table, lastSelectedIndex, model.getSize(), TableEvent.after.add));
                });
            }
            /*
             插入行的方法慎用，因为还没有很好的办法解决插入行后对应的Struts列表的索引
             ui.getListControlPanel().addButton("", "插入行", function () {
             var index = model.getSelectedRowIndex();
             model.insert({}, index);
             FirePropertyChangeListeners(
             TableEvent.selected,
             new EventObject(ui.getTable(), index, index + 1)
             );
             });
             */
            if(checkEvent("copy")) {
                ui.getListControlPanel().addButton("", "复制行", function () {
                    var sourceIndex = model.getSelectedRowIndex();
                    try {
                        FirePropertyChangeListeners(TableEvent.before.copy, new EventObject(ui.getTable(), sourceIndex, model.getSize(), TableEvent.before.copy));
                    } catch (e) {
                        return;
                    }
                    var sourceDataObject = getDataObj(ui.getRowData(sourceIndex - 1));
                    model.add(sourceDataObject);
                    FirePropertyChangeListeners(TableEvent.selected, new EventObject(ui.getTable(), sourceIndex, model.getSize(), TableEvent.selected));
                    FirePropertyChangeListeners(TableEvent.after.copy, new EventObject(ui.getTable(), sourceIndex, model.getSize(), TableEvent.after.copy));
                });
            }
            if(checkEvent("clear")) {
                ui.getListControlPanel().addButton("", "清空", function () {
                    var index = model.getSelectedRowIndex();
                    try {
                        FirePropertyChangeListeners(TableEvent.before.clear, new EventObject(ui.getTable(), index, model.getSize(), TableEvent.before.clear));
                    } catch (e) {
                        return;
                    }
                    model.clear(index);
                });
            }
            if(checkEvent("remove")) {
                ui.getListControlPanel().addButton("", "删除行", function () {
                    var index = model.getSelectedRowIndex();
                    var table = ui.getTable();
                    try {
                        FirePropertyChangeListeners(TableEvent.before.remove, new EventObject(table, index, model.getSize(), TableEvent.before.remove));
                    } catch (e) {
                        return;
                    }
                    model.remove(index);
                    FirePropertyChangeListeners(TableEvent.after.remove, new EventObject(table, index, model.getSize(), TableEvent.after.remove));
                });
            }
        }

        //安装行选择的监听器，用来显示/隐藏行操作菜单
        AddListener(TableEvent.selected, function (eventObj) {
            //if(eventObj.oldValue == eventObj.newValue) return;
            var row = ui.getTBody().rows[eventObj.newValue - 1];
            if (row == null) return;
            if (row.className.indexOf("empty") != -1) {
                ui.getListControlPanel().hidden();
                return;
            }
            //var cells = row.cells;
            //最后一列为自定义的行操作事件按钮存放的列，这一列是隐藏的
            var eventHiddenCell = null;
            try{
                eventHiddenCell = row.cells[ui.getCellSelection().getSelectedCell().cellIndex];
            }catch(e){
            }
            if(eventHiddenCell == null) return;
            ui.getListControlPanel().show(eventHiddenCell);
        });

        function getDataObj(source){
            try {
                source.id = "";
            }catch(e){}
            //复制行时，如果某一列是种子列，清空该值
            var columns = params.columns;
            try {
                for(var i=0;i<columns.length;i++){
                    if(columns[i].seed == null || !columns[i].seed || columns[i].step == null) continue;
                    source[columns[i].id] = "";
                }
            }catch(e){}
            return source;
        }

        function checkEvent(code){
            var array = params.table["does"];
            if(array == null || array == undefined) return true;
            if(typeof(array) == "string"){
                array = array.split(",");
            }
            if(code == null || code == "" || array == null || array.length <= 0) {
                return false;
            }
            for(var i=0;i<array.length;i++){
                if(array[i] == code) return true;
            }
            return false;
        }

        function documentClickEvent(){
            var element = window.event.srcElement;
            while(true){
                if(element == null) break;
                if(element.tagName == "BODY") break;
                if(element == ui.getListControlPanel().getHtmlElement()) return;
                if(element == ui.getTBody()) return;
                element = element.parentNode;
            }
            ui.getListControlPanel().hidden();
        }

        /**
         * 表格按键事件
         */
        function tableKeyListener(){
            var key = window.event.keyCode;
            //获得当前焦点所在的列
            var td = getCellFromEvent(document.activeElement);
            if(td == null) return;
            var row = td.parentNode;
            var focusCell = null;
            var rowIndex = row.rowIndex;
            var cellIndex = td.cellIndex;
            if (key == 37) {//左
                if(cellIndex <= 0) return;
                focusCell = getVisibleCell(false, cellIndex);
            }
            if (key == 38) {//上
                if(rowIndex <= 0) return;
                var __row = ui.getTBody().rows[rowIndex - 2];
                if(__row == null) return;
                focusCell = __row.cells[cellIndex];
            }
            if (key == 39) {//右
                if(cellIndex <= 0) return;
                focusCell = getVisibleCell(true, cellIndex);
            }
            if (key == 40) {//下
                if(rowIndex <= 0) return;
                var __row = ui.getTBody().rows[rowIndex];
                if(__row == null) return;
                focusCell = __row.cells[cellIndex];
            }

            doFocusInput(focusCell);

            function getVisibleCell(next, __index){
                __index = next ? (__index + 1) : (__index - 1);
                var __cell = row.cells[__index];
                if(__cell == null) return null;
                if(__cell.className.indexOf("hidden") != -1) return getVisibleCell(next, __index);
                return __cell;
            }

            function doFocusInput(cell){
                if(cell == null) return;
                if(cell.parentNode.className.indexOf("empty") != -1) return;
                var inputs = cell.getElementsByTagName("input");
                var inputObj = null;
                for(var i=0;i<inputs.length;i++){
                    var input = inputs[i];
                    if(input.type != "text") continue;
                    inputObj = input;
                    break;
                }

                if(inputObj == null){
                    var selects = cell.getElementsByTagName("select");
                    if(selects == null || selects.length <= 0) return;
                    inputObj = selects[0];
                }

                inputObj.focus();
                control.firePropertyChange(TableEvent.click, new EventObject(ui.getTable(), null, inputObj, TableEvent.click));
                if (e && e.preventDefault){
                    // 阻止默认浏览器动作(W3C)
                    e.preventDefault();
                }else{
                    // IE中阻止函数器默认动作的方式
                    window.event.returnValue = false;
                }
            }
        }

        /**
         * 表格点击事件
         */
        function tableClickEvent(){
            control.firePropertyChange(TableEvent.click, new EventObject(ui.getTable(), null, window.event.srcElement, TableEvent.click));
            if(window.event.srcElement.tagName == "BUTTON") return;
            var lastSelectedIndex = -1;
            try{
                lastSelectedIndex = model.getSelectedRowIndex();
            }catch(e){
            }
            var eventRow = getRowFromEvent(window.event.srcElement);
            if(eventRow == null) return;
            var eventRowIndex = eventRow.rowIndex;
            try {
                control.firePropertyChange(TableEvent.before.selected, new EventObject(ui.getTable(),lastSelectedIndex, eventRowIndex, TableEvent.before.selected));
            } catch (e) {
                return;
            }
            control.firePropertyChange(TableEvent.selected, new EventObject(ui.getTable(), lastSelectedIndex, eventRowIndex, TableEvent.selected));
        }

        /**
         * 获取事件发生的行
         * @param activeElement
         * @returns {*}
         */
        function getRowFromEvent(activeElement){
            var cell = getCellFromEvent(activeElement);
            if(cell == null) return null;
            return cell.parentNode;
        }
        this.getRowFromEvent = getRowFromEvent;
        /**
         * 获取事件发生的列
         * @param activeElement
         * @returns {*}
         */
        function getCellFromEvent(activeElement){
            if(activeElement == null || activeElement.tagName == null || activeElement.tagName.toUpperCase() == "BODY") return null;
            if(activeElement.tagName.toUpperCase() == "TD") return activeElement;
            return getCellFromEvent(activeElement.parentNode);
        }
        this.getCellFromEvent = getCellFromEvent;

        /**
         * 列宽度控制
         */
        function ColumnSizeController(){
            var startX = -1;
            var table = ui.getTable();
            var fixed = table.currentStyle ? table.currentStyle["table-layout"] : document.defaultView.getComputedStyle(table,false)["table-layout"];
            if(fixed!="fixed") return;

            var resizeLine = document.createElement("div");
            resizeLine.className = "resize-line";
            document.body.appendChild(resizeLine);

            if (window.addEventListener){
                table.addEventListener("mousemove",move,false);
                table.addEventListener("mousedown",down,false);
                table.addEventListener("mouseup",up,false);
                resizeLine.addEventListener("mouseup",up,false);
            }else{
                table.attachEvent("onmousemove",move);
                table.attachEvent("onmousedown",down);
                table.attachEvent("onmouseup",up);
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
                if(locked(td)) return;
                if (e.offsetX >= td.clientWidth - 10){
                    td.style.cursor = 'w-resize';
                }else{
                    td.style.cursor = 'default';
                }
                var scrollLeft = table.parentNode.scrollLeft;
                if(td == eventCell && e.x < td.offsetLeft - scrollLeft + 30) {
                    table.mousedown = false;
                }else if(eventCell != null && e.x > eventCell.offsetLeft - scrollLeft){
                    table.mousedown = true;
                }
                if (table.mousedown != null && table.mousedown == true) {
                    resizeLine.style.left = e.x + "px";
                }
            }

            function down(){
                var e = window.event || event;
                if(e.button != 0) return;
                var td = e.srcElement;
                if(td == null || !(td.tagName == "TD" || td.tagName == "TH")) return;
                if (e.offsetX <= td.clientWidth - 10) return;
                if(locked(td)) return;
                eventCell = td;
                startX = e.offsetX;
                resizeLine.style.display = "block";
                table.mousedown = true;
                var scrollLeft = table.parentNode.scrollLeft;
                var marginLeft = table.parentNode.style.marginLeft;
                marginLeft = marginLeft == null || marginLeft == "" ? 0 : parseInt(marginLeft);
                var top = $(table).offset().top;
                var left = td.offsetLeft - marginLeft + scrollLeft + td.offsetWidth + 7;
                resizeLine.style.left = left + "px";
                resizeLine.style.top = top + "px";
                resizeLine.style.height = table.offsetHeight + "px";
            }

            function up(){
                resize();
                table.mousedown = false;
                resizeLine.style.display = "none";
                startX = -1;
                eventCell = null;
            }

            function resize(){
                if(eventCell == null) return;
                var e = window.event || event;
                var index = eventCell.cellIndex;
                var th = table.rows[0].cells[index];
                if(th == null || locked(th)) return;
                var scrollLeft = table.parentNode.scrollLeft;
                var marginLeft = table.parentNode.style.marginLeft;
                marginLeft = marginLeft == null || marginLeft == "" ? 0 : parseInt(marginLeft);
                var width = e.x - marginLeft + scrollLeft - eventCell.offsetLeft - 7;
                th.style.width = width + "px";
            }

            function locked(source){
                try {
                    return source.className.indexOf("locked") != -1;
                }catch(e){
                    return false;
                }
            }
        }

        /**
         * 增加一个监听器
         * @method addListener
         * @param event 监听器的类型
         * @param listener 监听器回调函数名称
         */
        function AddListener(event, listener){
            listeners.push([event, listener]);
        }
        this.addListener = AddListener;

        /**
         * 通知监听器
         */
        function FirePropertyChangeListeners(event, eventObj){
            for(var i=0;i<listeners.length;i++){
                if(listeners[i][0] != event) continue;
                //try{
                    listeners[i][1](eventObj);
                //}catch(e){
                    //do nothing
                //}
            }
        }
        this.firePropertyChange = FirePropertyChangeListeners;

        /**
         * 初始化网格数据的方法
         */
        this.initData = function(call){
            if(dataInitialized) return;
            model.fullAjaxData(null, call);
            dataInitialized = true;
        };

        /**
         * 验证数据
         */
        this.verify = function(){
            ui.hiddenMessage();
            if(params.table.readable) return true;
            var required = params.table.required;
            if(typeof(required) == "string"){
                required = (params.table.required == "true");
            }
            if(!required) return true;
            var message = "";
            var data = model.getData(function(cell, column, value){
                try {
                    FirePropertyChangeListeners(TableEvent.verify, new EventObject(cell, column, value, TableEvent.verify));
                    notNullVerify(cell, column, value);
                }catch(e){
                    focusErrorInputObject(cell);
                    ui.showMessage(e.message, "error");
                    throw new Error(e);
                }
            });

            if(data == null || data.length <= 0){
                message = "请完成 <b>" + params.table.name + "</b> 表格！";
                ui.showMessage(message, "error");
                throw new Error(message);
            }
            return true;

            function notNullVerify(cell, column, value){
                cell.className = cell.className.replace(" error", "");
                if(!column.required || value != "") return;
                cell.className += " error";
                var message = "第 " + cell.parentNode.rowIndex + " 行 <b>" + column.name + "</b> 不能为空!";
                throw new Error(message);
            }

            function focusErrorInputObject(cell){
                if(cell.style.display == "none") return;
                var inputs = cell.getElementsByTagName("input");
                for(var i=0;i<inputs.length;i++){
                    if(inputs[i].type == "text"){
                        inputs[i].focus();
                        return;
                    }
                }
                var selects = cell.getElementsByTagName("select");
                try{
                    selects[0].focus();
                }catch(e){}
            }
        };
    }
}

/**
 * 网格面板的一个事件,可以使用 Grid.addListener(GridEvent, callback)定义一些事件
 * @static
 * @module grid
 * @class GridEvent
 * @type {Object} {add: string, selected: string, complete: string}
 */
var GridEvent = {add : "add", selected : "selected", complete:"complete"};
var Grid = new function(){
    //当前页面上所有表格组件的Map集合
    var map = new HashMap();
    var panel;
    //多个表格的切换条
    var bar;
    var barItems;
    //面板消息提示容器
    var message;
    //一个二维的监听器数组
    var listeners = [];

    /**
     * 通知监听器
     * @event 监听器的类型
     * @eventObj 事件对象
     */
    function firePropertyChange(event, eventObj){
        for(var i=0;i<listeners.length;i++){
            if(listeners[i][0] != event) continue;
            try{
                listeners[i][1](eventObj);
            }catch(e){
                //do nothing
            }
        }
    }

    //切换选择对像
    var Selection = new function(){
        var lastSelectionObj = null;
        this.select = function(obj, noEvent){
            var li = obj;
            if(typeof(obj) == "number"){
                li = barItems[obj];
            }else if(typeof(obj) == "string"){
                li = barItems[obj + "_btn"];
            }
            if(lastSelectionObj != null) {
                lastSelectionObj.className = "";
                display(lastSelectionObj.id, false);
            }

            li.className = "selected";
            display(li.id, true);

            if(!noEvent) {
                //firePropertyChange(GridEvent.selected, new EventObject(bar, lastSelectionObj, li));
            }

            lastSelectionObj = li;

            if(window.name != "lightbox_iframe_body"){
                try{
                    parent.FSC.resize();
                }catch(e){
                }
            }
        };

        function display(id, bol){
            var table = map.get(id.replace("_btn", ""));
            if(table == null) return;
            var component = table.getUI().getComponent();
            component.style.display = bol ? "block" : "none";
        }
    };
    this.selection = Selection;

    AddEventListener(GridEvent.add, function(eventObj){
        //var id = eventObj.newValue.id.replace("_btn", "");
        //var __table = map.get(id);
        var __table = eventObj.newValue;
        if(__table == null) return;
        if(__table.param.table.belong != null) {
            belong.invoke(__table)
        }else{
            __table.getControl().initData(function(){
                firePropertyChange(GridEvent.complete, eventObj);
            });
        }
    });

    /**
     * 增加一个监听器
     * @param event
     * @param listener
     */
    function AddEventListener(event, listener){
        listeners.push([event, listener]);
    }
    this.addListener = AddEventListener;

    /**
     * 父子表数据处理
     * @type {belong}
     */
    var belong = new function(){
        var tables = new HashMap();
        var defaultMsg = "子表，通过 上一行/下一行 按钮显示数据";
        this.pre = function(eventObj, tableObject){
            var belongTable = Grid.get(tableObject.table.belong.id);
            var selectedRowIndex = belongTable.getModel().getSelectedRowIndex();
            var row = selectedRowIndex == -1 ? 0 : selectedRowIndex;
            row --;
            if(row < 0) return;
            belongTable.getControl().firePropertyChange(TableEvent.selected, new EventObject(belongTable.getUI().getTable(), selectedRowIndex, row, TableEvent.selected));
        };
        this.next = function(eventObj, tableObject){
            var belongTable = Grid.get(tableObject.table.belong.id);
            var rows = belongTable.getModel().getSize();
            var selectedRowIndex = belongTable.getModel().getSelectedRowIndex();
            var row = selectedRowIndex == -1 ? 1 : selectedRowIndex;
            row ++;
            if(row > rows) return;
            belongTable.getControl().firePropertyChange(TableEvent.selected, new EventObject(belongTable.getUI().getTable(), selectedRowIndex, row, TableEvent.selected));
        };
        this.remove = function(eventObj, tableObject){
            var belongTableRow = eventObj.newValue;
            var targetContainerId = tableObject.table.id + "_" + belongTableRow.inputArrayIndex;
            tables.remove(targetContainerId);
            var targetContainer = tables.get(targetContainerId);
            var table = Grid.get(ToParamId(tableObject.table.id));
            if(targetContainer != null){
                table.getComponent().removeNode(targetContainer);
            }
            table.getUI().getListControlPanel().hidden();
        };

        function doInvoke(currTable){
            currTable.getUI().showSnapshot(defaultMsg);
            var belongTable = Grid.get(ToParamId(currTable.param.table.belong.id));
            if(belongTable == null) return;
            var belongTableRowIndex = belongTable.getModel().getSelectedRowIndex();
            belongTableRowIndex = belongTableRowIndex <= 0 ? 1 : belongTableRowIndex;
            var belongTableRowData = belongTable.getUI().getRowData(belongTableRowIndex - 1);
            var belongTableRow = belongTable.getUI().getTBody().rows[belongTableRowIndex - 1];

            snapshot();

            if(!currTable.param.table.readable) {
                //setNewInputArrayIndex(currTable.getUI().getTable(), belongTableRow.inputArrayIndex);
                store4old();
                show4new();
            }

            show4remote();
            disabled4control();

            //显示服务端数据
            function show4remote(){
                if(currTable.param.data.owner == null) return;
                var dataInitialized = belongTableRow.dataInitialized == null ? false : belongTableRow.dataInitialized;
                if(dataInitialized) return;
                currTable.getModel().fullAjaxData();
                belongTableRow.dataInitialized = true;
            }

            //显示快照
            function snapshot(){
                currTable.getUI().hiddenMessage();
                var msg = "<b>" + belongTable.param.table.name + "</b> 第 " + belongTableRowIndex + " 行 ：";
                var expression = belongTable.param.table.snapshot;
                expression = expression == null ? "" : expression;
                var regexp = /%\{(.*?)\}/;
                var rs;
                while((rs = regexp.exec(expression)) != null){
                    expression = expression.replace(rs[0], belongTableRowData[rs[1]]);
                }
                msg += expression;
                currTable.getUI().showSnapshot(msg);
            }

            //保存当前表格输入的记录
            function store4old(){
                //var currTableInputsIndex = belongTableRow.inputArrayIndex;
                var exp = "";
                eval("exp=/name=\"" + belongTable.param.table.field + "\\[(.*?)\\](.*?)\"/;");
                var currTableInputsIndex = currTable.getUI().getTBody().rows[0].innerHTML.match(exp)[1];
                currTableInputsIndex = currTableInputsIndex == -1 ? 0 : currTableInputsIndex;
                var targetContainerId = currTable.param.table.id + "_" + currTableInputsIndex;
                var targetContainer = getContainer(targetContainerId);
                var data = currTable.getModel().getData();
                targetContainer.data = data;
                //将当前表格转换成HTML输入控件，并放入容器中
                var currTableHtmlCopy = currTable.getUI().getTable().outerHTML;
                //var exp = "";
                //eval("exp=/name=\"" + belongTable.param.table.field + "\\[(\\d+)\\](.*?)\"/;");
                //currTableHtmlCopy = currTableHtmlCopy.replace(exp, "name=\"" + belongTable.param.table.field + "[" + currTableInputsIndex + "]$2\"");
                targetContainer.innerHTML = currTableHtmlCopy;
                //setNewInputArrayIndex(targetContainer.getElementsByTagName("table")[0]);
            }

            //重新显示 belong 表格已选择行的数据
            function show4new(){
                var currTableInputsIndex = belongTableRow.inputArrayIndex;
                var targetContainerId = currTable.param.table.id + "_" + currTableInputsIndex;
                var targetContainer = getContainer(targetContainerId);
                var data = targetContainer.data;
                currTable.getModel().setData(data);
                //setNewInputArrayIndex(currTable.getUI().getTBody());
            }

            //禁用/启用控制按钮
            function disabled4control(){
                var belongTableSelectedRowIndex = belongTable.getModel().getSelectedRowIndex();
                belongTableSelectedRowIndex = belongTableSelectedRowIndex <= -1 ? 1 : belongTableSelectedRowIndex;
                currTable.getUI().getBelongPreButton().disabled = belongTableSelectedRowIndex <= 1;
                currTable.getUI().getBelongNextButton().disabled = belongTableSelectedRowIndex >= belongTable.getModel().getSize();
            }

            function getContainer(id){
                var container = tables.get(id);
                if(container == null){//如果当前行没有容器就创建一个新的容量
                    container = document.createElement("div");
                    container.style.display = "none";
                    currTable.getUI().getComponent().appendChild(container);
                    tables.put(id, container);
                }
                return container;
            }
        }
        this.invoke = doInvoke;
    };

    /**
     * 通过表格参数集初始化一个表格
     * @param __params 表格的参数对象
     * @param unVerify 是否校验表体，默认校验
     */
    this.append = function(__params,unVerify){
        var table = new TableInitializer(__params);
        map.put(ToParamId(__params.table.id), table);

        if(__params.table.belong != null) {
            var belongTable = Grid.get(ToParamId(__params.table.belong.id));
            __params.table.belong.obj = belongTable;
            __params.data.owner = belongTable.param.data.owner;
            table.getUI().getBelongPreButton().onclick = function(){
                belong.pre(this, __params);
            };
            table.getUI().getBelongNextButton().onclick = function(){
                belong.next(this, __params);
            };
            belongTable.getControl().addListener(TableEvent.remove, function (eventObj) {
                belong.remove(eventObj, __params)
            });
            belongTable.getControl().addListener(TableEvent.selected, function (eventObj) {
                var __table = Grid.get(ToParamId(__params.table.id));
                belong.invoke(__table);
            });
        }else{
            //TODO
        }
        firePropertyChange(GridEvent.add, new EventObject(panel, null, table, GridEvent.add));
        if (!unVerify || unVerify == null){
            try {
                HqSoftFormFieldValidator.addListener(HqSoftFormFieldValidator.ValidatorEvent.after, function () {
                    Verify(ToParamId(__params.table.id));
                });
            }catch(e){}
        }
        if(panel != null) return;
        panel = document.getElementById("table-panel");
        message = panel.getElementsByTagName("em")[0];
        bar = panel.getElementsByTagName("ul")[0];
        barItems = bar.getElementsByTagName("li");
        for(var i=0;i<barItems.length;i++){
            barItems[i].onclick = function(){
                Selection.select(this);
            };
        }
        Selection.select(barItems[0]);
    };

    /**
     * 获取一个表格对象
     */
    this.get = function(id){
        return map.get(id);
    };

    /**
     * 默认的选择数据后回调方法
     * @param data
     * @constructor
     */
    this.DefaultDataSelectionCallback = function(data){
        //var currGrid = Grids.curr;
        //if(currGrid == null) return;
        //currGrid.add(data);
    };

    /**
     * 验证数据
     * @param id
     */
    function Verify(id){
        var table = map.get(id);
        if(table == null) return;
        if(table.param.table.belong == null || table.param.table.belong.id == null) {
            try {
                return table.getControl().verify();
            } catch (e) {
                Selection.select(id, true);
                throw e;
            }
        }
        var required = table.param.table.required;
        if(typeof(required) == "string"){
            required = (table.param.table.required == "true");
        }
        if(!required) return true;
        var belongTable = Grid.get(table.param.table.belong.id);
        if(belongTable == null) {
            alert("表格 " + table.param.table.name + " 找不到从属关系");
            return false;
        }
        var rows = belongTable.getUI().getTBody().rows;
        for(var i=0;i<rows.length;i++){
            table.getModel().setAjaxAsync(false);
            belongTable.getControl().firePropertyChange(TableEvent.selected, new EventObject(belongTable.getUI(), (i-1), i, TableEvent.selected));
            table.getModel().setAjaxAsync(true);
            try {
                table.getControl().verify();
            } catch (e) {
                Selection.select(id, true);
                throw e;
            }
        }
        return true;
    }

    /**
     * 将HTML元素的ID转换成参数ID
     * @param elementId
     * @returns {XML|string|void|*}
     */
    function ToParamId(elementId){
        return elementId.replace("_table", "");
    }
    this.toParamId = ToParamId;
};

/**
 * 一个开放给开发人员的函数集
 * @module grid
 * @static
 * @class GridHelper
 * @type {{add: Function, getGrid: Function, getTable: Function, update: Function, getRow: Function, removeRow: Function, addVerifyListener: Function}}
 */
var GridHelper = {
    /**
     * 增加一个网格
     * @method add
     * @param gridId 网格的ID
     * @param dataObj 初始填充的数据
     * @returns TableInitializer
     */
    add : function(gridId, dataObj){
        return Grid.get(Grid.toParamId(gridId)).getModel().add(dataObj);
    },
    /**
     * 获取网格对象，注：不是HTMLElement对象
     * @method getGrid
     * @param obj 网格的HTMLTableElement 对象
     * @returns TableInitializer
     */
    getGrid : function(obj){
        var table = GridHelper.getTable(obj);
        if(table == null) return null;
        var gridId = table.parentNode.parentNode.parentNode.id;
        return Grid.get(Grid.toParamId(gridId));
    },
    /**
     * 获取表格
     * @method getTable
     * @param obj 可以是该表格中的任何一个元素
     * @returns HTMLTableElement
     */
    getTable : function(obj){
        if(obj == null) return null;
        if(obj.tagName == "TABLE"){
            return obj;
        }
        return GridHelper.getTable(obj.offsetParent);
    },
     /**
      * 更新表格数据，该方法常用于多选参照
     * @method update
     * @param eventObj 事件响应对像
     * @param datas JS 数据数组
     * @param callback 回调函数，执行回调函数时会将两个参数（inputObjects, dataRow）赋于回调函数体
      * @example
      * 多选参照更新数据
      * function calla(inputObjects, dataRow){<br>
      *     inputObjects['id']=dataRow.id;<br>
      *     inputObjects['name']=dataRow.name;<br>
      *     inputObjects['sex']=dataRow.sex;<br>
      *     inputObjects['age']=dataRow.age;<br>
      *     ...<br>
      * }
     */
    update : function(eventObj, datas, callback){
        var row = GridHelper.getRow(eventObj);
        var rowIndex = row.rowIndex;
        var table = GridHelper.getGrid(row);
        table.getUI().getListControlPanel().hidden();
        for(var i=0;i<datas.length;i++){
            row = table.getUI().getTBody().rows[(rowIndex) + i - 1];
            if(row == null || row.className == "empty"){
                table.getModel().add({});
                row = table.getUI().getTBody().rows[(rowIndex) + i - 1];
            }
            row.className = row.className.replace("empty","");
            var inputsObject = {};
            var inputs = row.getElementsByTagName("input");
            inputsObject = mergeNodeList(inputsObject, inputs);
            var selects = row.getElementsByTagName("select");
            inputsObject = mergeNodeList(inputsObject, selects);
            var textareas = row.getElementsByTagName("textarea");
            inputsObject = mergeNodeList(inputsObject, textareas);
            try {
                callback(inputsObject, datas[i]);
            }catch(e){
                alert(e);
            }
        }

        function mergeNodeList(source, target){
            for(var i=0;i<target.length;i++){
                var id = target[i].id;
                if(id == null || id == "") continue;
                source[id] = target[i];
            }
            return source;
        }
    },

    /**
     * 获取行
     * @method getRow
     * @param obj 可以是该行的任何一个元素
     * @returns HTMLTableRowElement
     */
    getRow : function(obj){
        if(obj == null) return null;
        if(obj.tagName == "TR"){
            return obj;
        }
        return GridHelper.getRow(obj.parentNode);
    },
    /**
     * 删除行
     * @method removeRow
     * @param rowElement 需要被删除的行 HtmlTableRowElement
     */
    removeRow : function(rowElement){
        var table = GridHelper.getTable(rowElement);
        if(table == null) return;
        var gridId = table.parentNode.parentNode.parentNode.id;
        Grid.get(Grid.id(gridId)).getModel().remove(rowElement.rowIndex);
        parent.FSC.resize();
    },
    /**
     * 增加一个表格数据验证器
     * @method addVerifyListener
     * @param id 网格的ID
     * @param listener 验证器
     */
    addVerifyListener : function(id, listener){
        if(id == null || listener == null) return;
        var table = Grid.get(id);
        if(table == null) return;
        table.getControl().addListener(TableEvent.verify, listener);
    }
};