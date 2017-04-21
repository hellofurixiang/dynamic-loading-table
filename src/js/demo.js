export default {
  name: 'mainDiv',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      msg1: '我的vue:' + this.$route.params.id
    }
  }
}
