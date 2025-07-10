import { toast } from 'react-toastify';

export const getDashboardData = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Get aggregated data using fetchRecords with aggregators
    const params = {
      aggregators: [
        {
          id: "TotalClients",
          fields: [
            {
              field: { Name: "Id" },
              Function: "Count"
            }
          ],
          where: []
        },
        {
          id: "ActiveProjects",
          fields: [
            {
              field: { Name: "Id" },
              Function: "Count"
            }
          ],
          where: [
            {
              FieldName: "status",
              Operator: "EqualTo",
              Values: ["active"]
            }
          ]
        },
        {
          id: "MonthlyRevenue",
          fields: [
            {
              field: { Name: "amount" },
              Function: "Sum"
            }
          ],
          where: [
            {
              FieldName: "status",
              Operator: "EqualTo",
              Values: ["paid"]
            },
            {
              FieldName: "payment_date",
              Operator: "RelativeMatch",
              Values: ["this month"]
            }
          ]
        }
      ]
    };
    
    // Get client data for total count
    const clientResponse = await apperClient.fetchRecords('client', params);
    
    // Get project data for active projects
    const projectParams = {
      aggregators: [
        {
          id: "ActiveProjectsCount",
          fields: [
            {
              field: { Name: "Id" },
              Function: "Count"
            }
          ],
          where: [
            {
              FieldName: "status",
              Operator: "EqualTo",
              Values: ["active"]
            }
          ]
        }
      ]
    };
    
    const projectResponse = await apperClient.fetchRecords('project', projectParams);
    
    // Get task data for pending tasks
    const taskParams = {
      aggregators: [
        {
          id: "PendingTasksCount",
          fields: [
            {
              field: { Name: "Id" },
              Function: "Count"
            }
          ],
          where: [
            {
              FieldName: "status",
              Operator: "ExactMatch",
              Values: ["todo", "in-progress"]
            }
          ]
        },
        {
          id: "CompletedTasksCount",
          fields: [
            {
              field: { Name: "Id" },
              Function: "Count"
            }
          ],
          where: [
            {
              FieldName: "status",
              Operator: "EqualTo",
              Values: ["done"]
            }
          ]
        }
      ]
    };
    
    const taskResponse = await apperClient.fetchRecords('task', taskParams);
    
    // Get invoice data for revenue and overdue items
    const invoiceParams = {
      aggregators: [
        {
          id: "MonthlyRevenueSum",
          fields: [
            {
              field: { Name: "amount" },
              Function: "Sum"
            }
          ],
          where: [
            {
              FieldName: "status",
              Operator: "EqualTo",
              Values: ["paid"]
            },
            {
              FieldName: "payment_date",
              Operator: "RelativeMatch",
              Values: ["this month"]
            }
          ]
        },
        {
          id: "OverdueItemsCount",
          fields: [
            {
              field: { Name: "Id" },
              Function: "Count"
            }
          ],
          where: [
            {
              FieldName: "status",
              Operator: "EqualTo",
              Values: ["overdue"]
            }
          ]
        }
      ]
    };
    
    const invoiceResponse = await apperClient.fetchRecords('app_invoice', invoiceParams);
    
    // Process aggregation results
    const summary = {
      totalClients: clientResponse.aggregations?.find(a => a.id === "TotalClients")?.value || 0,
      activeProjects: projectResponse.aggregations?.find(a => a.id === "ActiveProjectsCount")?.value || 0,
      pendingTasks: taskResponse.aggregations?.find(a => a.id === "PendingTasksCount")?.value || 0,
      monthlyRevenue: invoiceResponse.aggregations?.find(a => a.id === "MonthlyRevenueSum")?.value || 0,
      completedTasks: taskResponse.aggregations?.find(a => a.id === "CompletedTasksCount")?.value || 0,
      overdueItems: invoiceResponse.aggregations?.find(a => a.id === "OverdueItemsCount")?.value || 0
    };
    
    // For recent activity, we'll use recent records from each table
    const recentActivity = await getRecentActivity();
    
    // Quick stats derived from summary
    const quickStats = {
      projectsThisWeek: Math.floor(summary.activeProjects * 0.3), // Estimated
      tasksCompleted: summary.completedTasks,
      hoursTracked: Math.floor(summary.completedTasks * 2.5), // Estimated based on tasks
      invoicesSent: Math.floor(summary.totalClients * 0.5) // Estimated
    };
    
    return {
      summary,
      recentActivity,
      quickStats
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    toast.error("Failed to load dashboard data");
    
    // Return fallback data structure
    return {
      summary: {
        totalClients: 0,
        activeProjects: 0,
        pendingTasks: 0,
        monthlyRevenue: 0,
        completedTasks: 0,
        overdueItems: 0
      },
      recentActivity: [],
      quickStats: {
        projectsThisWeek: 0,
        tasksCompleted: 0,
        hoursTracked: 0,
        invoicesSent: 0
      }
    };
  }
};

const getRecentActivity = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const activity = [];
    
    // Get recent projects
    const projectParams = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "status" } },
        { field: { Name: "ModifiedOn" } },
        { 
          field: { name: "client_id" },
          referenceField: { field: { Name: "Name" } }
        }
      ],
      orderBy: [
        {
          fieldName: "ModifiedOn",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 3,
        offset: 0
      }
    };
    
    const projects = await apperClient.fetchRecords('project', projectParams);
    if (projects.success && projects.data) {
      projects.data.forEach(project => {
        activity.push({
          id: `project-${project.Id}`,
          type: "project",
          title: `Project '${project.Name}' updated`,
          client: project.client_id?.Name || "Unknown Client",
          time: getTimeAgo(project.ModifiedOn),
          icon: "Briefcase"
        });
      });
    }
    
    // Get recent tasks
    const taskParams = {
      fields: [
        { field: { Name: "title" } },
        { field: { Name: "status" } },
        { field: { Name: "ModifiedOn" } },
        { 
          field: { name: "project_id" },
          referenceField: { field: { Name: "Name" } }
        }
      ],
      orderBy: [
        {
          fieldName: "ModifiedOn",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 2,
        offset: 0
      }
    };
    
    const tasks = await apperClient.fetchRecords('task', taskParams);
    if (tasks.success && tasks.data) {
      tasks.data.forEach(task => {
        activity.push({
          id: `task-${task.Id}`,
          type: "task",
          title: `Task '${task.title}' ${task.status}`,
          client: task.project_id?.Name || "Unknown Project",
          time: getTimeAgo(task.ModifiedOn),
          icon: "CheckSquare"
        });
      });
    }
    
    // Sort by time and return top 5
    return activity
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
      
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};

const getTimeAgo = (dateString) => {
  if (!dateString) return "Unknown time";
  
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return "Less than an hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};