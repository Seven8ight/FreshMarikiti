export type Feedback = {
  id: string;
  userid: string;
  comment: string;
  category: string;
  productid: string;
  rating: number;
};

export type createFeedbackDTO = Omit<Feedback, "id">;
export type editFeedbackDTO = Pick<Feedback, "id"> &
  Partial<Omit<Feedback, "userid" | "productid">>;

export interface FeedbackRepo {
  createFeedback: (
    userId: string,
    feedback: createFeedbackDTO,
  ) => Promise<Feedback>;
  editFeedback: (newFeedbackDetails: editFeedbackDTO) => Promise<Feedback>;
  getFeedbacksByProductId: (productId: string) => Promise<Feedback[]>;
  getFeedbackById: (feedbackId: string) => Promise<Feedback>;
  deleteFeedbackById: (feedbackId: string) => Promise<void>;
  deleteAllProductFeedback: (productId: string) => Promise<void>;
  deleteUserFeedback: (userId: string) => Promise<void>;
}

export interface FeedbackServ {
  createFeedback: (
    userId: string,
    feedback: createFeedbackDTO,
  ) => Promise<Feedback>;
  editFeedback: (newFeedbackDetails: editFeedbackDTO) => Promise<Feedback>;
  getFeedbacksByProductId: (productId: string) => Promise<Feedback[]>;
  getFeedbackById: (feedbackId: string) => Promise<Feedback>;
  deleteFeedbackById: (feedbackId: string) => Promise<void>;
  deleteAllProductFeedback: (productId: string) => Promise<void>;
  deleteUserFeedback: (userId: string) => Promise<void>;
}
