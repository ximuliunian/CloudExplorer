import { createRouter, createWebHashHistory } from "vue-router";

import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/:urlParams*',
        name: 'home',
        component: () => import('@/views/home/index.vue')
    },
    {
        path: '/add',
        name: 'add',
        component: () => import('@/views/addFile/index.vue'),
    }
]

export default createRouter({
    history: createWebHashHistory(), // 开始专用
    // history: createWebHistory(import.meta.env.BASE_URL),    // 正式使用
    routes: routes,
})