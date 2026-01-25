import { errorMsg, warningMsg } from "../../Utils/Logger.js";
import type {
  PublicUser,
  updateUserDTO,
  User,
  UserRepo,
  Userservice,
} from "./User.types.js";

export class UserService implements Userservice {
  constructor(private UserRepo: UserRepo) {}

  private createPublicUser(userData: User): PublicUser {
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      profileImage: (userData as any).profile_image,
      biocoins: userData.biocoins,
      goals: userData.goals,
      phone_number: userData.phone_number,
      role: userData.role,
    };
  }

  async editUser(userId: string, newUserData: updateUserDTO) {
    if (!userId) throw new Error("User id not provided for editing");

    try {
      const allowedFields: string[] = [
        "username",
        "email",
        "password",
        "profileimage",
        "role",
        "phone_number",
        "goals",
        "action",
      ];

      let newUserObject: Record<string, any> = {};

      if (newUserData.role) {
        const user = await this.UserRepo.getUserById(userId);

        if (!user.role.includes("admin"))
          throw new Error(
            "You do not have permission to add/update roles, only admins can",
          );
      }

      for (let [key, value] of Object.entries(newUserData)) {
        if (!allowedFields.includes(key.toLowerCase())) continue;
        if (value == null || (typeof value == "string" && value.length < 0))
          throw new Error(`${key} has an empty value`);

        if (key.toLowerCase() == "profileimage")
          newUserObject["profile_image"] = value;
        else newUserObject[key] = value;
      }

      const updatedUser = await this.UserRepo.editUser(userId, newUserObject);

      return this.createPublicUser(updatedUser);
    } catch (error) {
      warningMsg("Edit user service error occurred");
      throw error;
    }
  }

  async getUserById(userId: string) {
    if (!userId) throw new Error("User id not provided for retrieval");

    try {
      const retrieveUser = await this.UserRepo.getUserById(userId);

      return this.createPublicUser(retrieveUser);
    } catch (error) {
      errorMsg(`${(error as Error).message}`);
      warningMsg("Get user service error occurred");
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    if (!email) throw new Error("User id not provided for retrieval");

    try {
      const retrieveUser = await this.UserRepo.getUserByEmail(email);

      return this.createPublicUser(retrieveUser);
    } catch (error) {
      errorMsg(`${(error as Error).message}`);
      warningMsg("Get user service error occurred");
      throw error;
    }
  }

  async deleteUser(userId: string) {
    if (!userId) throw new Error("User id not provided for deletion");

    try {
      await this.UserRepo.deleteUser(userId);
    } catch (error) {
      warningMsg("Delete user service error occurred");
      throw error;
    }
  }
}
