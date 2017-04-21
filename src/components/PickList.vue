<template xmlns:v-bind="http://www.w3.org/1999/xhtml">
  <div id="mainDiv">
    <ul id="operate-btns-bar">
      <li v-for="btnItem in butItems">
        <template v-for="item in btnItem">
          <button type="button" v-bind:title="item.remark" v-bind:disabled="item.disabled">
            <i :style="{backgroundImage: 'url(/static/images/operate-btns/' + item.icon + ')'}"></i>
            {{item.name}}
          </button>
        </template>
      </li>
      <li id="operate-pop-messages"></li>
    </ul>
    <div class="modify-panel audit-true-false status-0">

      <div class="base-info"><i class="arrow-icon"></i><span>基本信息</span></div>
      <div class="panel-border">
        <div class="composite readonly">
          <label title="单据号">单据号</label>
          <div class="input">
            <input type="text" name="parameter.checkInventory.docNo" maxlength="255" value="PD201704100003"
                   readonly="readonly" id="docNo">
            <input type="hidden" name="parameter.checkInventory.generations.docNo" value="docNo">
          </div>
        </div>
        <div class="composite required readonly">
          <label title="盘点日期">盘点日期</label>
          <div class="input">
            <input type="text" name="parameter.checkInventory.docDate" value="2017-04-10" readonly="readonly"
                   id="docDate" onclick="jaf.editor.date(this)">
            <span><button type="button" class="clear-data" onclick="jaf.editor.clear(this)"></button></span>
            <span><button type="button" class="calendar-icon" onclick="jaf.editor.date(this)"></button></span>
          </div>
        </div>
        <input type="hidden" id="warehouse" name="parameter.checkInventory.warehouse.id" value="7288727955043651584">
        <div class="composite required" selected-call="doPushWarehouse" selection="sign"
             reference="%7B%22code%22%3A%22ref_all_warehouse%22%2C%22field%22%3A%22form%40checkInventory.default%40warehouse.arcName%22%2C%22search%22%3A%22arcCode%2CarcName%22%7D"
             selected-relation="{}" search="arcCode,arcName" remove-call="doRemoveWarehouse">
          <label title="盘点仓库">盘点仓库</label>
          <div class="input">
            <input type="text" name="parameter.checkInventory.warehouse.arcName" maxlength="255" value="待退料仓"
                   id="warehouse.arcName" onfocus="jaf.editor.reference.bind(this)">
            <span><button type="button" class="clear-data" onclick="clearWarehouse(this)"></button></span>
            <span><button type="button" class="selector-icon" onclick="jaf.editor.reference.call(this)"></button></span>
          </div>
        </div>
        <div class="composite">
          <label title="备注">备注</label>
          <div class="input">
            <textarea name="parameter.checkInventory.remark" cols="" rows="" id="remark"></textarea>
            <span><button type="button" class="text-area" onclick="jaf.editor.textarea.open(this, '备注', 512)"></button></span>
          </div>
        </div>
      </div>
      <div id="otherDetailTitle" class="other-detail"><i class="arrow-icon"></i><span>其他详情</span></div>
      <div id="table-panel">
        <ul>
          <li id="checkInventoryDetail_btn" class="selected"><strong>盘点单表体</strong></li>
        </ul>
        <div id="checkInventoryDetail_table" style="display:block;" class="table">
          <div class="panel">
            <div class="loading" style="height: 301px; margin-bottom: -301px; line-height: 301px; display: none;"><img
              src="/static/images/ajax-loader.gif" style="vertical-align: middle"> Loading ......
            </div>
            <div class="thead">
              <ul class="events"></ul>
              <div class="snapshot"></div>
              <div class="message"></div>
            </div>
            <div class="tbody">
              <table>
                <thead>
                <tr>
                  <th class="guider locked" style="width:18px;"></th>
                  <th class="events"></th>
                  <th style="width:80px;" class="hidden"><span>*</span> 存货档案</th>
                  <th style="width:80px;"><span>*</span> 存货编码</th>
                  <th style="width:80px;">存货名称</th>
                  <th style="width:80px;">规格型号</th>
                  <th style="width:80px;" class="hidden"><span>*</span> 主单位</th>
                  <th style="width:80px;">主单位</th>
                  <th style="width:80px;"><span>*</span> 盘点数量</th>
                  <th style="width:80px;">账面数量</th>
                  <th style="width:80px;">扫码明细</th>
                  <th style="width:80px;" class="hidden">价格</th>
                  <th style="width:80px;" class="hidden">盘点金额</th>
                  <th style="width:80px;">盈亏数量</th>
                  <th style="width:80px;" class="hidden">盈亏金额</th>
                  <th style="width:80px;">批号</th>
                  <th style="width:80px;">生产日期</th>
                  <th style="width:80px;" class="number">保质期</th>
                  <th style="width:80px;">保质期单位</th>
                  <th style="width:80px;">失效日期</th>
                  <th style="width:80px;" class="hidden">需复盘</th>
                  <th style="width:80px;" class="hidden">复盘状态</th>
                </tr>
                </thead>
                <tbody>
                <tr class="">
                  <td class="guider locked"><span>1</span><input type="hidden"
                                                                 name="parameter.checkInventory.checkInventoryDetail[0].id"
                                                                 value="8807151128476127232"></td>
                  <td class="events"></td>
                  <td class="column hidden"><input type="hidden" id="inventory"
                                                   name="parameter.checkInventory.checkInventoryDetail[0].inventory.id"
                                                   value="7301496742088151040"></td>
                  <td class="column">
                    <div class="composite required nolabel" selected-call="doPushInventory" selection="more"
                         reference="%7B%22code%22%3A%22ref_checkInventory%22%2C%22field%22%3A%22form%40checkInventory.default%40inventory.arcCode%22%2C%22search%22%3A%22invCode%22%2C%22warehouse%22%3A%22%25%7BgetWarehouseId%28%29%7D%22%7D"
                         selected-relation="{'key':'invCode','value':'inventory.arcCode'}" search="invCode"
                         remove-call="doRemoveInventory">
                      <div class="input"><input type="text"
                                                name="parameter.checkInventory.checkInventoryDetail[0].inventory.arcCode"
                                                maxlength="255" value="" id="inventory.arcCode"
                                                onfocus="jaf.editor.reference.bind(this)"><span><button type="button"
                                                                                                        class="clear-data"
                                                                                                        onclick="jaf.editor.reference.clear(this)"></button></span><span><button
                        type="button" class="selector-icon" onclick="jaf.editor.reference.call(this)"></button></span>
                      </div>
                    </div>
                  </td>
                  <td class="column">
                    <div class="composite nolabel readonly">
                      <div class="input"><input type="text"
                                                name="parameter.checkInventory.checkInventoryDetail[0].inventory.arcName"
                                                maxlength="255" value="" readonly="readonly" id="inventory.arcName">
                      </div>
                    </div>
                  </td>
                  <td class="column">
                    <div class="composite nolabel readonly">
                      <div class="input"><input type="text"
                                                name="parameter.checkInventory.checkInventoryDetail[0].inventory.invSpec"
                                                maxlength="255" value="" readonly="readonly" id="inventory.invSpec">
                      </div>
                    </div>
                  </td>
                  <td class="column hidden"><input type="hidden" id="inventory.mainUnit"
                                                   name="parameter.checkInventory.checkInventoryDetail[0].inventory.mainUnit.id"
                                                   value="7289787818083487744"></td>
                  <td class="column">
                    <div class="composite nolabel readonly">
                      <div class="input"><input type="text"
                                                name="parameter.checkInventory.checkInventoryDetail[0].inventory.mainUnit.arcName"
                                                maxlength="32" value="" readonly="readonly"
                                                id="inventory.mainUnit.arcName"></div>
                    </div>
                  </td>
                  <td class="column">
                    <div class="composite required nolabel">
                      <div class="input number"><input type="text"
                                                       name="parameter.checkInventory.checkInventoryDetail[0].quantity"
                                                       maxlength="18" value="" id="quantity" class="noime"
                                                       onkeypress="jaf.text.number(this, 0, 'BigDecimal', 4)"
                                                       onkeydown="jaf.text.onkeydown(this)"
                                                       onchange="jaf.text.fixInput(this)"></div>
                    </div>
                  </td>
                  <td class="column">
                    <div class="composite nolabel readonly">
                      <div class="input number"><input type="text"
                                                       name="parameter.checkInventory.checkInventoryDetail[0].bookAdjustmentQty"
                                                       maxlength="18" value="" readonly="readonly"
                                                       id="bookAdjustmentQty" class="noime"
                                                       onkeypress="jaf.text.number(this, 0, 'BigDecimal', 4)"
                                                       onkeydown="jaf.text.onkeydown(this)"
                                                       onchange="jaf.text.fixInput(this)"></div>
                    </div>
                  </td>
                  <td class="column">
                    <div class="composite nolabel readonly">
                      <div class="input"><input type="text"
                                                name="parameter.checkInventory.checkInventoryDetail[0].barcodeDetail"
                                                maxlength="255" value="" readonly="readonly" id="barcodeDetail"></div>
                    </div>
                  </td>
                  <td class="column hidden"><input type="hidden" id="price"
                                                   name="parameter.checkInventory.checkInventoryDetail[0].price"
                                                   value=""></td>
                  <td class="column hidden"><input type="hidden" id="checkInventoryAmount"
                                                   name="parameter.checkInventory.checkInventoryDetail[0].checkInventoryAmount"
                                                   value=""></td>
                  <td class="column">
                    <div class="composite nolabel readonly">
                      <div class="input number"><input type="text"
                                                       name="parameter.checkInventory.checkInventoryDetail[0].profitOrLossQty"
                                                       maxlength="18" value="" readonly="readonly" id="profitOrLossQty"
                                                       class="noime"
                                                       onkeypress="jaf.text.number(this, 0, 'BigDecimal', 4)"
                                                       onkeydown="jaf.text.onkeydown(this)"
                                                       onchange="jaf.text.fixInput(this)"></div>
                    </div>
                  </td>
                  <td class="column hidden"><input type="hidden" id="profitOrLossAmount"
                                                   name="parameter.checkInventory.checkInventoryDetail[0].profitOrLossAmount"
                                                   value=""></td>
                  <td class="column">
                    <div class="composite nolabel">
                      <div class="input"><input type="text"
                                                name="parameter.checkInventory.checkInventoryDetail[0].batchNumber"
                                                maxlength="255" value="" id="batchNumber"></div>
                    </div>
                  </td>
                  <td class="column">
                    <div class="composite nolabel readonly">
                      <div class="input"><input type="text"
                                                name="parameter.checkInventory.checkInventoryDetail[0].productionDate"
                                                value="" readonly="readonly" id="productionDate"
                                                onclick="jaf.editor.date(this)"><span><button type="button"
                                                                                              class="clear-data"
                                                                                              onclick="jaf.editor.clear(this)"></button></span><span><button
                        type="button" class="calendar-icon" onclick="jaf.editor.date(this)"></button></span></div>
                    </div>
                  </td>
                  <td class="column">
                    <div class="composite nolabel readonly">
                      <div class="input number"><input type="text"
                                                       name="parameter.checkInventory.checkInventoryDetail[0].shelfLife"
                                                       maxlength="11" value="" readonly="readonly" id="shelfLife"
                                                       class="noime"
                                                       onkeypress="jaf.text.number(this, 0, 'Integer', 2)"
                                                       onkeydown="jaf.text.onkeydown(this)"
                                                       onchange="jaf.text.fixInput(this)"></div>
                    </div>
                  </td>
                  <td class="column">
                    <div class="composite nolabel readonly">
                      <div class="input"><input type="text"
                                                name="parameter.checkInventory.checkInventoryDetail[0].shelfLifeUnit"
                                                maxlength="32" value="" readonly="readonly" id="shelfLifeUnit"></div>
                    </div>
                  </td>
                  <td class="column">
                    <div class="composite nolabel readonly">
                      <div class="input"><input type="text"
                                                name="parameter.checkInventory.checkInventoryDetail[0].expiryDate"
                                                value="" readonly="readonly" id="expiryDate"></div>
                    </div>
                  </td>
                  <td class="column hidden"><input type="hidden" id="isReplay"
                                                   name="parameter.checkInventory.checkInventoryDetail[0].isReplay"
                                                   value="N"></td>
                  <td class="column hidden"><input type="hidden" id="replayStatus"
                                                   name="parameter.checkInventory.checkInventoryDetail[0].replayStatus"
                                                   value=""></td>
                </tr>
                </tbody>
              </table>
            </div>
            <div class="footer">
              <div class="page"></div>
            </div>
            <div class="list-control-panel" style="display: none;">
              <div>
                <input class="" type="button" value="新增行"><input class="" type="button" value="复制行">
                <input class="" type="button" value="清空"><input class="" type="button" value="删除行"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="hackbox"></div>
    </div>
    <div class="hackbox"></div>

    <ul class="operate-msg">

      <li>由 黄小珊 于 2017/04/11 14:31:57 创建</li>
      <li>最后由 黄小珊 于 2017/04/13 15:40:22 修改</li>

    </ul>

  </div>
