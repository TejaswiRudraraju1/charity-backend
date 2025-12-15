const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export type UserRole = "volunteer" | "ngo" | "donor" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Cause {
  _id: string;
  title: string;
  description: string;
  requiredAmount: number;
  currentAmount: number;
  location?: string;
  volunteersRequired?: number;
  status: string;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  volunteers?: {
    user: { _id: string; name: string; email: string };
    joinedAt: string;
  }[];
}

export interface Donation {
  _id: string;
  causeId: { _id: string; title: string; description: string };
  amount: number;
  hash?: string;
  onChainTx?: string;
  createdAt: string;
}

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeaders = getAuthHeaders();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Add auth header if present
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  
  // Merge with any existing headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  
  // Add timeout for fetch requests (10 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || "Request failed";
    throw new Error(message);
  }
  return data as T;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  return request<{ success: boolean; user: AuthUser; token: string }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function loginUser(input: {
  email: string;
  password: string;
}) {
  return request<{ success: boolean; user: AuthUser; token: string }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function fetchMe() {
  return request<{ success: boolean; user: AuthUser }>("/api/protected/me");
}

export async function fetchCauses() {
  return request<{ success: boolean; causes: Cause[] }>("/api/causes");
}

export async function createCause(input: {
  title: string;
  description: string;
  requiredAmount: number;
  location?: string;
  volunteersRequired?: number;
}) {
  return request<{ success: boolean; cause: Cause }>("/api/causes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchMyCauses() {
  return request<{ success: boolean; causes: Cause[] }>("/api/causes/mine");
}

export async function volunteerForCause(id: string) {
  return request<{ success: boolean; cause: Cause }>(
    `/api/causes/${id}/volunteer`,
    {
      method: "POST",
    }
  );
}

export async function createDonationIntent(input: {
  causeId: string;
  amount: number;
}) {
  return request<{
    success: boolean;
    payment: { orderId: string; provider: string };
    donationId: string;
  }>("/api/donations/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyDonation(input: {
  donationId: string;
  status: "SUCCESS" | "FAILED";
  txDetails?: any;
}) {
  return request<{ success: boolean; donation: any }>("/api/donations/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchMyDonations() {
  return request<{ success: boolean; donations: Donation[] }>(
    "/api/donations/my"
  );
}


