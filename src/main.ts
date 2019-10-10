import Vue from 'vue'
import App from './App.vue';
import Buefy from 'buefy';
import router from './router'
import store from './store';

import log from 'electron-log';
log.transports.console.level = 'silly';
log.transports.file.level = 'info';
log.transports.rendererConsole = null;
log.transports.mainConsole = null;

Vue.config.productionTip = false
Vue.use(Buefy);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

