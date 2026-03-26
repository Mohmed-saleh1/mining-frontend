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

export interface CreateVerifiedUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'admin' | 'user' | 'manager';
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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    const contentType = response.headers.get('content-type');
    const hasJsonBody = contentType?.includes('application/json');
    const isEmpty = response.status === 204 || response.status === 205;

    if (isEmpty || !hasJsonBody) {
      if (!response.ok) {
        throw new ApiError(
          response.statusText || `HTTP ${response.status}`,
          response.status,
          'HTTP_ERROR',
          undefined
        );
      }
      return { success: true, message: '', data: undefined, timestamp: new Date().toISOString() } as ApiResponse<T>;
    }

    try {
      data = await response.json();
    } catch (jsonError) {
      console.error(`Failed to parse JSON response for ${endpoint}:`, jsonError);
      throw new ApiError(
        `Invalid response format from server`,
        response.status,
        'INVALID_RESPONSE',
        'The server returned an invalid response format'
      );
    }

    if (!response.ok) {
      console.error(`API Error for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        message: data?.message,
        errorCode: data?.errorCode,
        errorDescription: data?.errorDescription,
        data: data
      });
      throw new ApiError(
        data?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data?.errorCode,
        data?.errorDescription
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`Network error for ${endpoint}:`, error);
    throw new ApiError(
      'Network error - please check your connection',
      0,
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Unknown network error'
    );
  }
}

async function requestWithFile<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: HeadersInit = {};

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
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

async function requestWithFilePatch<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: HeadersInit = {};

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PATCH',
    body: formData,
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

  createVerifiedUser: (data: CreateVerifiedUserData) =>
    request<AuthResponse>('/auth/create-verified-user', {
      method: 'POST',
      body: JSON.stringify(data),
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
  withdrawalFrequency?: 'daily' | 'weekly' | 'monthly';
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
  withdrawalFrequency?: 'daily' | 'weekly' | 'monthly';
}

export type UpdateMiningMachineData = Partial<CreateMiningMachineData>;

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
  
  create: (data: CreateMiningMachineData, imageFile?: File) => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      // Append all other fields
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof CreateMiningMachineData];
        if (value !== undefined && value !== null && key !== 'image') {
          if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
          } else if (typeof value === 'number') {
            formData.append(key, value.toString());
          } else {
            formData.append(key, String(value));
          }
        }
      });
      return requestWithFile<MiningMachine>('/mining-machines', formData);
    } else {
      return request<MiningMachine>('/mining-machines', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  },
  
  update: (id: string, data: UpdateMiningMachineData, imageFile?: File) => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      // Append all other fields
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof UpdateMiningMachineData];
        if (value !== undefined && value !== null && key !== 'image') {
          if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
          } else if (typeof value === 'number') {
            formData.append(key, value.toString());
          } else {
            formData.append(key, String(value));
          }
        }
      });
      return requestWithFilePatch<MiningMachine>(`/mining-machines/${id}`, formData);
    } else {
      return request<MiningMachine>(`/mining-machines/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    }
  },
  
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

// Wallet Types
export type CryptoType = 'BTC' | 'ETH' | 'USDT' | 'LTC' | 'XRP' | 'DOGE' | 'BNB' | 'SOL';

export interface CryptoInfo {
  type: CryptoType;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  decimals: number;
}

