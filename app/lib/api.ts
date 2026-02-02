const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
    public errorDescription?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.message || 'An error occurred',
      response.status,
      data.errorCode,
      data.errorDescription
    );
  }

  return data;
}

export const authApi = {
  register: (data: RegisterData) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginData) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>('/auth/me'),

  verifyEmail: (token: string) =>
    request<null>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  resendVerificationEmail: (email: string) =>
    request<null>('/auth/resend-verification-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    request<null>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyResetToken: (token: string) =>
    request<{ valid: boolean }>('/auth/verify-reset-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<null>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};

export const usersApi = {
  getProfile: () => request<User>('/users/profile'),

  updateProfile: (data: UpdateProfileData) =>
    request<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (data: ChangePasswordData) =>
    request<null>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Admin Users API
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'admin' | 'user' | 'manager';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'admin' | 'user' | 'manager';
  isActive?: boolean;
  emailVerified?: boolean;
}

export const adminUsersApi = {
  getAll: () => request<User[]>('/users'),
  
  getOne: (id: string) => request<User>(`/users/${id}`),
  
  create: (data: CreateUserData) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: UpdateUserData) =>
    request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    request<void>(`/users/${id}`, {
      method: 'DELETE',
    }),
  
  activate: (id: string) =>
    request<User>(`/users/${id}/activate`, {
      method: 'POST',
    }),
  
  deactivate: (id: string) =>
    request<User>(`/users/${id}/deactivate`, {
      method: 'POST',
    }),
};

// Mining Machine Types
export type MachineType = 'asic' | 'gpu';
export type MachineStatus = 'available' | 'rented' | 'maintenance' | 'inactive';

export interface MiningMachine {
  id: string;
  name: string;
  description?: string;
  image?: string;
  type: MachineType;
  manufacturer?: string;
  model?: string;
  hashRate?: number;
  hashRateUnit?: string;
  powerConsumption?: number;
  algorithm?: string;
  miningCoin?: string;
  efficiency?: number;
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  profitPerHour: number;
  profitPerDay: number;
  profitPerWeek: number;
  profitPerMonth: number;
  status: MachineStatus;
  totalUnits: number;
  rentedUnits: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMiningMachineData {
  name: string;
  description?: string;
  image?: string;
  type?: MachineType;
  manufacturer?: string;
  model?: string;
  hashRate?: number;
  hashRateUnit?: string;
  powerConsumption?: number;
  algorithm?: string;
  miningCoin?: string;
  efficiency?: number;
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  profitPerHour: number;
  profitPerDay: number;
  profitPerWeek: number;
  profitPerMonth: number;
  status?: MachineStatus;
  totalUnits?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface UpdateMiningMachineData extends Partial<CreateMiningMachineData> {}

// Public Mining Machines API (no auth required)
export const miningMachinesPublicApi = {
  getAll: () => request<MiningMachine[]>('/mining-machines/public'),
  
  getFeatured: () => request<MiningMachine[]>('/mining-machines/featured'),
  
  getOne: (id: string) => request<MiningMachine>(`/mining-machines/public/${id}`),
};

// Admin Mining Machines API (auth required)
export const miningMachinesApi = {
  getAll: (options?: {
    isActive?: boolean;
    isFeatured?: boolean;
    type?: string;
    status?: MachineStatus;
  }) => {
    const params = new URLSearchParams();
    if (options?.isActive !== undefined) params.append('isActive', String(options.isActive));
    if (options?.isFeatured !== undefined) params.append('isFeatured', String(options.isFeatured));
    if (options?.type) params.append('type', options.type);
    if (options?.status) params.append('status', options.status);
    
    const query = params.toString();
    return request<MiningMachine[]>(`/mining-machines${query ? `?${query}` : ''}`);
  },
  
  getOne: (id: string) => request<MiningMachine>(`/mining-machines/${id}`),
  
  create: (data: CreateMiningMachineData) =>
    request<MiningMachine>('/mining-machines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: UpdateMiningMachineData) =>
    request<MiningMachine>(`/mining-machines/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    request<void>(`/mining-machines/${id}`, {
      method: 'DELETE',
    }),
  
  toggleActive: (id: string) =>
    request<MiningMachine>(`/mining-machines/${id}/toggle-active`, {
      method: 'PATCH',
    }),
  
  toggleFeatured: (id: string) =>
    request<MiningMachine>(`/mining-machines/${id}/toggle-featured`, {
      method: 'PATCH',
    }),
  
  updateStatus: (id: string, status: MachineStatus) =>
    request<MiningMachine>(`/mining-machines/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Contact Submissions Types
export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'closed';
export type ContactSubject = 'general' | 'booking' | 'complaint' | 'feedback' | 'partnership' | 'other';

export interface ContactSubmission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: ContactSubject;
  message: string;
  status: ContactStatus;
  adminNotes?: string;
  assignedToId?: string;
  isRead: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmissionsResponse {
  data: ContactSubmission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContactStatistics {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  closed: number;
  unread: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

// Contact Public API
export interface CreateContactSubmissionData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: ContactSubject;
  message: string;
}

export const contactPublicApi = {
  submit: (data: CreateContactSubmissionData) =>
    request<ContactSubmission>('/contact-us', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Contact Admin API
export const contactAdminApi = {
  getAll: (options?: {
    page?: number;
    limit?: number;
    status?: ContactStatus;
    subject?: ContactSubject;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', String(options.page));
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.status) params.append('status', options.status);
    if (options?.subject) params.append('subject', options.subject);
    if (options?.search) params.append('search', options.search);
    
    const query = params.toString();
    return request<ContactSubmissionsResponse>(`/contact-us/admin${query ? `?${query}` : ''}`);
  },
  
  getOne: (id: string) => request<ContactSubmission>(`/contact-us/admin/${id}`),
  
  getStatistics: () => request<ContactStatistics>('/contact-us/admin/statistics'),
  
  getRecent: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return request<ContactSubmission[]>(`/contact-us/admin/recent${query}`);
  },
  
  update: (id: string, data: { status?: ContactStatus; adminNotes?: string }) =>
    request<ContactSubmission>(`/contact-us/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  markAsRead: (id: string) =>
    request<ContactSubmission>(`/contact-us/admin/${id}/mark-read`, {
      method: 'PUT',
    }),
  
  markAsUnread: (id: string) =>
    request<ContactSubmission>(`/contact-us/admin/${id}/mark-unread`, {
      method: 'PUT',
    }),
  
  delete: (id: string) =>
    request<void>(`/contact-us/admin/${id}`, {
      method: 'DELETE',
    }),
};

export { ApiError };

