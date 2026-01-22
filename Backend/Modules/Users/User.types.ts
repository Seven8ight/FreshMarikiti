export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  profileImage: string;
  oAuth: boolean;
  oAuthProvider: string;
  biocoins: number;
  goals: string;
};

export type tokens = {
  accessToken: string;
  refreshToken: string;
};

export type createUserDTO = Pick<User, "username" | "email"> & Partial<User>;

export type createUserType = { type: "legacy" | "oAuth"; provider?: string };
export type loginType = "google" | "legacy";

export type PublicUser = Omit<User, "password" | "oAuth" | "oAuthProvider">;

export type updateUserDTO = Omit<
  Partial<User>,
  "id" | "oAuth" | "oAuthProvider"
>;

export interface UserRepo {
  editUser: (userId: string, newUserData: updateUserDTO) => Promise<User>;
  getUserById: (userId: string) => Promise<User>;
  getUserByEmail: (email: string) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
}

export interface Userservice {
  editUser: (userId: string, newUserData: updateUserDTO) => Promise<PublicUser>;
  getUserById: (userId: string) => Promise<PublicUser>;
  getUserByEmail: (email: string) => Promise<PublicUser>;
  deleteUser: (userId: string) => Promise<void>;
}