export interface Wallet {
  id: string;
  cryptoType: CryptoType;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  balance: number;
  pendingBalance: number;
  walletAddress: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AllWalletsResponse {
  wallets: Wallet[];
  totalBalanceUsd: number;
}

export interface UpdateWalletAddressData {
  cryptoType: CryptoType;
  walletAddress: string;
}

export type WalletWithdrawalStatus = 'pending' | 'sent' | 'rejected';

export interface WalletWithdrawalRequest {
  id: string;
  cryptoType: CryptoType;
  networkType: string;
  address: string;
  amount: number;
  status: WalletWithdrawalStatus;
  screenshotUrl?: string;
  adminNotes?: string;
  sentById?: string;
  sentAt?: string;
  createdAt: string;
}

export interface CreateWalletWithdrawalRequestData {
  cryptoType: CryptoType;
  networkType: string;
  address: string;
  amount: number;
}

// Wallets API (auth required)
export const walletsApi = {
  getAll: () => request<AllWalletsResponse>('/wallets'),
  
  getCryptoTypes: () => request<CryptoInfo[]>('/wallets/crypto-types'),
  
  getOne: (cryptoType: CryptoType) => request<Wallet>(`/wallets/${cryptoType}`),
  
  updateAddress: (data: UpdateWalletAddressData) =>
    request<Wallet>('/wallets/address', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getMyWithdrawals: () =>
    request<WalletWithdrawalRequest[]>('/wallets/withdrawals'),

  createWithdrawalRequest: (data: CreateWalletWithdrawalRequestData) =>
    request<WalletWithdrawalRequest>('/wallets/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const walletsAdminApi = {
  getWithdrawals: (status?: WalletWithdrawalStatus) =>
    request<WalletWithdrawalRequest[]>(
      status ? `/wallets/admin/withdrawals?status=${status}` : '/wallets/admin/withdrawals',
    ),

  markWithdrawalSent: (id: string, image: File, adminNotes?: string) => {
    const formData = new FormData();
    formData.append('image', image);
    if (adminNotes?.trim()) formData.append('adminNotes', adminNotes.trim());
    return requestWithFile<WalletWithdrawalRequest>(
      `/wallets/admin/withdrawals/${id}/sent`,
      formData,
    );
  },
};

// Booking Types
export type BookingStatus = 'pending' | 'awaiting_payment' | 'payment_sent' | 'approved' | 'rejected' | 'cancelled';
export type RentalDuration = 'hour' | 'day' | 'week' | 'month';
export type MessageType = 'text' | 'payment_address' | 'image' | 'system';

export interface BookingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface BookingMachine {
  id: string;
  name: string;
  image?: string;
  miningCoin: string;
  profitPerDay?: number;
  pricePerMonth?: number;
}

export interface BookingMessage {
  id: string;
  bookingId: string;
  senderId: string;
  sender: BookingUser;
  content: string;
  cryptoName?: string;
  networkType?: string;
  imageUrl?: string;
  messageType: MessageType;
  isRead: boolean;
  isFromAdmin: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  user: BookingUser;
  machineId: string;
  machine: BookingMachine;
  rentalDuration: RentalDuration;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  paymentAddress?: string;
  transactionHash?: string;
  userNotes?: string;
  adminNotes?: string;
  paymentSentAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  approvedById?: string;
  approvedBy?: BookingUser;
  messages: BookingMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface BookingReceivingAddress {
  id: string;
  cryptoName?: string;
  networkType: string;
  address: string;
  qrImageUrl?: string;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingsResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingAnalytics {
  totalBookings: number;
  totalInvestment: number;
  totalRevenue: number;
  activeBookings: number;
  bookingsByStatus: Record<BookingStatus, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  revenueBreakdown?: {
    today: number;
    lastWeek: number;
    lastMonth: number;
    incoming: number;
  };
  subscriptionMetrics: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalSubscriptionValue: number;
    monthlyEarnings: number;
    subscriptionsByStatus: Record<string, number>;
    avgDailyEarnings: number;
  };
}

export interface BookingStatistics {
  total: number;
  pending: number;
  awaitingPayment: number;
  paymentSent: number;
  approved: number;
  rejected: number;
  cancelled: number;
}

export interface CreateBookingData {
  machineId: string;
  rentalDuration: RentalDuration;
  quantity: number;
  userNotes?: string;
}

// User Bookings API
export const bookingsApi = {
  create: (data: CreateBookingData) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyBookings: () => request<Booking[]>('/bookings/my-bookings'),

  getMyBooking: (id: string) => request<Booking>(`/bookings/my-bookings/${id}`),

  markPaymentSent: (id: string, transactionHash?: string) =>
    request<Booking>(`/bookings/my-bookings/${id}/mark-payment-sent`, {
      method: 'PUT',
      body: JSON.stringify({ transactionHash }),
    }),

  cancelBooking: (id: string) =>
    request<Booking>(`/bookings/my-bookings/${id}/cancel`, {
      method: 'PUT',
    }),

  sendMessage: (bookingId: string, content: string) =>
    request<BookingMessage>(`/bookings/my-bookings/${bookingId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  sendImageMessage: (bookingId: string, image: File, content?: string) => {
    const formData = new FormData();
    formData.append('image', image);
    if (content?.trim()) {
      formData.append('content', content.trim());
    }
    return requestWithFile<BookingMessage>(
      `/bookings/my-bookings/${bookingId}/messages/image`,
      formData
    );
  },

  getMessages: (bookingId: string) =>
    request<BookingMessage[]>(`/bookings/my-bookings/${bookingId}/messages`),

  markMessagesRead: (bookingId: string) =>
    request<null>(`/bookings/my-bookings/${bookingId}/messages/mark-read`, {
      method: 'PUT',
    }),

  getUnreadCount: () => request<{ count: number }>('/bookings/unread-count'),

  getAnalytics: () => request<BookingAnalytics>('/bookings/my-bookings/analytics'),

  getReceivingAddresses: () =>
    request<BookingReceivingAddress[]>('/bookings/receiving-addresses'),
};

// Admin Bookings API
export const bookingsAdminApi = {
  getAll: (options?: {
    page?: number;
    limit?: number;
    status?: BookingStatus;
  }) => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', String(options.page));
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.status) params.append('status', options.status);
    
    const query = params.toString();
    return request<BookingsResponse>(`/bookings/admin${query ? `?${query}` : ''}`);
  },

  getOne: (id: string) => request<Booking>(`/bookings/admin/${id}`),

  getStatistics: () => request<BookingStatistics>('/bookings/admin/statistics'),

  sendPaymentAddress: (id: string, paymentAddress: string) =>
    request<Booking>(`/bookings/admin/${id}/send-payment-address`, {
      method: 'PUT',
      body: JSON.stringify({ paymentAddress }),
    }),

  approve: (id: string, adminNotes?: string) =>
    request<Booking>(`/bookings/admin/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ adminNotes }),
    }),

  reject: (id: string, adminNotes?: string) =>
    request<Booking>(`/bookings/admin/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ adminNotes }),
    }),

  sendMessage: (bookingId: string, content: string) =>
    request<BookingMessage>(`/bookings/admin/${bookingId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  sendImageMessage: (bookingId: string, image: File, content?: string) => {
    const formData = new FormData();
    formData.append('image', image);
    if (content?.trim()) {
      formData.append('content', content.trim());
    }
    return requestWithFile<BookingMessage>(
      `/bookings/admin/${bookingId}/messages/image`,
      formData
    );
  },

  getMessages: (bookingId: string) =>
    request<BookingMessage[]>(`/bookings/admin/${bookingId}/messages`),

  markMessagesRead: (bookingId: string) =>
    request<null>(`/bookings/admin/${bookingId}/messages/mark-read`, {
      method: 'PUT',
    }),

  getUnreadCount: () => request<{ count: number }>('/bookings/admin/unread-count'),

  getReceivingAddresses: () =>
    request<BookingReceivingAddress[]>(
      '/bookings/admin/settings/receiving-addresses'
    ),

  createReceivingAddress: (data: {
    cryptoName: string;
    networkType: string;
    address: string;
    isActive?: boolean;
  }) =>
    request<BookingReceivingAddress>(
      '/bookings/admin/settings/receiving-addresses',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  updateReceivingAddress: (
    id: string,
    data: {
      cryptoName?: string;
      networkType?: string;
      address?: string;
      isActive?: boolean;
    }
  ) =>
    request<BookingReceivingAddress>(
      `/bookings/admin/settings/receiving-addresses/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    ),

  deleteReceivingAddress: (id: string) =>
    request<null>(`/bookings/admin/settings/receiving-addresses/${id}/delete`, {
      method: 'PUT',
    }),

  getReceivingAddressesForQr: () =>
    request<BookingReceivingAddress[]>('/bookings/admin/receiving-addresses/qr'),

  uploadReceivingAddressQr: (id: string, image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    return requestWithFile<BookingReceivingAddress>(
      `/bookings/admin/receiving-addresses/${id}/qr`,
      formData
    );
  },
};

// Legal Documents Types
export interface LegalDocument {
  id: string;
  type: 'privacy_policy' | 'terms_of_service';
  content: string;
  contentAr?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLegalDocumentData {
  type: 'privacy_policy' | 'terms_of_service';
  content: string;
  contentAr?: string;
}

export interface UpdateLegalDocumentData {
  content?: string;
  contentAr?: string;
}

// Public Legal Documents API
export const legalDocumentsPublicApi = {
  getPrivacyPolicy: () => request<LegalDocument>('/legal-documents/public/privacy-policy'),
  getTermsOfService: () => request<LegalDocument>('/legal-documents/public/terms-of-service'),
};

// Admin Legal Documents API
export const legalDocumentsApi = {
  getAll: () => request<LegalDocument[]>('/legal-documents'),
  getOne: (id: string) => request<LegalDocument>(`/legal-documents/${id}`),
  create: (data: CreateLegalDocumentData) =>
    request<LegalDocument>('/legal-documents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateLegalDocumentData) =>
    request<LegalDocument>(`/legal-documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  updateByType: (type: 'privacy_policy' | 'terms_of_service', data: UpdateLegalDocumentData) =>
    request<LegalDocument>(`/legal-documents/type/${type}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/legal-documents/${id}`, {
      method: 'DELETE',
    }),
};

// Subscription Types
export type PlanDuration = 'day' | 'week' | 'month' | 'year';
export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'cancelled';
export type PaymentMethod = 'paytabs' | 'binance' | 'cryptomus';

export interface SubscriptionPlan {
  id: string;
  machineId: string;
  machine?: MiningMachine;
  name: string;
  description?: string;
  duration: PlanDuration;
  price: number;
  quantity: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  user?: User;
  planId?: string;
  plan?: SubscriptionPlan;
  machineId: string;
  machine: MiningMachine;
  status: SubscriptionStatus;
  amount: number;
  duration?: PlanDuration;
  durationNumber?: number;
  quantity?: number;
  paymentMethod: PaymentMethod;
  paytabsTransactionId?: string;
  paytabsPaymentId?: string;
  binanceOrderId?: string;
  binancePrepayId?: string;
  startDate?: string;
  endDate?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanData {
  machineId: string;
  name?: string;
  description?: string;
  duration: PlanDuration;
  price?: number; // Optional - will be auto-calculated if not provided
  number?: number; // Number of duration units (e.g., 2 for 2 weeks)
  quantity?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateSubscriptionData {
  machineId: string;
  duration: PlanDuration;
  number: number;
  quantity?: number;
  paymentMethod?: PaymentMethod;
}

// Subscription Plans API (Public)
export const subscriptionPlansApi = {
  getAll: (machineId?: string) => {
    const query = machineId ? `?machineId=${machineId}` : '';
    return request<SubscriptionPlan[]>(`/subscriptions/plans${query}`);
  },
  
  getOne: (id: string) => request<SubscriptionPlan>(`/subscriptions/plans/${id}`),
};

// User Subscriptions API
export const subscriptionsApi = {
  create: (data: CreateSubscriptionData) =>
    request<{ subscription: Subscription; paymentUrl: string }>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMySubscriptions: () => request<Subscription[]>('/subscriptions/my-subscriptions'),

  getMySubscription: (id: string) => request<Subscription>(`/subscriptions/my-subscriptions/${id}`),

  cancel: (id: string) =>
    request<Subscription>(`/subscriptions/my-subscriptions/${id}/cancel`, {
      method: 'PUT',
    }),
};

// Admin Subscriptions API
export const subscriptionsAdminApi = {
  createPlan: (data: CreateSubscriptionPlanData) =>
    request<SubscriptionPlan>('/subscriptions/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePlan: (id: string, data: Partial<CreateSubscriptionPlanData>) =>
    request<SubscriptionPlan>(`/subscriptions/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePlan: (id: string) =>
    request<void>(`/subscriptions/plans/${id}`, {
      method: 'DELETE',
    }),

  getAll: (options?: {
    page?: number;
    limit?: number;
    status?: SubscriptionStatus;
  }) => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', String(options.page));
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.status) params.append('status', options.status);
    
    const query = params.toString();
    return request<{
      data: Subscription[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/subscriptions/admin${query ? `?${query}` : ''}`);
  },

  getOne: (id: string) => request<Subscription>(`/subscriptions/admin/${id}`),

  getStatistics: () => request<{
    total: number;
    pending: number;
    active: number;
    expired: number;
    cancelled: number;
  }>('/subscriptions/admin/statistics'),
};

export { ApiError };

