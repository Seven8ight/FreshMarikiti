import { warningMsg } from "../../Utils/Logger.js";
import {
  createFeedbackDTO,
  editFeedbackDTO,
  Feedback,
  FeedbackRepo,
  FeedbackServ,
} from "./Feedback.types.js";

export class FeedbackService implements FeedbackServ {
  constructor(private feedbackRepo: FeedbackRepo) {}

  async createFeedback(
    userId: string,
    feedback: createFeedbackDTO,
  ): Promise<Feedback> {
    if (!userId)
      throw new Error("User id should be provided for product creation");

    const allowedFields: string[] = [
      "userid",
      "comment",
      "category",
      "productid",
      "rating",
    ];

    let newFeedbackData: Record<string, any> = {};

    for (let [key, value] of Object.entries(feedback)) {
      if (!allowedFields.includes(key.toLowerCase())) continue;
      if (typeof value == "string" && value.length < 0)
        throw new Error(`${key} has an empty value`);

      newFeedbackData[key] = value;
    }

    const newFeedback: Feedback = await this.feedbackRepo.createFeedback(
      userId,
      newFeedbackData as createFeedbackDTO,
    );

    return newFeedback;
  }

  async editFeedback(newFeedbackDetails: editFeedbackDTO): Promise<Feedback> {
    if (!newFeedbackDetails.id) throw new Error("Feedback id not provided");

    try {
      const allowedFields: string[] = [
        "userid",
        "comment",
        "category",
        "productid",
        "rating",
      ];

      let newFeedbackObject: Record<string, any> = {};

      for (let [key, value] of Object.entries(newFeedbackDetails)) {
        if (!allowedFields.includes(key.toLowerCase())) continue;
        if (!value) throw new Error(`${key} has no value`);
        if (typeof value == "string" && value.length < 0)
          throw new Error(`${key} has an empty value`);

        newFeedbackObject[key] = value;
      }

      newFeedbackObject["id"] = newFeedbackDetails.id;

      const updatedOrder = await this.feedbackRepo.editFeedback(
        newFeedbackObject as editFeedbackDTO,
      );

      return updatedOrder;
    } catch (error) {
      warningMsg("Edit feedback service error occurred");
      throw error;
    }
  }

  async getFeedbackById(feedbackId: string): Promise<Feedback> {
    if (!feedbackId) throw new Error("Feedback id not provided");

    try {
      const getFeedbackById: Feedback =
        await this.feedbackRepo.getFeedbackById(feedbackId);

      return getFeedbackById;
    } catch (error) {
      warningMsg("Get feedback by id service error occurred");
      throw error;
    }
  }

  async getFeedbacksByProductId(productId: string): Promise<Feedback[]> {
    if (!productId) throw new Error("Product id not provided");

    try {
      const getFeedbackByProductIdOperation: Feedback[] =
        await this.feedbackRepo.getFeedbacksByProductId(productId);

      return getFeedbackByProductIdOperation;
    } catch (error) {
      warningMsg("Get feedback by id service error occurred");
      throw error;
    }
  }

  async deleteAllProductFeedback(productId: string): Promise<void> {
    if (!productId) throw new Error("Product id not provided");

    try {
      await this.feedbackRepo.deleteAllProductFeedback(productId);
    } catch (error) {
      warningMsg("Get feedback by id service error occurred");
      throw error;
    }
  }

  async deleteFeedbackById(feedbackId: string): Promise<void> {
    if (!feedbackId) throw new Error("Feedback id not provided");

    try {
      await this.feedbackRepo.deleteFeedbackById(feedbackId);
    } catch (error) {
      warningMsg("Get feedback by id service error occurred");
      throw error;
    }
  }

  async deleteUserFeedback(userId: string): Promise<void> {
    if (!userId) throw new Error("Feedback id not provided");

    try {
      await this.feedbackRepo.deleteAllProductFeedback(userId);
    } catch (error) {
      warningMsg("Get feedback by id service error occurred");
      throw error;
    }
  }
}
