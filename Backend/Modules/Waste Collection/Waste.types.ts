export type Waste = {
  id: string;
  userid: string;
  location: string;
  weight: number;
  created_at: string;
};

export type createWasteDTO = Omit<Waste, "id" | "created_at">;
export type editWasteDTO = Pick<Waste, "id"> &
  Partial<Omit<Waste, "created_at">>;

export interface WasteRepo {
  createWaste: (userId: string, wasteDetails: createWasteDTO) => Promise<Waste>;
  editWaste: (newWasteDetails: editWasteDTO) => Promise<Waste>;
  getUserWaste: (userId: string) => Promise<Waste[]>;
  getWaste: (wasteId: string) => Promise<Waste>;
  getAllWaste: () => Promise<Waste[]>;
  deleteWaste: (wasteId: string) => Promise<void>;
  deleteUserWaste: (userId: string) => Promise<void>;
  deleteAllWaste: () => Promise<void>;
}

export interface WasteServ {
  createWaste: (userId: string, wasteDetails: createWasteDTO) => Promise<Waste>;
  editWaste: (newWasteDetails: editWasteDTO) => Promise<Waste>;
  getUserWaste: (userId: string) => Promise<Waste[]>;
  getWaste: (wasteId: string) => Promise<Waste>;
  getAllWaste: () => Promise<Waste[]>;
  deleteWaste: (wasteId: string) => Promise<void>;
  deleteUserWaste: (userId: string) => Promise<void>;
  deleteAllWaste: () => Promise<void>;
}
