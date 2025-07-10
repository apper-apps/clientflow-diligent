import { toast } from 'react-toastify';

export const getAllTasks = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "title" } },
        { field: { Name: "priority" } },
        { field: { Name: "status" } },
        { field: { Name: "due_date" } },
        { field: { Name: "total_time" } },
        { field: { Name: "active_timer" } },
        { field: { Name: "time_logs" } },
        { field: { Name: "Tags" } },
        { 
          field: { name: "project_id" },
          referenceField: { field: { Name: "Name" } }
        }
      ],
      orderBy: [
        {
          fieldName: "due_date",
          sorttype: "ASC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords('task', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }
    
    // Transform time tracking data from database format to app format
    const tasks = (response.data || []).map(task => ({
      ...task,
      timeTracking: {
        totalTime: task.total_time || 0,
        activeTimer: task.active_timer ? JSON.parse(task.active_timer) : null,
        timeLogs: task.time_logs ? JSON.parse(task.time_logs) : []
      }
    }));
    
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    toast.error("Failed to fetch tasks");
    return [];
  }
};

export const getTaskById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "title" } },
        { field: { Name: "priority" } },
        { field: { Name: "status" } },
        { field: { Name: "due_date" } },
        { field: { Name: "total_time" } },
        { field: { Name: "active_timer" } },
        { field: { Name: "time_logs" } },
        { field: { Name: "Tags" } },
        { 
          field: { name: "project_id" },
          referenceField: { field: { Name: "Name" } }
        }
      ]
    };
    
    const response = await apperClient.getRecordById('task', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    // Transform time tracking data from database format to app format
    const task = response.data;
    if (task) {
      task.timeTracking = {
        totalTime: task.total_time || 0,
        activeTimer: task.active_timer ? JSON.parse(task.active_timer) : null,
        timeLogs: task.time_logs ? JSON.parse(task.time_logs) : []
      };
    }
    
    return task;
  } catch (error) {
    console.error(`Error fetching task with ID ${id}:`, error);
    toast.error("Failed to fetch task");
    return null;
  }
};

export const createTask = async (taskData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include Updateable fields
    const params = {
      records: [
        {
          Name: taskData.name || taskData.Name || taskData.title,
          title: taskData.title || taskData.name || taskData.Name,
          priority: taskData.priority || 'medium',
          status: taskData.status || 'todo',
          due_date: taskData.dueDate || taskData.due_date,
          project_id: parseInt(taskData.projectId || taskData.project_id),
          total_time: 0,
          active_timer: null,
          time_logs: JSON.stringify([]),
          Tags: taskData.tags || taskData.Tags || ''
        }
      ]
    };
    
    const response = await apperClient.createRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success("Task created successfully");
        const task = successfulRecords[0].data;
        // Transform time tracking data
        task.timeTracking = {
          totalTime: task.total_time || 0,
          activeTimer: task.active_timer ? JSON.parse(task.active_timer) : null,
          timeLogs: task.time_logs ? JSON.parse(task.time_logs) : []
        };
        return task;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating task:", error);
    toast.error("Failed to create task");
    return null;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include Updateable fields
    const updateData = {
      Id: parseInt(id)
    };
    
    if (taskData.name !== undefined) updateData.Name = taskData.name;
    if (taskData.Name !== undefined) updateData.Name = taskData.Name;
    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;
    if (taskData.status !== undefined) updateData.status = taskData.status;
    if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate;
    if (taskData.due_date !== undefined) updateData.due_date = taskData.due_date;
    if (taskData.projectId !== undefined) updateData.project_id = parseInt(taskData.projectId);
    if (taskData.project_id !== undefined) updateData.project_id = parseInt(taskData.project_id);
    if (taskData.tags !== undefined) updateData.Tags = taskData.tags;
    if (taskData.Tags !== undefined) updateData.Tags = taskData.Tags;
    
    // Handle time tracking data
    if (taskData.timeTracking !== undefined) {
      updateData.total_time = taskData.timeTracking.totalTime || 0;
      updateData.active_timer = taskData.timeTracking.activeTimer ? JSON.stringify(taskData.timeTracking.activeTimer) : null;
      updateData.time_logs = JSON.stringify(taskData.timeTracking.timeLogs || []);
    }
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success("Task updated successfully");
        const task = successfulUpdates[0].data;
        // Transform time tracking data
        task.timeTracking = {
          totalTime: task.total_time || 0,
          activeTimer: task.active_timer ? JSON.parse(task.active_timer) : null,
          timeLogs: task.time_logs ? JSON.parse(task.time_logs) : []
        };
        return task;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating task:", error);
    toast.error("Failed to update task");
    return null;
  }
};

export const updateTaskStatus = async (id, status) => {
  return updateTask(id, { status });
};

export const deleteTask = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }
    
    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success("Task deleted successfully");
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting task:", error);
    toast.error("Failed to delete task");
    return false;
  }
};

export const startTaskTimer = async (id) => {
  try {
    // Get current task
    const task = await getTaskById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.timeTracking?.activeTimer) {
      throw new Error("Timer already running for this task");
    }

    const now = new Date().toISOString();
    
    const activeTimer = {
      Id: task.Id,
      startTime: now
    };

    const timeTracking = {
      ...task.timeTracking,
      activeTimer
    };

    const updatedTask = await updateTask(id, { timeTracking });
    return updatedTask?.timeTracking?.activeTimer;
  } catch (error) {
    console.error("Error starting timer:", error);
    toast.error(error.message);
    throw error;
  }
};

export const stopTaskTimer = async (id) => {
  try {
    // Get current task
    const task = await getTaskById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (!task.timeTracking?.activeTimer) {
      throw new Error("No active timer for this task");
    }

    const now = new Date().toISOString();
    const startTime = new Date(task.timeTracking.activeTimer.startTime);
    const endTime = new Date(now);
    const duration = endTime.getTime() - startTime.getTime();

    const timeLog = {
      Id: Date.now(), // Simple ID generation
      startTime: task.timeTracking.activeTimer.startTime,
      endTime: now,
      duration: duration,
      date: startTime.toISOString().split('T')[0]
    };

    const timeTracking = {
      totalTime: (task.timeTracking.totalTime || 0) + duration,
      activeTimer: null,
      timeLogs: [...(task.timeTracking.timeLogs || []), timeLog]
    };

    await updateTask(id, { timeTracking });
    return timeLog;
  } catch (error) {
    console.error("Error stopping timer:", error);
    toast.error(error.message);
    throw error;
  }
};

export const getTaskTimeLogs = async (id) => {
  try {
    const task = await getTaskById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    return task.timeTracking?.timeLogs || [];
  } catch (error) {
    console.error("Error getting time logs:", error);
    toast.error("Failed to get time logs");
    return [];
  }
};