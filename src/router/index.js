import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Dhtml from '../views/dhtml.vue'
import Highcharts from '../views/highcharts.vue'
import Frappe from '../views/frappe.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dhtml',
    name: 'Dhtml',
    component: Dhtml
  },
  {
    path: '/highcharts',
    name: 'Highcharts',
    component: Highcharts
  },
  {
    path: '/frappe',
    name: 'Frappe',
    component: Frappe
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

