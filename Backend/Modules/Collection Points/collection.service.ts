import {
  CollectionPoint,
  CollectionPointRepository,
  CollectionPointService,
} from "./collection.types.js";

export class CollectionPointServ implements CollectionPointService {
  constructor(private repo: CollectionPointRepository) {}

  async createCollectionPoint(locationName: string): Promise<CollectionPoint> {
    try {
      if (!locationName) throw new Error("Location Name must be provided");

      const newCollectionPoint =
        await this.repo.createCollectionPoint(locationName);

      return newCollectionPoint;
    } catch (error) {
      throw error;
    }
  }

  async editCollectionPoint(
    locationId: string,
    newLocationName: string,
  ): Promise<CollectionPoint> {
    try {
      if (!locationId || !newLocationName)
        throw new Error("Location Id and location name must be provided");

      const updatedLocation = await this.repo.editCollectionPoint(
        locationId,
        newLocationName,
      );
      return updatedLocation;
    } catch (error) {
      throw error;
    }
  }

  async getCollectionPoint(id: string): Promise<CollectionPoint> {
    try {
      if (!id) throw new Error("Id must be provided");

      const collectionPoint = await this.repo.getCollectionPoint(id);

      return collectionPoint;
    } catch (error) {
      throw error;
    }
  }

  async getCollectionPoints(): Promise<CollectionPoint[]> {
    try {
      const collectionPoints = await this.repo.getCollectionPoints();

      return collectionPoints;
    } catch (error) {
      throw error;
    }
  }

  async deleteCollectionPoint(locationId: string): Promise<void> {
    try {
      if (!locationId) throw new Error("Location Id must be provided");

      await this.repo.deleteCollectionPoint(locationId);
    } catch (error) {
      throw error;
    }
  }
}
