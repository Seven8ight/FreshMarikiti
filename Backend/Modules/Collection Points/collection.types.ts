export type CollectionPoint = {
  id: string;
  name: string;
  created_at: string;
};

export interface CollectionPointRepository {
  createCollectionPoint: (locationName: string) => Promise<CollectionPoint>;
  editCollectionPoint: (
    locationId: string,
    newLocationName: string,
  ) => Promise<CollectionPoint>;
  getCollectionPoints: () => Promise<CollectionPoint[]>;
  getCollectionPoint: (id: string) => Promise<CollectionPoint>;
  deleteCollectionPoint: (locationId: string) => Promise<void>;
}

export interface CollectionPointService {
  createCollectionPoint: (locationName: string) => Promise<CollectionPoint>;
  editCollectionPoint: (
    locationId: string,
    newLocationName: string,
  ) => Promise<CollectionPoint>;
  getCollectionPoints: () => Promise<CollectionPoint[]>;
  getCollectionPoint: (id: string) => Promise<CollectionPoint>;
  deleteCollectionPoint: (locationId: string) => Promise<void>;
}
