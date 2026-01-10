import TodoView from './views/TodoView.vue'
import TodoWriteView from './views/TodoWriteView.vue'

export const todoRoutes = [
    {
        path: '/todo',
        name: 'todo',
        component: TodoView
    },
    {
        path: '/todo/write',
        name: 'todo-write',
        component: TodoWriteView
    },
    {
        path: '/todo/edit/:id',
        name: 'todo-edit',
        component: TodoWriteView
    }
]