</template>
<style>
  @import "/static/plugins/bootstrap/css/bootstrap.min.css?v=1.1.8";
  @import "/static/plugins/font-awesome/css/font-awesome.min.css?v=1.1.8";
  @import "/static/fonts/style.css?v=1.1.8";
  @import "/static/css/main.css?v=1.1.8";
  @import "/static/plugins/bootstrap-datepicker/datepicker.css?ver=1.1.8";
  @import "/static/css/form.grid.css?ver=1.1.8";
  @import "/static/css/form.editor.css?ver=1.1.8";
</style>
<script src="../js/pickList.js"></script>
<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
<script type="text/javascript">
  if (self.frameElement === null || self.frameElement.tagName !== 'IFRAME') {
    window.location.assign('/index.jhtml')
  }
</script>

<!--<script type="text/javascript">const ctx = ""; const ctp = "/static/";</script>-->
<script type="text/javascript" src="/static/js/jquery.min.js?v=1.1.8"></script>
<script type="text/javascript" src="/static/js/json2.js?v=1.1.8"></script>
<script type="text/javascript" src="/static/js/hqsoft.lang.zh_CN.js?v=1.1.8"></script>
<script type="text/javascript" src="/static/js/hqsoft.api.js?v=1.1.8"></script>
<script type="text/javascript" src="/static/plugins/bootstrap-datepicker/datepicker.js?ver=1.1.8"></script>
<script type="text/javascript" src="/static/plugins/bootstrap-datepicker/datepicker.zh-CN.js?ver=1.1.8"></script>
<script type="text/javascript" src="/static/js/hqsoft.hashmap.js?ver=1.1.8"></script>
<script type="text/javascript" src="/static/js/hqsoft.grid.js?ver=1.1.8"></script>
<script type="text/javascript" src="/static/js/hqsoft.validation.js?ver=1.1.8"></script>
<script type="text/javascript" src="/static/js/hqsoft.editor.bar.js"></script>

