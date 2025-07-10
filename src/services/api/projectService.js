import { toast } from 'react-toastify';

export const getAllProjects = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "status" } },
        { field: { Name: "budget" } },
        { field: { Name: "start_date" } },
        { field: { Name: "end_date" } },
        { field: { Name: "Tags" } },
        { 
          field: { name: "client_id" },
          referenceField: { field: { Name: "Name" } }
        }
      ],
      orderBy: [
        {
          fieldName: "Name",
          sorttype: "ASC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords('project', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    toast.error("Failed to fetch projects");
    return [];
  }
};

export const getProjectById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "status" } },
        { field: { Name: "budget" } },
        { field: { Name: "start_date" } },
        { field: { Name: "end_date" } },
        { field: { Name: "Tags" } },
        { 
          field: { name: "client_id" },
          referenceField: { field: { Name: "Name" } }
        }
      ]
    };
    
    const response = await apperClient.getRecordById('project', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    toast.error("Failed to fetch project");
    return null;
  }
};

export const createProject = async (projectData) => {
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
          Name: projectData.name || projectData.Name,
          status: projectData.status || 'planning',
          budget: parseFloat(projectData.budget) || 0,
          start_date: projectData.startDate || projectData.start_date,
          end_date: projectData.endDate || projectData.end_date,
          client_id: parseInt(projectData.clientId || projectData.client_id),
          Tags: projectData.tags || projectData.Tags || ''
        }
      ]
    };
    
    const response = await apperClient.createRecord('project', params);
    
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
        toast.success("Project created successfully");
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating project:", error);
    toast.error("Failed to create project");
    return null;
  }
};

export const updateProject = async (id, projectData) => {
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
    
    if (projectData.name !== undefined) updateData.Name = projectData.name;
    if (projectData.Name !== undefined) updateData.Name = projectData.Name;
    if (projectData.status !== undefined) updateData.status = projectData.status;
    if (projectData.budget !== undefined) updateData.budget = parseFloat(projectData.budget);
    if (projectData.startDate !== undefined) updateData.start_date = projectData.startDate;
    if (projectData.start_date !== undefined) updateData.start_date = projectData.start_date;
    if (projectData.endDate !== undefined) updateData.end_date = projectData.endDate;
    if (projectData.end_date !== undefined) updateData.end_date = projectData.end_date;
    if (projectData.clientId !== undefined) updateData.client_id = parseInt(projectData.clientId);
    if (projectData.client_id !== undefined) updateData.client_id = parseInt(projectData.client_id);
    if (projectData.tags !== undefined) updateData.Tags = projectData.tags;
    if (projectData.Tags !== undefined) updateData.Tags = projectData.Tags;
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord('project', params);
    
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
        toast.success("Project updated successfully");
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating project:", error);
    toast.error("Failed to update project");
    return null;
  }
};

export const deleteProject = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord('project', params);
    
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
        toast.success("Project deleted successfully");
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting project:", error);
    toast.error("Failed to delete project");
    return false;
  }
};