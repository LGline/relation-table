import Vue from 'vue'
import App from './App.vue'
import RelationTable from '../packages/index'

Vue.config.productionTip = false
Vue.use(RelationTable)

new Vue({
  render: h => h(App),
}).$mount('#app')
