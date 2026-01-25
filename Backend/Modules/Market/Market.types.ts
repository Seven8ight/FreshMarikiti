import type { PublicUser, User } from "../Users/User.types.js";

export type Market = {
  id: string;
  name: string;
  vendors: number;
  location: string;
  created_at: Date;
};

export type createMarkeDTO = Omit<Market, "id" | "created_at" | "vendors">;
export type editMarketDTO = Pick<Market, "id"> &
  Partial<Omit<Market, "created_at">>;

export interface MarketRepo {
  createMarket: (marketDetails: createMarkeDTO) => Promise<Market>;
  editMarket: (
    marketId: string,
    newMarketDetails: editMarketDTO,
  ) => Promise<Market>;
  getMarketVendors: (marketId: string) => Promise<User[]>;
  getMarket: (marketId: string) => Promise<Market>;
  getMarkets: () => Promise<Market[]>;
  deleteMarket: (marketId: string) => Promise<void>;
}

export interface MarketServ {
  createMarket: (marketDetails: createMarkeDTO) => Promise<Market>;
  editMarket: (newMarketDetails: editMarketDTO) => Promise<Market>;
  getMarket: (marketId: string) => Promise<Market>;
  getMarkets: () => Promise<Market[]>;
  getMarketVendors: (marketId: string) => Promise<PublicUser[]>;
  deleteMarket: (marketId: string) => Promise<void>;
}
