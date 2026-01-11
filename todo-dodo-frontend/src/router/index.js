import { createRouter, createWebHistory } from 'vue-router'
import { calendarRoutes } from "@/feature/calendar/router.js"
import { statisticsRoutes } from "@/feature/statistics/router.js"
import { todoRoutes } from "@/feature/todo/router.js"

const router = createRouter({
    history: createWebHistory(),
    routes: [
        ...calendarRoutes,
        ...statisticsRoutes,
        ...todoRoutes
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    }
})

export default router