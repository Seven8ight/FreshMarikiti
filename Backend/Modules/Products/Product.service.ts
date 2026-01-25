import {
  Product,
  ProductRepo,
  ProductServ,
  updateProductDTO,
} from "./Product.types.js";
import { warningMsg } from "../../Utils/Logger.js";

export class ProductService implements ProductServ {
  constructor(private productRepo: ProductRepo) {}

  async createProduct(userId: string, details: Product): Promise<Product> {
    if (!userId)
      throw new Error("User id should be provided for product creation");
    const allowedFields: string[] = [
      "name",
      "sellerid",
      "description",
      "quantity",
      "image",
      "amount",
      "category",
    ];

    let newProductData: Record<string, any> = {};

    for (let [key, value] of Object.entries(details)) {
      if (!allowedFields.includes(key.toLowerCase())) continue;
      if (typeof value == "string" && value.length < 0)
        throw new Error(`${key} has an empty value`);

      newProductData[key] = value;
    }

    const newProduct: Product = await this.productRepo.createProduct(
      userId,
      details,
    );

    return newProduct;
  }

  async editProduct(newDetails: updateProductDTO): Promise<Product> {
    try {
      const allowedFields: string[] = [
        "name",
        "description",
        "quantity",
        "image",
        "amount",
        "category",
      ];

      let newProductObject: Record<string, any> = {};

      for (let [key, value] of Object.entries(newDetails)) {
        if (!allowedFields.includes(key.toLowerCase())) continue;
        if (!value) throw new Error(`${key} has no value`);
        if (typeof value == "string" && value.length < 0)
          throw new Error(`${key} has an empty value`);

        newProductObject[key] = value;
      }

      newProductObject["id"] = newDetails.id;

      const updatedTodo = await this.productRepo.editProduct(
        newProductObject as updateProductDTO,
      );

      return updatedTodo;
    } catch (error) {
      warningMsg("Edit user service error occurred");
      throw error;
    }
  }

  async getProductById(productId: string): Promise<Product> {
    if (!productId) throw new Error("Product id not provided for retrieval");

    try {
      const retrieveProductsById =
        await this.productRepo.getProductById(productId);

      return retrieveProductsById;
    } catch (error) {
      warningMsg("Get todo service error occurred");
      throw error;
    }
  }

  async getProductByCategory(category: string): Promise<Product[]> {
    if (!category) throw new Error("Category not provided for retrieval");

    try {
      const retrieveProductsByCategory =
        await this.productRepo.getProductsByCategory(category);

      return retrieveProductsByCategory;
    } catch (error) {
      warningMsg("Get todo service error occurred");
      throw error;
    }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const retrieveAllProducts = await this.productRepo.getAllProducts();

      return retrieveAllProducts;
    } catch (error) {
      warningMsg("Get todo service error occurred");
      throw error;
    }
  }

  async deleteProduct(userId: string, productId: string): Promise<void> {
    if (!productId) throw new Error("Product id not provided for deletion");

    try {
      await this.productRepo.deleteProduct(userId, productId);
    } catch (error) {
      warningMsg("Delete user service error occurred");
      throw error;
    }
  }

  async deleteAllSellerProducts(sellerId: string): Promise<void> {
    if (!sellerId) throw new Error("Seller id not provided for deletion");

    try {
      await this.productRepo.deleteAllSellerProducts(sellerId);
    } catch (error) {
      warningMsg("Delete user service error occurred");
      throw error;
    }
  }
}
