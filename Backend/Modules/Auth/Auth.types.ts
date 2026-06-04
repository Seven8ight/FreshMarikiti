import type {
  createUserDTO,
  createUserType,
  loginType,
  User,
} from "../../Modules/Users/User.types.js";

export type tokens = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshToken = {
  id: string;
  token: string;
  created_at: string;
  expires_at: string;
};


export type OTP = {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  used: boolean;
  created_at: string;
};

export type createOtpDTO = {
  email: string;
  code: string;
  expires_at: Date;
};

export type verifyOtpDTO = {
  email: string;
  code: string;
};

export type resetPasswordDTO = {
  email: string;
  password: string;
};

export interface AuthRepo {
  register: (userData: createUserDTO, type: createUserType) => Promise<User>;
  login: (userData: createUserDTO, type: loginType) => Promise<User>;
  findRefreshToken: (token: string) => Promise<RefreshToken>;
  storeRefreshToken: (userId: string, refreshToken: string) => Promise<void>;
  revokeRefreshToken: (refreshToken: string) => Promise<void>;
  findUserByEmail: (email: string) => Promise<User>;
  saveOtp: (data: createOtpDTO) => Promise<OTP>;
  findOtp: (email: string) => Promise<OTP>;
  markOtpUsed: (id: string) => Promise<void>;
  updatePassword: (email: string, password: string) => Promise<void>;

}

export interface AuthServ {
  register: (userData: createUserDTO, type: createUserType) => Promise<tokens>;
  login: (userData: createUserDTO, type: loginType) => Promise<tokens>;
  refreshToken: (refreshToken: string) => Promise<Omit<tokens, "refreshToken">>;
  forgotPassword: (email: string) => Promise<void>;
  verifyOtp: (data: verifyOtpDTO) => Promise<void>;
  resetPassword: (data: resetPasswordDTO) => Promise<void>;

}