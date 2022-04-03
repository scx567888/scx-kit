import {createRouter, createWebHashHistory} from "vue-router";

const ScxRouter = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('./views/home.vue'),
        },
        {
            path: '/scx-drag-test',
            name: 'scx-drag-test',
            component: () => import('./views/scx-drag-test.vue'),
        },
        {
            path: '/scx-contextmenu-test',
            name: 'scx-contextmenu-test',
            component: () => import('./views/scx-contextmenu-test.vue'),
        },
        {
            path: '/scx-eventbus-test',
            name: 'scx-eventbus-test',
            component: () => import('./views/scx-eventbus-test.vue'),
        },
        {
            path: '/scx-icon-test',
            name: 'scx-icon-test',
            component: () => import('./views/scx-icon-test.vue'),
        },
        {
            path: '/scx-xlsx-test',
            name: 'scx-xlsx-test',
            component: () => import('./views/scx-xlsx-test.vue'),
        },
        {
            path: '/scx-crud-test',
            name: 'scx-crud-test',
            component: () => import('./views/scx-crud-test.vue'),
        }, {
            path: '/scx-group-test',
            name: 'scx-group-test',
            component: () => import('./views/scx-group-test.vue'),
        },
        {
            path: '/listToTree-test',
            name: 'listToTree-test',
            component: () => import('./views/listToTree-test.vue'),
        },
        {
            path: '/scx-fss-test',
            name: 'scx-fss-test',
            component: () => import('./views/scx-fss-test.vue'),
        },
    ]
});

export {ScxRouter}