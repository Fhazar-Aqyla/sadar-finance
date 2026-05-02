import { createSlice } from "@reduxjs/toolkit";
import { getTaskList, addNewTask, updateTask, deleteTask, updateCardData, deleteKanban, getTasks, addCardData } from './thunk';
export const initialState = {
    taskList: [],
    tasks: [],
};

const TasksSlice = createSlice({
    name: 'TasksSlice',
    initialState,
    reducer: {},
    extraReducers: (builder) => {
        builder.addCase(getTaskList.fulfilled, (state, action) => {
            state.taskList = action.payload.data;
            state.isTaskCreated = false;
            state.isTaskSuccess = true;
        });
        builder.addCase(getTaskList.rejected, (state, action) => {
            state.error = action.payload.error || null;
            state.isTaskCreated = false;
            state.isTaskSuccess = true;
        });
        builder.addCase(addNewTask.fulfilled, (state, action) => {
            state.taskList.unshift(action.payload.data);
            state.isTaskCreated = true;
            state.isTaskAdd = true;
            state.isTaskAddFail = false;
        });
        builder.addCase(addNewTask.rejected, (state, action) => {
            state.error = action.payload.error || null;
            state.isTaskAdd = false;
            state.isTaskAddFail = true;
        });
        builder.addCase(updateTask.fulfilled, (state, action) => {
            state.taskList = state.taskList.map(task =>
                task._id.toString() === action.payload.data._id.toString()
                    ? { ...task, ...action.payload.data }
                    : task
            );
            state.isTaskUpdate = true;
            state.isTaskUpdateFail = false;
        });
        builder.addCase(updateTask.rejected, (state, action) => {
            state.error = action.payload.error || null;
            state.isTaskUpdate = false;
            state.isTaskUpdateFail = true;
        });
        builder.addCase(deleteTask.fulfilled, (state, action) => {
            state.taskList = state.taskList.filter(task => task._id.toString() !== action.payload.task.toString());
            state.isTaskDelete = true;
            state.isTaskDeleteFail = false;
        });
        builder.addCase(deleteTask.rejected, (state, action) => {
            state.error = action.payload.error || null;
            state.isTaskDelete = false;
            state.isTaskDeleteFail = true;
        });

         // Kanban Board
         builder.addCase(getTasks.fulfilled, (state, action) => {
            state.tasks = action.payload;
        });
        builder.addCase(getTasks.rejected, (state, action) => {
            state.error = action.payload ? action.payload?.error : null;
        });
        builder.addCase(addCardData.fulfilled, (state, action) => {
            const existingTaskList = state.tasks.find(
                (kanbanList) => kanbanList.id === action.payload.kanId
            );
            if (existingTaskList) {
                state.tasks = state.tasks.map((kanbanList) => {
                    if (kanbanList.id === action.payload.kanId) {
                        const updatedTaskList = {
                            ...kanbanList,
                            cards: [...kanbanList.cards, action.payload],
                        };
                        return updatedTaskList;
                    }
                    return kanbanList;
                });
            } else {
                state.tasks = [...state.tasks, action.payload];
            }
        });
        builder.addCase(addCardData.rejected, (state, action) => {
            state.error = action.payload.error || null;
        });
        builder.addCase(updateCardData.fulfilled, (state, action) => {
            state.tasks = state.tasks.map((task) => {
                if (task.id === action.payload.kanId) {
                    return {
                        ...task,
                        cards: task.cards.map((card) =>
                            card.id.toString() === action.payload.id.toString()
                                ? { card, ...action.payload }
                                : card
                        ),
                    };
                }
                return task;
            });
        });
        builder.addCase(updateCardData.rejected, (state, action) => {
            state.error = action.payload || null;
        });
        builder.addCase(deleteKanban.fulfilled, (state, action) => {
            state.tasks = state.tasks.map((kanbanList) => {
                const updatedTaskList = {
                    ...kanbanList,
                    cards: kanbanList.cards.filter((task) => {
                        return task.id.toString() !== action.payload.toString();
                    }),
                };
                return updatedTaskList;
            });
        });
        builder.addCase(deleteKanban.rejected, (state, action) => {
            state.error = action.payload.error || null;
        });
    }
});

export default TasksSlice.reducer;