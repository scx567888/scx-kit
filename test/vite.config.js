import vuePlugin from '@vitejs/plugin-vue';
import {scxIconPlugin} from '../scx-icon-vite-plugins.js';

export default {
    base: './',
    plugins: [vuePlugin(), scxIconPlugin({type: 'js', svgRoot: ['a']})]
}