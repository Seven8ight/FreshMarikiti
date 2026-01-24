import { Client, QueryResult } from "pg";
import {
  createProductDTO,
  Product,
  ProductRepo,
  updateProductDTO,
} from "./Product.types";
import { warningMsg } from "../../Utils/Logger";

export class ProductRepository implements ProductRepo {
  constructor(private DB: Client) {}

  async createProduct(userId: string, details: createProductDTO) {
    try {
      const createProduct = await this.DB.query(
        "INSERT INTO products(name,sellerId,description,quantity,amount,category,image) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
        [
          details.name,
          userId,
          details.description,
          details.quantity,
          details.amount,
          details.category,
          details.image ? details.image : "",
        ],
      );

      return createProduct.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async editProduct(newDetails: updateProductDTO) {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const todoUpdate: QueryResult<Product> = await this.DB.query(
        `UPDATE todos SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        [newDetails.id, ...values],
      );

      if (todoUpdate.rowCount && todoUpdate.rowCount > 0)
        return todoUpdate.rows[0]!;

      throw new Error(`Product item does not exist of id, ${newDetails.id}`);
    } catch (error) {
      warningMsg("Product todo repo error occurred");
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
        "DELETE FROM products WHERE id=$1 and userId=$2",
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
