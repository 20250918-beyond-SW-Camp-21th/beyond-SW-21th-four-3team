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

            if (!todoData.isRepeat) {
                // 1. Normal Single Todo
                const payload = {
                    title: todoData.title,
                    description: todoData.content,
                    startDate: todoData.startDate,
                    startTime: todoData.startTime + ':00',
                    endDate: todoData.endDate,
                    endTime: todoData.endTime + ':00',
                    allday: todoData.allday || false,
                    priority: todoData.priority ? todoData.priority.toUpperCase() : 'LOW',
                    completed: false,
                    repeatType: 'NONE'
                };

                const newTodo = await todoApi.create(payload);
                if (newTodo) {
                    pushTodoToState(newTodo);
                }
            } else {
                // 2. Routine: Generate Individual Todos
                const start = new Date(todoData.startDate);
                const end = new Date(todoData.repeatUntil);
                const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                const mappedDays = todoData.selectedDays ? todoData.selectedDays.map(i => dayMap[i]) : [];

                // Safety Limit (e.g., 2 years) to prevent infinite loops if data is bad
                const safetyLimit = new Date(start);
                safetyLimit.setFullYear(safetyLimit.getFullYear() + 2);
                const effectiveEnd = end < safetyLimit ? end : safetyLimit;

                const current = new Date(start);
                const promises = [];

                while (current <= effectiveEnd) {
                    const currentDayIndex = current.getDay(); // 0-6
                    const currentDayName = dayMap[currentDayIndex];

                    // Check if current day matches selected days
                    // todoData.selectedDays indices match dayMap indices IF selectedDays are [0,1..] text or indices?
                    // todoStore.js previous code: "const mappedDays = todoData.selectedDays ? todoData.selectedDays.map(i => dayMap[i]) : [];"
                    // So selectedDays are indices.

                    const isMatch = todoData.selectedDays && todoData.selectedDays.includes(currentDayIndex);

                    if (isMatch) {
                        const dateStr = current.toISOString().split('T')[0];

                        const payload = {
                            title: todoData.title,
                            description: todoData.content,
                            startDate: dateStr,
                            startTime: todoData.startTime + ':00',
                            endDate: dateStr, // Single day event for routine instance
                            endTime: todoData.endTime + ':00',
                            allday: todoData.allday || false,
                            priority: todoData.priority ? todoData.priority.toUpperCase() : 'LOW',
                            completed: false,
                            repeatType: 'NONE', // Stored as individual non-repeating items
                            // Keep metadata for UI to recognize it as a routine item
                            repeatUntilDate: todoData.repeatUntil,
                            daysOfWeek: mappedDays
                        };
                        promises.push(todoApi.create(payload));
                    }
                    current.setDate(current.getDate() + 1);
                }

                // Execute all creations
                const results = await Promise.all(promises);
                results.forEach(newTodo => {
                    if (newTodo) pushTodoToState(newTodo);
                });
            }
        } catch (err) {
            console.error('Failed to add todo', err);
            throw err;
        }
    };

    // Helper to push with mapping
    const pushTodoToState = (newTodo) => {
        const color = newTodo.completed ? '#4caf50' : '#d32f2f';
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
            priority: newTodo.priority ? newTodo.priority.charAt(0).toUpperCase() + newTodo.priority.slice(1).toLowerCase() : 'Low',
            status: newTodo.completed ? 'Done' : 'Todo',
            color: color
        });
    }

    const updateTodo = async (id, todoData) => {
        try {
            console.log('Updating todo:', id, todoData);
            // NB: Update logic for "Routine" is tricky now that they are individual.
            // For now, assuming update only affects the single clicked item as per "Individual Todo" nature.

            const payload = {
                title: todoData.title,
                description: todoData.content,
                startDate: todoData.startDate,
                startTime: todoData.startTime.length === 5 ? todoData.startTime + ':00' : todoData.startTime,
                endDate: todoData.endDate,
                endTime: todoData.endTime.length === 5 ? todoData.endTime + ':00' : todoData.endTime,
                allday: todoData.allday || false,
                priority: todoData.priority ? todoData.priority.toUpperCase() : 'LOW',
                completed: false,
                repeatType: 'NONE'
            };

            const updatedTodo = await todoApi.update(id, payload);
            if (updatedTodo) {
                const numericId = Number(id);
                const index = state.todos.findIndex(t => t.id === numericId);
                if (index !== -1) {
                    const color = updatedTodo.completed ? '#4caf50' : '#d32f2f';
                    state.todos[index] = {
                        ...state.todos[index], // Keep existing props
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
                    };
                }
            }
        } catch (err) {
            console.error('Failed to update todo', err);
            throw err;
        }
    };

    // Explicitly fetch data for a specific todo
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

    const deleteRoutine = async (templateTodo) => {
        try {
            // Helper to compare arrays
            const normalizeDays = (days) => {
                if (!days) return '';
                return [...days].sort().join(',');
            };
            const targetDays = normalizeDays(templateTodo.daysOfWeek);

            // Find candidates
            const candidates = state.todos.filter(t => {
                if (t.title !== templateTodo.title) return false;
                if (t.repeatUntil !== templateTodo.repeatUntil) return false;
                if (normalizeDays(t.daysOfWeek) !== targetDays) return false;
                if (t.startTime !== templateTodo.startTime) return false;
                return true;
            });

            if (candidates.length === 0) return;

            if (!confirm(`${candidates.length}개의 반복 일정을 모두 삭제하시겠습니까?`)) return;

            // Execute deletions
            const deletePromises = candidates.map(t => todoApi.delete(t.id));
            await Promise.all(deletePromises);

            // Update State
            const deletedIds = new Set(candidates.map(t => t.id));
            state.todos = state.todos.filter(t => !deletedIds.has(t.id));

        } catch (err) {
            console.error('Failed to delete routine', err);
            await fetchTodos(); // Sync on error
        }
    };

    // Getters
    const getTodosByDate = (date) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        return state.todos.filter(todo => {
            const start = new Date(todo.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(todo.endDate);
            end.setHours(23, 59, 59, 999);

            return targetDate >= start && targetDate <= end;
        });
    };

    const eventsForCalendar = computed(() => {
        const events = [];
        state.todos.forEach(todo => {
            // For multi-day normal todos, expand them here for calendar dots/chips if needed
            // Or if they are single day (like generated routines), just add one.
            const current = new Date(todo.startDate);
            const end = new Date(todo.endDate);

            // Simple loop for spanning days
            while (current <= end) {
                events.push({
                    id: todo.id,
                    title: todo.title,
                    priority: todo.priority || 'Low',
                    status: todo.status,
                    date: new Date(current)
                });
                current.setDate(current.getDate() + 1);
            }
        });
        return events;
    });

    // Statistics Helper
    const getStatistics = (rangeType, date) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // We need to expand todos for statistics too if we want accurate 'Day' stats for routines
        // For 'Day', we can use getTodosByDate logic
        if (rangeType === 'day') {
            const dailyTodos = getTodosByDate(targetDate);
            const stats = { todo: 0, done: 0 };
            dailyTodos.forEach(t => {
                if (t.status === 'Todo') stats.todo++;
                else if (t.status === 'Done') stats.done++;
            });
            return stats;
        }

        // For Week/Month, it's more complex because of overlapping instances.
        // For now, falling back to simple non-expanded logic or previous logic 
        // BUT corrected to filter by checkTodoOnDate implies checking every day in range

        // Simpler approach for now: Use existing logic but beware it doesn't count specific routine instances
        // A proper implementation would require iterating every day of the week/month and summing up.
        // Given the request focus is on Calendar visibility, let's stick to the previous simple logic for Week/Month
        // OR improve it slightly to just check strict overlap for normal todos.

        // Reverting to filteredTodos logic from previous file roughly:
        const filteredTodos = state.todos.filter(t => {
            const tDate = new Date(t.date);
            tDate.setHours(0, 0, 0, 0);

            if (rangeType === 'week') {
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

        const stats = { todo: 0, done: 0 };
        filteredTodos.forEach(t => {
            if (t.status === 'Todo') stats.todo++;
            else if (t.status === 'Done') stats.done++;
        });
        return stats;
    };

    const getTrendData = (rangeType, date) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const data = [];

        if (rangeType === 'day') {
            // Priority Distribution for the day
            const priorities = ['High', 'Medium', 'Low'];
            const dailyTodos = getTodosByDate(targetDate);

            priorities.forEach(p => {
                const count = dailyTodos.filter(t => t.priority === p).length;
                data.push({
                    label: p,
                    count: count,
                    // Use standard priority colors
                    color: p === 'High' ? '#ef5350' : p === 'Medium' ? '#ff9800' : '#bdbdbd'
                });
            });
        } else if (rangeType === 'week') {
            // Weekly Trend (Su - Sa)
            const day = targetDate.getDay();
            const diff = targetDate.getDate() - day;
            const startOfWeek = new Date(targetDate);
            startOfWeek.setDate(diff);

            const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

            for (let i = 0; i < 7; i++) {
                const current = new Date(startOfWeek);
                current.setDate(startOfWeek.getDate() + i);

                const todos = getTodosByDate(current);
                const todoCount = todos.filter(t => t.status === 'Todo').length;
                const doneCount = todos.filter(t => t.status === 'Done').length;

                data.push({
                    label: days[i],
                    todo: todoCount,
                    done: doneCount,
                    total: todoCount + doneCount
                });
            }
        } else if (rangeType === 'month') {
            // Month Trend
            const year = targetDate.getFullYear();
            const month = targetDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 1; i <= daysInMonth; i++) {
                const current = new Date(year, month, i);
                const todos = getTodosByDate(current);
                const todoCount = todos.filter(t => t.status === 'Todo').length;
                const doneCount = todos.filter(t => t.status === 'Done').length;

                data.push({
                    label: i,
                    todo: todoCount,
                    done: doneCount,
                    total: todoCount + doneCount
                });
            }
        }

        return data;
    };

    const statistics = computed(() => {
        const stats = { todo: 0, done: 0 };
        state.todos.forEach(t => {
            if (t.status === 'Todo') stats.todo++;
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
        deleteRoutine,
        getTodosByDate,
        getStatistics,
        getTrendData,
        eventsForCalendar,
        statistics
    };
};
