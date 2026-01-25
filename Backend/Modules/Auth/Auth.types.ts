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

export interface AuthRepo {
  register: (userData: createUserDTO, type: createUserType) => Promise<User>;
  login: (userData: createUserDTO, type: loginType) => Promise<User>;
  findRefreshToken: (token: string) => Promise<RefreshToken>;
  storeRefreshToken: (userId: string, refreshToken: string) => Promise<void>;
  revokeRefreshToken: (refreshToken: string) => Promise<void>;
}

export interface AuthServ {
  register: (userData: createUserDTO, type: createUserType) => Promise<tokens>;
  login: (userData: createUserDTO, type: loginType) => Promise<tokens>;
  refreshToken: (refreshToken: string) => Promise<Omit<tokens, "refreshToken">>;
}
