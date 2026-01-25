import { warningMsg } from "../../Utils/Logger.js";
import type { User, PublicUser } from "../Users/User.types.js";
import {
  createMarkeDTO,
  editMarketDTO,
  Market,
  MarketRepo,
  MarketServ,
} from "./Market.types.js";

export class MarketService implements MarketServ {
  constructor(private marketRepo: MarketRepo) {}

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

  async createMarket(marketDetails: createMarkeDTO): Promise<Market> {
    const allowedFields: string[] = ["name", "location"];

    let newMarketData: Record<string, string> = {};

    for (let [key, value] of Object.entries(marketDetails)) {
      if (!allowedFields.includes(key.toLowerCase())) continue;
      if (typeof value == "string" && value.length < 0)
        throw new Error(`${key} has an empty value`);

      newMarketData[key] = value;
    }

    const newMarket: Market = await this.marketRepo.createMarket(
      newMarketData as createMarkeDTO,
    );

    return newMarket;
  }

  async editMarket(newMarketDetails: editMarketDTO): Promise<Market> {
    const allowedFields: string[] = ["name", "location"];

    let newMarketData: Record<string, any> = {};

    for (let [key, value] of Object.entries(newMarketDetails)) {
      if (!allowedFields.includes(key.toLowerCase())) continue;
      if (typeof value == "string" && value.length < 0)
        throw new Error(`${key} has an empty value`);

      newMarketData[key] = value;
    }

    const newMarket: Market = await this.marketRepo.editMarket(
      newMarketDetails.id,
      newMarketData as editMarketDTO,
    );

    return newMarket;
  }

  async getMarket(marketId: string): Promise<Market> {
    try {
      const market = await this.getMarket(marketId);

      return market;
    } catch (error) {
      warningMsg("Error at getting single market");
      throw error;
    }
  }

  async getMarkets(): Promise<Market[]> {
    try {
      const markets = await this.marketRepo.getMarkets();

      return markets;
    } catch (error) {
      warningMsg("Error at get markets");
      throw error;
    }
  }

  async getMarketVendors(marketId: string): Promise<PublicUser[]> {
    if (!marketId) throw new Error("Market id was not provided");

    const getVendors = await this.marketRepo.getMarketVendors(marketId),
      vendors = getVendors.map((user) => this.createPublicUser(user));

    return vendors;
  }

  async deleteMarket(marketId: string): Promise<void> {
    try {
      if (!marketId) throw new Error("Market id not provided");

      await this.marketRepo.deleteMarket(marketId);
    } catch (error) {
      throw error;
    }
  }
}
