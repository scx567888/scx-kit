import {createApp} from 'vue';
import App from './App.vue';
import {ScxRouter} from './router';
import {ScxComponent} from "../../index.js";
import 'scx-icon/register';

createApp(App)
    .use(ScxRouter)
    .use(ScxComponent)
    .mount('#app');