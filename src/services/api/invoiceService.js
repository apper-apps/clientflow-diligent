import { toast } from 'react-toastify';

export const getAllInvoices = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "amount" } },
        { field: { Name: "status" } },
        { field: { Name: "due_date" } },
        { field: { Name: "payment_date" } },
        { field: { Name: "Tags" } },
        { 
          field: { name: "client_id" },
          referenceField: { field: { Name: "Name" } }
        },
        { 
          field: { name: "project_id" },
          referenceField: { field: { Name: "Name" } }
        }
      ],
      orderBy: [
        {
          fieldName: "due_date",
          sorttype: "DESC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords('app_invoice', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    toast.error("Failed to fetch invoices");
    return [];
  }
};

export const getInvoiceById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "amount" } },
        { field: { Name: "status" } },
        { field: { Name: "due_date" } },
        { field: { Name: "payment_date" } },
        { field: { Name: "Tags" } },
        { 
          field: { name: "client_id" },
          referenceField: { field: { Name: "Name" } }
        },
        { 
          field: { name: "project_id" },
          referenceField: { field: { Name: "Name" } }
        }
      ]
    };
    
    const response = await apperClient.getRecordById('app_invoice', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice with ID ${id}:`, error);
    toast.error("Failed to fetch invoice");
    return null;
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    // Validate required fields
    if (!invoiceData.projectId && !invoiceData.project_id) {
      toast.error("Project ID is required");
      return null;
    }
    if (!invoiceData.amount || invoiceData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return null;
    }
    if (!invoiceData.dueDate && !invoiceData.due_date) {
      toast.error("Due date is required");
      return null;
    }

    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include Updateable fields
    const params = {
      records: [
        {
          Name: invoiceData.name || invoiceData.Name || `Invoice-${Date.now()}`,
          amount: parseFloat(invoiceData.amount),
          status: invoiceData.status || 'draft',
          due_date: invoiceData.dueDate || invoiceData.due_date,
          payment_date: invoiceData.paymentDate || invoiceData.payment_date || null,
          client_id: parseInt(invoiceData.clientId || invoiceData.client_id),
          project_id: parseInt(invoiceData.projectId || invoiceData.project_id),
          Tags: invoiceData.tags || invoiceData.Tags || ''
        }
      ]
    };
    
    const response = await apperClient.createRecord('app_invoice', params);
    
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
        toast.success("Invoice created successfully");
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating invoice:", error);
    toast.error("Failed to create invoice");
    return null;
  }
};

export const updateInvoice = async (id, invoiceData) => {
  try {
    // Validate data if provided
    if (invoiceData.amount !== undefined && invoiceData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return null;
    }

    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include Updateable fields
    const updateData = {
      Id: parseInt(id)
    };
    
    if (invoiceData.name !== undefined) updateData.Name = invoiceData.name;
    if (invoiceData.Name !== undefined) updateData.Name = invoiceData.Name;
    if (invoiceData.amount !== undefined) updateData.amount = parseFloat(invoiceData.amount);
    if (invoiceData.status !== undefined) updateData.status = invoiceData.status;
    if (invoiceData.dueDate !== undefined) updateData.due_date = invoiceData.dueDate;
    if (invoiceData.due_date !== undefined) updateData.due_date = invoiceData.due_date;
    if (invoiceData.paymentDate !== undefined) updateData.payment_date = invoiceData.paymentDate;
    if (invoiceData.payment_date !== undefined) updateData.payment_date = invoiceData.payment_date;
    if (invoiceData.clientId !== undefined) updateData.client_id = parseInt(invoiceData.clientId);
    if (invoiceData.client_id !== undefined) updateData.client_id = parseInt(invoiceData.client_id);
    if (invoiceData.projectId !== undefined) updateData.project_id = parseInt(invoiceData.projectId);
    if (invoiceData.project_id !== undefined) updateData.project_id = parseInt(invoiceData.project_id);
    if (invoiceData.tags !== undefined) updateData.Tags = invoiceData.tags;
    if (invoiceData.Tags !== undefined) updateData.Tags = invoiceData.Tags;
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord('app_invoice', params);
    
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
        toast.success("Invoice updated successfully");
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating invoice:", error);
    toast.error("Failed to update invoice");
    return null;
  }
};

export const markInvoiceAsSent = async (id) => {
  try {
    // Get current invoice to check status
    const invoice = await getInvoiceById(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    
    if (invoice.status !== "draft") {
      toast.error("Only draft invoices can be marked as sent");
      return null;
    }
    
    return await updateInvoice(id, { status: "sent" });
  } catch (error) {
    console.error("Error marking invoice as sent:", error);
    toast.error("Failed to mark invoice as sent");
    return null;
  }
};

export const markInvoiceAsPaid = async (id, paymentDate) => {
  try {
    if (!paymentDate) {
      toast.error("Payment date is required");
      return null;
    }

    // Get current invoice to check status
    const invoice = await getInvoiceById(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    
    if (invoice.status === "paid") {
      toast.error("Invoice is already marked as paid");
      return null;
    }
    
    return await updateInvoice(id, { 
      status: "paid",
      payment_date: new Date(paymentDate).toISOString()
    });
  } catch (error) {
    console.error("Error marking invoice as paid:", error);
    toast.error("Failed to mark invoice as paid");
    return null;
  }
};

export const deleteInvoice = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord('app_invoice', params);
    
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
        toast.success("Invoice deleted successfully");
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    toast.error("Failed to delete invoice");
    return false;
  }
};