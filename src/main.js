/*
 * @Author: Liang Liang
 * @Date: 2025-11-13 09:42:32
 * @Description:
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import GanttChart from 'vue-gantt-chart'
import 'vue-gantt-chart/lib/vue-gantt-chart.css'

Vue.use(GanttChart)
Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
