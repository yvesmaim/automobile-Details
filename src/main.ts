import { createApp } from 'vue'
import App from './App.vue'
import components from './components'
import "bootstrap/dist/css/bootstrap.css"
//import router from './router'

createApp(App).mount('#app')

components.forEeach((component: { name: any }) => {
    App.component(component.name, component);
})
//createApp(App).use(router).mount('#app')

import "bootstrap/dist/js/bootstrap.js"