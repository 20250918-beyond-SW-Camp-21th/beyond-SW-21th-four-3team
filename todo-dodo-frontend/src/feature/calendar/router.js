/* 각 기능별 라우팅 내용이 작성될 파일 */
import CalendarView from "@/feature/calendar/views/CalendarView.vue";

export const calendarRoutes = [
    {
        path: '/calendar',
        name: 'calendar',
        component: CalendarView
    }
];
