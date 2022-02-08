import {createApp} from 'vue';
import App from './App.vue';
import {ScxRouter} from './router';
import {ScxKitComponentInstaller} from "../../scx-kit-component-installer.js";
import 'scx-icon/register';

createApp(App)
    .use(ScxRouter)
    .use(ScxKitComponentInstaller)
    .mount('#app');