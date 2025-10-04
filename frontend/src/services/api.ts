// src/services/api.ts
// API service layer for backend integration

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Employee" | "Finance" | "Director";
  company: string;
  manager?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  token: string;
}

export interface Expense {
  _id?: string;
  employee: string | { _id: string; name: string; email: string };
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt?: string;
  updatedAt?: string;
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Generic API call helper
const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 - redirect to login
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ============================================
// AUTHENTICATION APIs
// ============================================
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    country: string;
    role?: string;
  }): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.token) {
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response));
    }

    return response;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response));
    }

    return response;
  },

  logout: (): void => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getCurrentUser: (): AuthResponse | null => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// ============================================
// EXPENSE APIs
// ============================================
export const expenseAPI = {
  // Submit new expense
  submitExpense: async (expenseData: {
    amount: number;
    currency: string;
    category: string;
    description?: string;
    date: string;
  }): Promise<{ message: string; expense: Expense }> => {
    return apiCall("/expenses/submit", {
      method: "POST",
      body: JSON.stringify(expenseData),
    });
  },

  // Get expense history for logged-in user
  getMyExpenses: async (): Promise<{ expenses: Expense[] }> => {
    return apiCall("/expenses/my");
  },
};

// ============================================
// APPROVAL APIs
// ============================================
export const approvalAPI = {
  // Get pending expenses for approval
  getPendingExpenses: async (): Promise<{ expenses: Expense[] }> => {
    return apiCall("/approval/pending");
  },

  // Approve or reject expense
  approveRejectExpense: async (
    expenseId: string,
    decision: "Approved" | "Rejected",
    comment?: string
  ): Promise<{ message: string; expense: Expense }> => {
    return apiCall(`/approval/${expenseId}`, {
      method: "PUT",
      body: JSON.stringify({ decision, comment }),
    });
  },
};

// ============================================
// ADMIN APIs
// ============================================
export const adminAPI = {
  // Create new employee or manager
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    managerId?: string;
  }): Promise<User> => {
    return apiCall("/admin/create-user", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Change user role
  changeUserRole: async (
    userId: string,
    newRole: string
  ): Promise<User> => {
    return apiCall("/admin/change-role", {
      method: "PUT",
      body: JSON.stringify({ userId, newRole }),
    });
  },

  // Assign manager to user
  assignManager: async (
    userId: string,
    managerId: string
  ): Promise<{ message: string; user: User }> => {
    return apiCall("/admin/assign-manager", {
      method: "PUT",
      body: JSON.stringify({ userId, managerId }),
    });
  },
};

// ============================================
// APPROVAL RULE APIs
// ============================================
export const approvalRuleAPI = {
  // Create approval rule
  createApprovalRule: async (ruleData: {
    company: string;
    type: "percentage" | "specific" | "hybrid";
    config: any;
  }): Promise<any> => {
    return apiCall("/approval-rule", {
      method: "POST",
      body: JSON.stringify(ruleData),
    });
  },

  // Get approval rules for company
  getApprovalRules: async (): Promise<any> => {
    return apiCall("/approval-rule");
  },
};

// Export all APIs as default
export default {
  auth: authAPI,
  expense: expenseAPI,
  approval: approvalAPI,
  admin: adminAPI,
  approvalRule: approvalRuleAPI,
};