import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Include Both Helper File with needed methods
import {
    getTaskList as getTaskListApi,
    addNewTask as addNewTaskApi,
    updateTask as updateTaskApi,
    deleteTask as deleteTaskApi,
    getTasks as getTasksApi,
    addNewTasks as addNewTasksApi,
    updateTasks as updateTasksApi,
    deleteTasks as deleteTasksApi
} from "../../helpers/fakebackend_helper";

export const getTaskList = createAsyncThunk("tasks/getTaskList", async () => {
    try {
        const response = getTaskListApi();
        return response;
    } catch (error) {
        return error;
    }
});

export const addNewTask = createAsyncThunk("tasks/addNewTask", async (task) => {
    try {
        const response = addNewTaskApi(task);
        toast.success("Task Added Successfully", { autoClose: 3000 });
        return response;
    } catch (error) {
        toast.error("Task Added Failed", { autoClose: 3000 });
        return error;
    }
});

export const updateTask = createAsyncThunk("tasks/updateTask", async (task) => {
    try {
        const response = updateTaskApi(task);
        toast.success("Task Updated Successfully", { autoClose: 3000 });
        return response;
    } catch (error) {
        toast.error("Task Updated Failed", { autoClose: 3000 });
        return error;
    }
});

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (task) => {
    try {
        const response = deleteTaskApi(task);
        toast.success("Task Updated Successfully", { autoClose: 3000 });
        return { task, ...response };
    } catch (error) {
        toast.error("Task Updated Failed", { autoClose: 3000 });
        return error;
    }
});

// Kanban Board
export const getTasks = createAsyncThunk("tasks/getTasks", async () => {
    try {
        const response = getTasksApi();
        return response;
    } catch (error) {
        return error;
    }
});
export const addCardData = createAsyncThunk("tasks/addCardData", async (card) => {
    try {
        const response = addNewTasksApi(card);
        const data = await response;
        toast.success("Card Add Successfully", { autoClose: 2000 })
        return data;
    } catch (error) {
        toast.error("Card Add Failded", { autoClose: 2000 })
        return error;
    }
})
export const updateCardData = createAsyncThunk("tasks/updateCardData", async (card) => {
    try {
        const response = updateTasksApi(card);
        const data = await response;
        toast.success("Card Update Successfully", { autoClose: 2000 })
        return data;
    } catch (error) {
        toast.error("Card Update Failded", { autoClose: 2000 })
        return error
    }
})
export const deleteKanban = createAsyncThunk("tasks/deleteKanban", async (card) => {
    try {
        const response = deleteTasksApi(card);
        toast.success("Card Delete Successfully", { autoClose: 2000 })
        return response;
    } catch (error) {
        toast.error("Card Delete Failded", { autoClose: 2000 })
        return error;
    }
})