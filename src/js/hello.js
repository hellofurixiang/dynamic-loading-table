//import util from 'util.js'
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      msg1: '我的vue',
      dataUrl: 'http://172.16.0.111:8080/api/private/bus/barcode/get/barcode/info',
      items: []
    }
  },
  created: function () {
    this.getDemoData()
  },
  methods: {
    toDemo: function () {
      this.$router.push({path: '/demo/eee', params: {id: 111}})
    },
    getDemoData: function () {
      const that = this
      const paramObj = {
        barcode: '100333',
        barcodeType: '货码'
      }
      //util(this.dataUrl, JSON.stringify(paramObj), function (data) {
      //  that.items = data
      //}, function (error) {
      //  alert(error)
      //})
    }
  }
}
