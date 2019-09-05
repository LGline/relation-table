import Vue from 'vue'
import App from './App.vue'
import { Pagination, Dialog, Button } from 'element-ui';

Vue.config.productionTip = false

Vue.prototype.$ELEMENT = { size: 'small' };
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Button)

new Vue({
  render: h => h(App),
}).$mount('#app')
