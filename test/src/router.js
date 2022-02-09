import {createRouter, createWebHashHistory} from "vue-router";

const ScxRouter = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/scx-drag-test',
            name: 'scx-drag-test',
            component: () => import('./views/scx-drag-test.vue'),
            meta: {
                icon: 'filled-message',
                perms: []
            },
        },
        {
            path: '/scx-contextmenu-test',
            name: 'scx-contextmenu-test',
            component: () => import('./views/scx-contextmenu-test.vue'),
            meta: {
                icon: 'filled-message',
                perms: []
            },
        },
        {
            path: '/scx-eventbus-test',
            name: 'scx-eventbus-test',
            component: () => import('./views/scx-eventbus-test.vue'),
            meta: {
                icon: 'filled-message',
                perms: []
            },
        },
        {
            path: '/scx-icon-test',
            name: 'scx-icon-test',
            component: () => import('./views/scx-icon-test.vue'),
            meta: {
                icon: 'filled-message',
                perms: []
            },
        },
        {
            path: '/scx-xlsx-test',
            name: 'scx-xlsx-test',
            component: () => import('./views/scx-xlsx-test.vue'),
            meta: {
                icon: 'filled-message',
                perms: []
            },
        },
        {
            path: '/scx-crud-test',
            name: 'scx-crud-test',
            component: () => import('./views/scx-crud-test.vue'),
            meta: {
                icon: 'filled-message',
                perms: []
            },
        }, {
            path: '/scx-group-test',
            name: 'scx-group-test',
            component: () => import('./views/scx-group-test.vue'),
            meta: {
                icon: 'filled-message',
                perms: []
            },
        },
    ]
});

export {ScxRouter}