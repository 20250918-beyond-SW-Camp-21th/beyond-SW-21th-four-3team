import { reactive, computed } from 'vue';
import { todoApi } from '../api/todoApi';

const state = reactive({
    todos: [],
    isLoading: false,
    error: null
});

// Helper to check same date
const isSameDate = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
};

export const useTodoStore = () => {

    // Actions
    const fetchTodos = async () => {
        state.isLoading = true;
        try {
            state.todos = await todoApi.fetchAll();
        } catch (err) {
            state.error = err.message;
        } finally {
            state.isLoading = false;
        }
    };

    const addTodo = async (todoData) => {
        try {
            const newTodo = await todoApi.create(todoData);
            // Optimistic update or refetch. Here we just push since api returns new obj
            state.todos.push(newTodo);
        } catch (err) {
            console.error('Failed to add todo', err);
        }
    };

    const toggleTodoStatus = async (id) => {
        const todo = state.todos.find(t => t.id === id);
        if (todo) {
            // Toggle logic: Todo -> Done, Done -> Todo. (Simplification)
            const newStatus = todo.status === 'Done' ? 'Todo' : 'Done';
            // Optimistic UI update
            todo.status = newStatus;

            try {
                await todoApi.update(id, { status: newStatus });
            } catch (err) {
                // Revert on failure
                todo.status = todo.status === 'Done' ? 'Todo' : 'Done';
                console.error('Failed to toggle status', err);
            }
        }
    };

    // Getters
    const getTodosByDate = (date) => {
        return state.todos.filter(t => isSameDate(t.date, date));
    };

    const eventsForCalendar = computed(() => {
        // Return format expected by Calendar: { date, color }
        // Group by date or just map. If multiple todos on one day, maybe decide color priority.
        return state.todos.map(t => {
            let color = '#d32f2f'; // Default Red
            if (t.status === 'Done') color = '#4caf50'; // Green
            else if (t.status === 'In Progress') color = '#f57c00'; // Orange

            return {
                date: new Date(t.date),
                color
            };
        });
    });

    const statistics = computed(() => {
        const stats = { todo: 0, inProgress: 0, done: 0 };
        state.todos.forEach(t => {
            if (t.status === 'Todo') stats.todo++;
            else if (t.status === 'In Progress') stats.inProgress++;
            else if (t.status === 'Done') stats.done++;
        });
        return stats;
    });

    return {
        state,
        fetchTodos,
        addTodo,
        toggleTodoStatus,
        getTodosByDate,
        eventsForCalendar,
        statistics
    };
};
