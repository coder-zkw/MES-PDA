import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vant from 'vant'
import 'vant/lib/index.css'
import 'vant/lib/icon/local.css'

Vue.use(Vant)

const baseUrl = process.env.VUE_APP_BASE_API
Vue.prototype.httpUrl =  baseUrl+'/imes/'
Vue.prototype.killBrowserUrl = baseUrl+ '/smes/'
Vue.prototype.writeUrl = baseUrl+ '/smes/'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
