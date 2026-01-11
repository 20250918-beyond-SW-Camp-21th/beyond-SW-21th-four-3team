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
            const response = await todoApi.fetchAll();
            // Map Backend DTO to Frontend Model
            state.todos = response.map(todo => ({
                id: todo.id,
                title: todo.title,
                content: todo.description, // Map description -> content
                date: todo.startDate,      // Map startDate -> date (for legacy view compatibility)
                startDate: todo.startDate,
                startTime: todo.startTime,
                endDate: todo.endDate,
                endTime: todo.endTime,
                allday: todo.allDay, // Backend field is allDay
                daysOfWeek: todo.daysOfWeek,
                repeatUntil: todo.repeatUntilDate,
                priority: todo.priority ? todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1).toLowerCase() : 'Low',
                status: todo.completed ? 'Done' : 'Todo', // Map completed -> status
                color: todo.completed ? '#4caf50' : '#d32f2f' // optional color logic
            }));
        } catch (err) {
            state.error = err.message;
        } finally {
            state.isLoading = false;
        }
    };

    const addTodo = async (todoData) => {
        try {
            console.log('Adding todo:', todoData);

            // Transform to Backend DTO
            // Transform to Backend DTO

            // Map frontend day index (0=Sun) to backend Enum
            const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            const mappedDays = todoData.selectedDays ? todoData.selectedDays.map(i => dayMap[i]) : [];

            const payload = {
                title: todoData.title,
                description: todoData.content,
                startDate: todoData.startDate,
                startTime: todoData.startTime + ':00', // Append seconds
                endDate: todoData.endDate,
                endTime: todoData.endTime + ':00',     // Append seconds
                allday: todoData.allday || false,
                // uppercase for backend Enum
                priority: todoData.priority ? todoData.priority.toUpperCase() : 'LOW',
                completed: false,

                // Repetition Logic
                repeatType: todoData.isRepeat ? 'WEEKLY' : 'NONE',
                daysOfWeek: todoData.isRepeat ? mappedDays : [],
                repeatUntilDate: todoData.isRepeat ? todoData.repeatUntil : null
            };

            const newTodo = await todoApi.create(payload);
            if (newTodo) {
                // Determine color for frontend immediate display
                const color = newTodo.completed ? '#4caf50' : '#d32f2f';

                // Push to state with frontend mapping
                state.todos.push({
                    id: newTodo.id,
                    title: newTodo.title,
                    content: newTodo.description,
                    date: newTodo.startDate,
                    startDate: newTodo.startDate,
                    startTime: newTodo.startTime,
                    endDate: newTodo.endDate,
                    endTime: newTodo.endTime,
                    allday: newTodo.allDay,
                    daysOfWeek: newTodo.daysOfWeek,
                    repeatUntil: newTodo.repeatUntilDate,
                    priority: newTodo.priority ? newTodo.priority.charAt(0).toUpperCase() + newTodo.priority.slice(1).toLowerCase() : 'Low',
                    status: newTodo.completed ? 'Done' : 'Todo',
                    color: color
                });
            }
        } catch (err) {
            console.error('Failed to add todo', err);
            throw err;
        }
    };

    const updateTodo = async (id, todoData) => {
        try {
            console.log('Updating todo:', id, todoData);

            // Transform to Backend DTO (Duplicated from addTodo for safety)
            const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            const mappedDays = todoData.selectedDays ? todoData.selectedDays.map(i => dayMap[i]) : [];

            const payload = {
                title: todoData.title,
                description: todoData.content,
                startDate: todoData.startDate,
                startTime: todoData.startTime.length === 5 ? todoData.startTime + ':00' : todoData.startTime, // Append seconds if needed
                endDate: todoData.endDate,
                endTime: todoData.endTime.length === 5 ? todoData.endTime + ':00' : todoData.endTime,     // Append seconds if needed
                allday: todoData.allday || false,
                priority: todoData.priority ? todoData.priority.toUpperCase() : 'LOW',
                completed: false, // Keep as false or handle logic if needed. 

                // Repetition Logic
                repeatType: todoData.isRepeat ? 'WEEKLY' : 'NONE',
                daysOfWeek: todoData.isRepeat ? mappedDays : [],
                repeatUntilDate: todoData.isRepeat ? todoData.repeatUntil : null
            };

            const updatedTodo = await todoApi.update(id, payload);
            if (updatedTodo) {
                // Update local state
                const numericId = Number(id); // Ensure ID is a number for comparison
                const index = state.todos.findIndex(t => t.id === numericId);
                if (index !== -1) {
                    const color = updatedTodo.completed ? '#4caf50' : '#d32f2f';
                    state.todos[index] = {
                        id: updatedTodo.id,
                        title: updatedTodo.title,
                        content: updatedTodo.description,
                        date: updatedTodo.startDate,
                        startDate: updatedTodo.startDate,
                        startTime: updatedTodo.startTime,
                        endDate: updatedTodo.endDate,
                        endTime: updatedTodo.endTime,
                        priority: updatedTodo.priority ? updatedTodo.priority.charAt(0).toUpperCase() + updatedTodo.priority.slice(1).toLowerCase() : 'Low',
                        status: updatedTodo.completed ? 'Done' : 'Todo',
                        color: color,
                        allday: updatedTodo.allDay,
                        daysOfWeek: updatedTodo.daysOfWeek,
                        repeatUntil: updatedTodo.repeatUntilDate
                    };
                }
            }
        } catch (err) {
            console.error('Failed to update todo', err);
            throw err;
        }
    };

    // Explicitly fetch data for a specific todo (uses list API as backend lacks single GET)
    const getTodo = async (id) => {
        await fetchTodos(); // Ensure fresh data from API
        return state.todos.find(t => t.id === Number(id));
    };

    const toggleTodoStatus = async (id) => {
        const todo = state.todos.find(t => t.id === id);
        if (todo) {
            const newStatus = todo.status === 'Done' ? 'Todo' : 'Done';
            // Optimistic Update
            const originalStatus = todo.status;
            todo.status = newStatus;

            try {
                // Use specific PATCH endpoint for toggling status
                await todoApi.toggleComplete(id, newStatus === 'Done'); // true if Done, false if Todo
            } catch (err) {
                // Revert on failure
                todo.status = originalStatus;
                console.error('Failed to toggle status', err);
            }
        }
    };

    const deleteTodo = async (id) => {
        try {
            await todoApi.delete(id);
            state.todos = state.todos.filter(t => t.id !== id);
        } catch (err) {
            console.error('Failed to delete todo', err);
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
        updateTodo,
        getTodo,
        toggleTodoStatus,
        deleteTodo,
        getTodosByDate,
        getStatistics,
        eventsForCalendar,
        statistics
    };
};
