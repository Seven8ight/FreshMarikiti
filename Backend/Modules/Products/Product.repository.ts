import { Client, Query, QueryResult } from "pg";
import {
  createProductDTO,
  Product,
  ProductRepo,
  updateProductDTO,
} from "./Product.types.js";
import { warningMsg } from "../../Utils/Logger.js";
import { UserRepository } from "../Users/User.repository.js";
import { warn } from "console";

export class ProductRepository implements ProductRepo {
  constructor(private DB: Client) {}

  async createProduct(userId: string, details: createProductDTO) {
    try {
      const vendor = await new UserRepository(this.DB).getUserById(userId),
        createProduct = await this.DB.query(
          "INSERT INTO products(name,sellerId,description,quantity,amount,category,image,market_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
          [
            details.name,
            userId,
            details.description,
            details.quantity,
            details.amount,
            details.category,
            details.image ? details.image : "",
            vendor.market_id,
          ],
        );

      return createProduct.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async editProduct(userId: string, newDetails: updateProductDTO) {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 3;

      for (let [key, value] of Object.entries(newDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const todoUpdate: QueryResult<Product> = await this.DB.query(
        `UPDATE products SET ${keys.join(",")} WHERE id=$1 and sellerid=$2 RETURNING *`,
        [newDetails.id, userId, ...values],
      );

      if (todoUpdate.rowCount && todoUpdate.rowCount > 0)
        return todoUpdate.rows[0]!;

      throw new Error(
        `Product item does not exist of id, ${newDetails.id} for user, ${userId}`,
      );
    } catch (error) {
      warningMsg("Product todo repo error occurred");
      throw error;
    }
  }

  async getVendorProducts(vendorId: string): Promise<Product[]> {
    try {
      const vendorProducts: QueryResult<Product> = await this.DB.query(
        "SELECT * FROM products where sellerid=$1",
        [vendorId],
      );

      return vendorProducts.rows;
    } catch (error) {
      warningMsg("Error at getting vendor products");
      throw error;
    }
  }

  async getProductById(productId: string) {
    try {
      const productRetrieval: QueryResult<Product> = await this.DB.query(
        "SELECT * FROM products WHERE id=$1",
        [productId],
      );

      return productRetrieval.rows[0];
    } catch (error) {
      warningMsg("Edit todo repo error occurred");
      throw error;
    }
  }

  async getProductsByCategory(category: string) {
    try {
      const productsRetrieval: QueryResult<Product> = await this.DB.query(
        "SELECT * FROM products WHERE category=$1",
        [category],
      );

      return productsRetrieval.rows;
    } catch (error) {
      warningMsg("Edit todo repo error occurred");
      throw error;
    }
  }

  async getAllProducts() {
    try {
      const productsRetrieval: QueryResult<Product> = await this.DB.query(
        "SELECT * FROM products",
      );

      return productsRetrieval.rows;
    } catch (error) {
      warningMsg("Get all products repo error occurred");
      throw error;
    }
  }

  async deleteProduct(userId: string, productId: string) {
    try {
      const productDeletion: QueryResult<any> = await this.DB.query(
        "DELETE FROM products WHERE id=$1 and sellerid=$2",
        [productId, userId],
      );

      if (productDeletion.rowCount && productDeletion.rowCount <= 0)
        throw new Error(`Product not found of id, ${productId}`);
    } catch (error) {
      warningMsg("Edit todo repo error occurred");
      throw error;
    }
  }

  async deleteAllSellerProducts(sellerId: string) {
    try {
      await this.DB.query("DELETE FROM products WHERE sellerId=$1", [sellerId]);
    } catch (error) {
      warningMsg("Delete products by seller repo error occurred");
      throw error;
    }
  }
}
