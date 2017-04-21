var lang = {};
lang["ok"] = "确定";
lang["close"] = "关闭";
lang["cancel"] = "取消";
lang["delete"] = "删除";
lang["remark"] = "描述";
lang["query"] = "查询";
lang["ago"] = "以前";
lang["refresh"] = "刷新";
lang["view.message"] = "查看消息";
lang["view.bulletin"] = "查看公告";
lang["view.detail"] = "查看详情";
lang["delete.confirm.title"] = "提示";
lang["delete.confirm.message"] = "删除后无法恢复，确认删除%{context}？";
lang["delete.confirm.message.default"] = "";
lang["process.workflow"] = "处理任务";
lang["index.pop.message.title"] = "您有{0}条消息";
lang["index.pop.bulletin.title"] = "您收到{0}条通知";
lang["index.pop.task.title"] = "您有{0}项任务需要处理";
lang["page"] = "页 ";
lang["page.size"] = "每页显示：";
lang["page.jump"] = "转到第 ";
lang["page.curr"] = "当前：";
lang["page.pre"] = "上一页";
lang["page.next"] = "下一页";
lang["column.lock"] = "锁定该列";
lang["column.unlock"] = "取消锁定";
lang["column.hidden"] = "隐藏该列";
lang["field.precept.default"] = "默认";
lang["align.left"] = "左对齐";
lang["align.center"] = "居中";
lang["align.right"] = "右对齐";
lang["public"] = "公开的";
lang["private"] = "私有的";

lang["upload.error"]="文件上传失败";
lang["upload.error.file.ext"] = "不允许上传该类型文件 “{0}”";
lang["upload.error.file.size"] = "文件大小超出了 “{0}” 限制，当前大小 “{1}”";
lang["upload.error.file.size.invalid"]="无法获取文件大小";

lang["export.process"]="处理";
lang["export.process.loading"]=" 正在{0}，请稍候......";

var Lang = new function () {
    this.getText = function (key, params) {
        var value = lang[key];
        if (params == null || !isArray(params)) return value;
        for (var i = 0; i < params.length; i++) {
            value = value.replace("{" + i + "}", params[i]);
        }
        return value;
    };

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
};