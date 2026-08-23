// --- 1. CORE ENTITIES & DB MODELS ---

export type Role =
  | "rider"
  | "customer"
  | "vendor"
  | "connector"
  | "admin"
  | "manager";

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  profileImage?: string;
  oAuth: boolean;
  oAuthProvider?: string;

  // Replaced biocoins with the new db schema properties
  available_chillings: number;
  pending_chillings: number;
  total_chillings_earned: number;

  total_waste_submitted: number;
  total_waste_processed: number;

  co2_saved: number;
  trees_equivalent: number;

  goals: string;
  role: Array<Role>;
  market_id?: string;
  stallNumber?: string;
  phone_number: string;

  // Updated to boolean to match the recommended DB schema update
  on_shift: boolean;
};

export type Reward = {
  id: string;
  // If you fetch joined data, you might include user_id here as well
  amount: number;
  source: string;
  date: string | Date;
  status: "APPROVED" | "PENDING" | "REJECTED" | string;
};

// --- 2. DTOs (Data Transfer Objects) ---

export type tokens = {
  accessToken: string;
  refreshToken: string;
};

export type createUserDTO = Pick<User, "username" | "email"> & Partial<User>;

export type createUserType = { type: "legacy" | "oAuth"; provider?: string };
export type loginType = "google" | "legacy";

export type PublicUser = Omit<User, "password" | "oAuth" | "oAuthProvider">;

export type updateUserDTO = {
  username?: string;
  email?: string;
  password?: string;
  profileImage?: string;
  goals?: string;
  role?: {
    role: Array<Role>;
    action: "add" | "remove";
  };
  market_id?: string;
  stallNumber?: string;
  phone_number?: string;
  on_shift?: boolean;

  // You might want to allow admins/system to update these metrics
  available_chillings?: number;
  pending_chillings?: number;
  total_chillings_earned?: number;
  total_waste_submitted?: number;
  total_waste_processed?: number;
  co2_saved?: number;
  trees_equivalent?: number;
};

// --- NEW: The exact shape for your GET /api/vendor/rewards JSON response ---
export type VendorRewardsSummary = {
  availableChillings: number;
  pendingChillings: number;
  totalChillingsEarned: number;
  totalWasteSubmitted: number;
  totalWasteProcessed: number;
  impact: {
    co2Saved: number;
    treesEquivalent: number;
  };
  recentRewards: Pick<Reward, "id" | "amount" | "source" | "date" | "status">[];
};

// --- 3. REPOSITORIES & SERVICES ---

export interface UserRepo {
  editUser: (userId: string, newUserData: updateUserDTO) => Promise<User>;
  getUserById: (userId: string) => Promise<User>;
  getUserByEmail: (email: string) => Promise<User>;
  getAllUsers: () => Promise<User[]>;
  deleteUser: (userId: string) => Promise<void>;

  // Added a specific method to fetch vendor rewards
  getVendorRewardsSummary?: (userId: string) => Promise<VendorRewardsSummary>;
}

export interface Userservice {
  editUser: (userId: string, newUserData: updateUserDTO) => Promise<PublicUser>;
  getUserById: (userId: string) => Promise<PublicUser>;
  getUserByEmail: (email: string) => Promise<PublicUser>;
  getAllUsers: () => Promise<PublicUser[]>; // Usually you return PublicUser arrays, not full User with passwords
  deleteUser: (userId: string) => Promise<void>;

  // Added a specific method to fetch vendor rewards
  getVendorRewardsSummary?: (userId: string) => Promise<VendorRewardsSummary>;
}
