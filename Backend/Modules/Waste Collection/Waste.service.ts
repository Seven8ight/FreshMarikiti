import {
  Waste,
  WasteRepo,
  WasteServ,
  createWasteDTO,
  editWasteDTO,
} from "./Waste.types";
import { warningMsg } from "../../Utils/Logger";

export class WasteService implements WasteServ {
  constructor(private wasteRepo: WasteRepo) {}

  async createWaste(wasteDetails: createWasteDTO): Promise<Waste> {
    if (!wasteDetails.userid)
      throw new Error("User id should be provided for product creation");

    const allowedFields: string[] = ["userid", "location", "weight"];

    let newProductData: Record<string, any> = {};

    for (let [key, value] of Object.entries(wasteDetails)) {
      if (!allowedFields.includes(key.toLowerCase())) continue;
      if (typeof value == "string" && value.length < 0)
        throw new Error(`${key} has an empty value`);

      newProductData[key] = value;
    }

    const newWaste: Waste = await this.wasteRepo.createWaste(wasteDetails);

    return newWaste;
  }

  async editWaste(newWasteDetails: editWasteDTO): Promise<Waste> {
    try {
      const allowedFields: string[] = ["userid", "location", "weight"];

      let newWasteObject: Record<string, any> = {};

      for (let [key, value] of Object.entries(newWasteDetails)) {
        if (!allowedFields.includes(key.toLowerCase())) continue;
        if (!value) throw new Error(`${key} has no value`);
        if (typeof value == "string" && value.length < 0)
          throw new Error(`${key} has an empty value`);

        newWasteObject[key] = value;
      }

      newWasteObject["id"] = newWasteDetails.id;

      const updatedWaste = await this.wasteRepo.editWaste(
        newWasteObject as editWasteDTO,
      );

      return updatedWaste;
    } catch (error) {
      warningMsg("Edit user service error occurred");
      throw error;
    }
  }

  async getWaste(wasteId: string): Promise<Waste> {
    if (!wasteId) throw new Error("Product id not provided for retrieval");

    try {
      const retrieveWasteById = await this.wasteRepo.getWaste(wasteId);

      return retrieveWasteById;
    } catch (error) {
      warningMsg("Get todo service error occurred");
      throw error;
    }
  }

  async getUserWaste(userId: string): Promise<Waste[]> {
    if (!userId) throw new Error("Category not provided for retrieval");

    try {
      const retrieveWasteByUserID = await this.wasteRepo.getUserWaste(userId);

      return retrieveWasteByUserID;
    } catch (error) {
      warningMsg("Get todo service error occurred");
      throw error;
    }
  }

  async getAllWaste(): Promise<Waste[]> {
    try {
      const retrieveAllWaste = await this.wasteRepo.getAllWaste();

      return retrieveAllWaste;
    } catch (error) {
      warningMsg("Get todo service error occurred");
      throw error;
    }
  }

  async deleteWaste(wasteId: string): Promise<void> {
    if (!wasteId) throw new Error("Product id not provided for deletion");

    try {
      await this.wasteRepo.deleteWaste(wasteId);
    } catch (error) {
      warningMsg("Delete user service error occurred");
      throw error;
    }
  }

  async deleteUserWaste(userId: string): Promise<void> {
    if (!userId) throw new Error("Seller id not provided for deletion");

    try {
      await this.wasteRepo.deleteUserWaste(userId);
    } catch (error) {
      warningMsg("Delete user service error occurred");
      throw error;
    }
  }

  async deleteAllWaste(): Promise<void> {
    try {
      await this.wasteRepo.deleteAllWaste();
    } catch (error) {
      warningMsg("Error at deleting all waste");
      throw error;
    }
  }
}
