import type {
  User,
  UserRepo,
  Userservice,
  updateUserDTO,
  PublicUser,
  VendorRewardsSummary,
} from "./User.types.js";
import { errorMsg, warningMsg } from "./../../Utils/Logger.js";

export class UserService implements Userservice {
  constructor(private userRepo: UserRepo) {}

  /**
   * Helper utility to strip sensitive data from the raw User database model
   * before returning it to the client.
   */
  private toPublicUser(user: User): PublicUser {
    const { password, oAuth, oAuthProvider, ...publicUserData } = user;
    return publicUserData;
  }

  async editUser(
    userId: string,
    newUserData: updateUserDTO,
  ): Promise<PublicUser> {
    try {
      const updatedUser = await this.userRepo.editUser(userId, newUserData);
      return this.toPublicUser(updatedUser);
    } catch (error) {
      warningMsg(`Service: Failed to edit user ${userId}`);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<PublicUser> {
    try {
      const user = await this.userRepo.getUserById(userId);
      return this.toPublicUser(user);
    } catch (error) {
      warningMsg(`Service: Failed to get user by id ${userId}`);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<PublicUser> {
    try {
      const user = await this.userRepo.getUserByEmail(email);
      return this.toPublicUser(user);
    } catch (error) {
      warningMsg(`Service: Failed to get user by email ${email}`);
      throw error;
    }
  }

  async getAllUsers(): Promise<PublicUser[]> {
    try {
      const users = await this.userRepo.getAllUsers();
      // Map through all users to remove sensitive data
      return users.map((user) => this.toPublicUser(user));
    } catch (error) {
      errorMsg(`Service Error at getAllUsers: ${(error as Error).message}`);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.userRepo.deleteUser(userId);
    } catch (error) {
      warningMsg(`Service: Failed to delete user ${userId}`);
      throw error;
    }
  }

  // --- NEW METHOD FOR REWARDS ---
  async getVendorRewardsSummary(userId: string): Promise<VendorRewardsSummary> {
    try {
      // Safety check: ensure the method exists on the repo (since it's optional in the interface)
      if (!this.userRepo.getVendorRewardsSummary) {
        throw new Error(
          "getVendorRewardsSummary is not implemented in the repository",
        );
      }

      const summary = await this.userRepo.getVendorRewardsSummary(userId);
      return summary;
    } catch (error) {
      warningMsg(`Service: Failed to get vendor rewards for user ${userId}`);
      throw error;
    }
  }
}
