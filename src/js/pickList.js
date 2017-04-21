export default {
  name: 'mainDiv',
  data () {
    return {
      butItems: [
        [
          {
            'name': '新增',
            'remark': '创建新的盘点单信息',
            'icon': 'add.png',
            'target': '',
            'id': 'add',
            'disabled': true,
            'url': '/ware/operate-checkInventory------default------.form'
          },
          {
            'name': '修改',
            'remark': '修改',
            'icon': 'edit.png',
            'target': '_top',
            'id': 'edit',
            'disabled': false,
            'url': '/ware/operate-checkInventory--8807151083781623808----default------.form'
          }
        ],
        [
          {
            'name': '删除',
            'remark': '删除这条记录，删除后将永不能找回',
            'icon': 'delete.png',
            'target': '_js',
            'id': 'delete',
            'disabled': true,
            'url': 'jaf.del.confirm(\'\',\'/ware/operate-checkInventory-del-8807151083781623808----default-2RlAQa/9QjU5KIevkcw57w==-----.form\');'
          }
        ],
        [
          {
            'name': '保存',
            'remark': '保存表单',
            'icon': 'save.png',
            'target': '_js',
            'id': 'save',
            'disabled': false,
            'url': 'OBF.save()'
          },
          {
            'name': '放弃',
            'remark': '放弃当前操作',
            'icon': 'undo.png',
            'target': '_js',
            'id': 'undo',
            'disabled': false,
            'url': 'OBF.undo()'
          }
        ],
        [
          {
            'name': '审核',
            'remark': '将该单据锁定，不可修改',
            'icon': 'audit.png',
            'target': '_top',
            'id': 'audit',
            'disabled': true,
            'url': '/ware/operate-checkInventory-audit-8807151083781623808----default-2RlAQa/9QjU5KIevkcw57w==-----.form'
          },
          {
            'name': '弃审',
            'remark': '弃审该单据',
            'icon': 'unaudit.png',
            'target': '_top',
            'id': 'unaudit',
            'disabled': true,
            'url': '/ware/operate-checkInventory-unaudit-8807151083781623808----default-2RlAQa/9QjU5KIevkcw57w==-----.form'
          }
        ],
        [
          {
            'name': '查找',
            'remark': '查找某一条记录',
            'icon': 'search.png',
            'target': '_js',
            'id': 'search',
            'disabled': true,
            'url': 'OBF.search(\'/ware/browse-selection-402858815b5ac1fa015b5ad180c80000----0-0-0-0-0-.report?flag=sign\')'
          },
          {
            'name': '列表',
            'remark': '盘点单 的数据列表',
            'icon': 'list.png',
            'target': '_js',
            'id': 'list',
            'disabled': true,
            'url': 'OBF.list(\'/ware/browse--402858815b5ac1fa015b5ad183d50001----0-0-0-0-0-.report\', \'盘点单\')'
          },
          {
            'name': '刷新',
            'remark': '刷新当前页数据',
            'icon': 'refresh.png',
            'target': '_js',
            'id': 'refresh',
            'disabled': false,
            'url': 'OBF.refresh(\'/ware/operate-checkInventory--%8807151083781623808----default------.form\')'
          }
        ],
        [
          {
            'name': '首条',
            'remark': '第一条记录',
            'icon': 'first.png',
            'target': '_url',
            'id': 'first',
            'disabled': true,
            'url': '/ware/operate-checkInventory-open-8807151083781623808----default------.form'
          },
          {
            'name': '上条',
            'remark': '上一条记录',
            'icon': 'pre.png',
            'target': '_url',
            'id': 'pre',
            'disabled': true
          },
          {
            'name': '下条',
            'remark': '下一条记录',
            'icon': 'next.png',
            'target': '_url',
            'id': 'next',
            'disabled': true
          },
          {
            'name': '末条',
            'remark': '最后一条记录',
            'icon': 'last.png',
            'target': '_url',
            'id': 'last',
            'disabled': true,
            'url': '/ware/operate-checkInventory-open-8807151083781623808----default------.form'
          }
        ]
      ],
      columns: [
        {'id': 'inventory', 'name': '存货档案', 'hidden': true, 'required': true},
        {
          'id': 'inventory.arcCode',
          'name': '存货编码',
          'clazz': 'String',
          'required': true
        },
        {'id': 'inventory.arcName', 'name': '存货名称', 'clazz': 'String'},
        {
          'id': 'inventory.invSpec',
          'name': '规格型号',
          'clazz': 'String'
        },
        {
          'id': 'inventory.mainUnit',
          'name': '主单位',
          'hidden': true,
          'required': true
        },
        {'id': 'inventory.mainUnit.arcName', 'name': '主单位', 'clazz': 'String'},
        {
          'id': 'quantity',
          'name': '盘点数量',
          'clazz': 'BigDecimal',
          'required': true
        },
        {'id': 'bookAdjustmentQty', 'name': '账面数量', 'clazz': 'BigDecimal'},
        {
          'id': 'barcodeDetail',
          'name': '扫码明细',
          'clazz': 'String'
        },
        {'id': 'price', 'name': '价格', 'clazz': 'BigDecimal', 'hidden': true},
        {
          'id': 'checkInventoryAmount',
          'name': '盘点金额',
          'clazz': 'BigDecimal',
          'hidden': true
        },
        {'id': 'profitOrLossQty', 'name': '盈亏数量', 'clazz': 'BigDecimal'},
        {
          'id': 'profitOrLossAmount',
          'name': '盈亏金额',
          'clazz': 'BigDecimal',
          'hidden': true
        },
        {'id': 'batchNumber', 'name': '批号', 'clazz': 'String'},
        {
          'id': 'productionDate',
          'name': '生产日期',
          'clazz': 'Date'
        },
        {'id': 'shelfLife', 'name': '保质期', 'clazz': 'Integer'},
        {
          'id': 'shelfLifeUnit',
          'name': '保质期单位',
          'clazz': 'String'
        },
        {'id': 'expiryDate', 'name': '失效日期', 'clazz': 'Date'},
        {
          'id': 'isReplay',
          'name': '需复盘',
          'clazz': 'Boolean',
          'hidden': true
        },
        {'id': 'replayStatus', 'name': '复盘状态', 'clazz': 'String', 'hidden': true}
      ]
    }
  },
  methods: {
    initData: function () {
      Grid.append({
        'data': {
          'owner': '8807151083781623808',
          'initialized': false,
          'ft': 'default'
        },
        'table': {
          'name': '盘点单表体',
          'required': 'true',
          'readable': false,
          'id': 'checkInventoryDetail_table',
          'field': 'parameter.checkInventory.checkInventoryDetail',
          'parameters': {}
        },
        'columns': this.columns
      })
    }
  }
}
