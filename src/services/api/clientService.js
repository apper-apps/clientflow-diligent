import { toast } from 'react-toastify';

export const getAllClients = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "email" } },
        { field: { Name: "company" } },
        { field: { Name: "status" } },
        { field: { Name: "created_at" } },
        { field: { Name: "Tags" } }
      ],
      orderBy: [
        {
          fieldName: "Name",
          sorttype: "ASC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords('client', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching clients:", error);
    toast.error("Failed to fetch clients");
    return [];
  }
};

export const getClientById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "email" } },
        { field: { Name: "company" } },
        { field: { Name: "status" } },
        { field: { Name: "created_at" } },
        { field: { Name: "Tags" } }
      ]
    };
    
    const response = await apperClient.getRecordById('client', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching client with ID ${id}:`, error);
    toast.error("Failed to fetch client");
    return null;
  }
};

export const createClient = async (clientData) => {
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
          Name: clientData.name || clientData.Name,
          email: clientData.email,
          company: clientData.company,
          status: clientData.status || 'active',
          Tags: clientData.tags || clientData.Tags || '',
          created_at: new Date().toISOString()
        }
      ]
    };
    
    const response = await apperClient.createRecord('client', params);
    
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
        toast.success("Client created successfully");
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating client:", error);
    toast.error("Failed to create client");
    return null;
  }
};

export const updateClient = async (id, clientData) => {
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
    
    if (clientData.name !== undefined) updateData.Name = clientData.name;
    if (clientData.Name !== undefined) updateData.Name = clientData.Name;
    if (clientData.email !== undefined) updateData.email = clientData.email;
    if (clientData.company !== undefined) updateData.company = clientData.company;
    if (clientData.status !== undefined) updateData.status = clientData.status;
    if (clientData.tags !== undefined) updateData.Tags = clientData.tags;
    if (clientData.Tags !== undefined) updateData.Tags = clientData.Tags;
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord('client', params);
    
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
        toast.success("Client updated successfully");
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating client:", error);
    toast.error("Failed to update client");
    return null;
  }
};

export const deleteClient = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord('client', params);
    
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
        toast.success("Client deleted successfully");
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting client:", error);
    toast.error("Failed to delete client");
    return false;
  }
};