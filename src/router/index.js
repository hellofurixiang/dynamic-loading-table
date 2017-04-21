import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Demo from '@/components/Demo'
import PickList from '@/components/PickList'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/PickList',
      name: 'PickList',
      component: PickList
    },
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/demo/:id',
      name: 'Demo',
      component: Demo
    }
  ]
})
