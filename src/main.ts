import Vue from 'vue';
import { createApp } from 'vue'
import BootstrapVue3 from 'bootstrap-vue-3'
import App from './App.vue'
import components from './components'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'

//import router from './router'
createApp(App).use(BootstrapVue3).mount('#app')

components.forEeach((component: { name: any }) => {
    App.component(component.name, component);
})
//createApp(App).use(router).mount('#app')

import "bootstrap/dist/js/bootstrap.js"
