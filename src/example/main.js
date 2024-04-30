
import Vue from 'vue'
import App from './App.vue'
import Vue2TinymceComponent from '../components/editor.vue'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN'
Vue.use(ElementUI, {
    locale
})

Vue.component('Vue2Tinymce', Vue2TinymceComponent)

const app = new Vue({
    render: h => h(App),
})
app.$mount('#app')