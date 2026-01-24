export type Product = {
  id: string;
  name: string;
  sellerId: string;
  description: string;
  quantity: number;
  image?: string;
  amount: number;
  category: string;
};

export type createProductDTO = Omit<Product, "id" | "sellerId">;

export type updateProductDTO = Pick<Product, "id"> &
  Partial<Omit<Product, "sellerId">>;

export interface ProductRepo {
  createProduct: (
    userId: string,
    details: createProductDTO,
  ) => Promise<Product>;
  editProduct: (newDetails: updateProductDTO) => Promise<Product>;
  getProductById: (productId: string) => Promise<Product>;
  getProductsByCategory: (category: string) => Promise<Product[]>;
  getAllProducts: () => Promise<Product[]>;
  deleteProduct: (userId: string, productId: string) => Promise<void>;
  deleteAllSellerProducts: (sellerId: string) => Promise<void>;
}

export interface ProductServ {
  createProduct: (userId: string, details: Product) => Promise<Product>;
  editProduct: (newDetails: updateProductDTO) => Promise<Product>;
  getProductById: (productId: string) => Promise<Product>;
  getProductByCategory: (category: string) => Promise<Product[]>;
  getAllProducts: () => Promise<Product[]>;
  deleteProduct: (userId: string, productId: string) => Promise<void>;

  deleteAllSellerProducts: (sellerId: string) => Promise<void>;
}
