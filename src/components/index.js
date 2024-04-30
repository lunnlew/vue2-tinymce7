import Vue2TinymceComponent from './editor.vue'
export default {
    Vue2Tinymce: Vue2TinymceComponent,
    install: function (Vue) {
        Vue.component('Vue2Tinymce', Vue2TinymceComponent)
    }
}