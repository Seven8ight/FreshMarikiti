import { IncomingMessage, ServerResponse } from "node:http";
import { ProductRepository } from "./Product.repository.js";
import { pgClient } from "../../Config/Db.js";
import { ProductService } from "./Product.service.js";
import { verifyAccessToken } from "../../Utils/JWT.js";
import { Product } from "./Product.types.js";

export const ProductController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean),
    { authorization } = request.headers;

  if (!authorization) {
    response.writeHead(401);
    response.end(
      JSON.stringify({
        error: "Authorization tokens must be provided",
      }),
    );
    return;
  }

  const userVerifier = verifyAccessToken(authorization.split(" ")[1] as string);

  if (!userVerifier) {
    response.writeHead(403);
    response.end(
      JSON.stringify({
        error: "Authentication failed, re-log in",
      }),
    );
    return;
  }

  if (
    !userVerifier.role.includes("vendor") ||
    userVerifier.role.includes("admin")
  ) {
    response.writeHead(400);
    response.end(
      JSON.stringify({
        error: "User does not have permission to use this api route",
      }),
    );
    return;
  }

  const userId = userVerifier.id;

  let unparsedRequestBody: string = "";

  const productRepo = new ProductRepository(pgClient),
    productService = new ProductService(productRepo);

  request.on(
    "data",
    (buffer: Buffer) => (unparsedRequestBody += buffer.toString()),
  );

  request.on("end", async () => {
    try {
      if (unparsedRequestBody.length <= 0) unparsedRequestBody = "{}";
      let parsedRequestBody: any;

      if (unparsedRequestBody.length > 0)
        parsedRequestBody = JSON.parse(unparsedRequestBody);

      switch (pathNames[2]) {
        case "create":
          if (request.method != "POST") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use POST instead",
              }),
            );
            return;
          }

          const createOperation: Product = await productService.createProduct(
            userId,
            parsedRequestBody,
          );

          response.writeHead(201);
          response.end(JSON.stringify(createOperation));
          break;
        case "edit":
          if (request.method != "PATCH") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use PATCH instead",
              }),
            );
            return;
          }

          const editOperation = await productService.editProduct(
            userId,
            parsedRequestBody,
          );

          response.writeHead(201);
          response.end(JSON.stringify(editOperation));
          break;
        case "get":
          if (request.method != "GET") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use GET instead",
              }),
            );
            return;
          }
          const searchParams = requestUrl.searchParams,
            type = searchParams.get("type");

          if (!type) {
            response.writeHead(404);
            response.end(
              JSON.stringify({
                error: "Provide type in the search params",
              }),
            );
            return;
          }

          if (type == "all") {
            const retrieveAllProducts = await productService.getAllProducts();

            response.writeHead(200);
            response.end(JSON.stringify(retrieveAllProducts));
          } else if (type == "category") {
            const category = searchParams.get("category");

            if (!category)
              throw new Error("Provide the category in search params");

            const retrieveProductsByCategory =
              await productService.getProductByCategory(category);

            response.writeHead(200);
            response.end(JSON.stringify(retrieveProductsByCategory));
          } else if (type == "id") {
            const productId = searchParams.get("productid");

            if (!productId)
              throw new Error("Provide the product id in search params");

            const retrieveProductById =
              await productService.getProductById(productId);

            response.writeHead(200);
            response.end(JSON.stringify(retrieveProductById));
          } else if (type == "vendor") {
            const vendorId = searchParams.get("vendorid");

            if (!vendorId)
              throw new Error("Provide the vendor id in search params");

            const retrieveVendorProducts =
              await productService.getVendorProducts(vendorId);

            response.writeHead(200);
            response.end(JSON.stringify(retrieveVendorProducts));
          } else throw new Error("Type should be either id,category or all");

          break;
        case "delete":
          if (request.method != "DELETE") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use DELETE instead",
              }),
            );
            return;
          }

          const searchDeletionParams = requestUrl.searchParams,
            typeDeletion = searchDeletionParams.get("type");

          if (!typeDeletion) {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: "Provide type in search params",
              }),
            );
            return;
          }

          if (typeDeletion == "one") {
            const productId = searchDeletionParams.get("productid");

            if (!productId) {
              response.writeHead(404);
              response.end(
                JSON.stringify({
                  error: "Provide product id in the search params",
                }),
              );
              return;
            }

            await productService.deleteProduct(userId, productId);

            response.writeHead(204);
            response.end();
          } else if (typeDeletion == "all") {
            await productService.deleteAllSellerProducts(userId);

            response.writeHead(204);
            response.end();
          } else {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: "Invalid type value specify all or one",
              }),
            );
          }
          break;
      }
    } catch (error) {
      response.writeHead(400);
      response.end(
        JSON.stringify({
          error: (error as Error).message,
        }),
      );
    }
  });
};
