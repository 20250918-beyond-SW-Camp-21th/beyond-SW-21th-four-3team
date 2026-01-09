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
            const result = await todoApi.fetchAll();
            // result is ApiResult. Assume result.data is the list.
            if (result && result.data) {
                state.todos = result.data.map(t => ({
                    ...t,
                    date: t.startDate ? new Date(t.startDate) : new Date(), // Compatibility map
                    startDate: new Date(t.startDate), // Ensure Date objects for UI handling if needed
                    endDate: t.endDate ? new Date(t.endDate) : null
                }));
            }
        } catch (err) {
            state.error = err.message;
        } finally {
            state.isLoading = false;
        }
    };

    const addTodo = async (todoData) => {
        const { title, content, startDate, endDate, priority } = todoData;
        const tempId = Date.now();

        // Prepare Request DTO
        // Backend expects: startDate (YYYY-MM-DD), startTime (HH:mm:ss), etc.
        const start = new Date(startDate);
        const end = new Date(endDate);

        const formatDate = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const formatTime = (d) => {
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = '00';
            return `${hours}:${minutes}:${seconds}`;
        };

        const requestDto = {
            title: title,
            description: content, // Map content to description
            startDate: formatDate(start),
            startTime: formatTime(start),
            endDate: formatDate(end),
            endTime: formatTime(end),
            allday: false,
            repeatType: 'NONE', // Default
            priority: (priority || 'MEDIUM').toUpperCase(), // Ensure Enum match
            completed: false,
            // daysOfWeek, repeatUntilDate - optional/null
        };

        // UI Optimistic Object
        const newTodo = {
            id: tempId,
            title,
            content, // description
            description: content,
            date: start,
            startDate: start,
            endDate: end,
            status: 'Todo',
            priority: priority || 'Medium',
            completed: false
        };

        try {
            state.todos.push(newTodo);

            const result = await todoApi.create(requestDto);
            // Result is ApiResult<Long> -> result.data is the ID
            const realId = result.data;

            const index = state.todos.findIndex(t => t.id === tempId);
            if (index !== -1) {
                // state.todos[index].id = realId; // Direct assignment works on properties usually
                // But better to replace object or updating ID might be tricky in v-for key
                // Let's rely on re-fetching or just update ID if Vue handles it well.
                // Updating ID in list might cause re-render loop if key changes. 
                // But since it is key, Vue will treat it as new item.
                // It is safer.
                state.todos[index] = { ...state.todos[index], id: realId };
            }
        } catch (err) {
            state.todos = state.todos.filter(t => t.id !== tempId);
            console.error('Failed to add todo', err);
        }
    };

    const toggleTodoStatus = async (id) => {
        const todo = state.todos.find(t => t.id === id);
        if (todo) {
            const oldStatus = todo.status; // 'Todo' or 'Done' logic
            const oldCompleted = todo.completed; // boolean logic

            // Toggle
            const newCompleted = !oldCompleted;
            const newStatus = newCompleted ? 'Done' : 'Todo';

            // Optimistic
            todo.status = newStatus;
            todo.completed = newCompleted;

            try {
                await todoApi.changeCompleted(id, newCompleted);
            } catch (err) {
                // Revert
                todo.status = oldStatus;
                todo.completed = oldCompleted;
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

    // Statistics Helper
    const getStatistics = (rangeType, date) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const filteredTodos = state.todos.filter(t => {
            const tDate = new Date(t.date);
            tDate.setHours(0, 0, 0, 0);

            if (rangeType === 'day') {
                return tDate.getTime() === targetDate.getTime();
            } else if (rangeType === 'week') {
                const day = targetDate.getDay();
                const diff = targetDate.getDate() - day; // Adjusts so Sunday is day 0
                const startOfWeek = new Date(targetDate);
                startOfWeek.setDate(diff);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);

                return tDate >= startOfWeek && tDate <= endOfWeek;
            } else if (rangeType === 'month') {
                return tDate.getMonth() === targetDate.getMonth() &&
                    tDate.getFullYear() === targetDate.getFullYear();
            }
            return false;
        });

        const stats = { todo: 0, inProgress: 0, done: 0 };
        filteredTodos.forEach(t => {
            if (t.status === 'Todo') stats.todo++;
            else if (t.status === 'In Progress') stats.inProgress++;
            else if (t.status === 'Done') stats.done++;
        });
        return stats;
    };

    const statistics = computed(() => {
        // Default to overall stats for backward compatibility or simple view
        // But for the view usage, we will likely call getStatistics directly or use a reactive wrapper in the view.
        // Keeping this as "All Time" stats or removing if unused. 
        // Let's keep it as is for now, but the View will use the function above.
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
        getStatistics,
        eventsForCalendar,
        statistics
    };
};
