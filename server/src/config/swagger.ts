import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";

const swaggerDocument = YAML.parse(
  fs.readFileSync(path.join(__dirname, "../../swagger.yaml"), "utf-8")
);

export function setupSwagger(app: Express) {
  // disable Swagger try-it-out in production
  const setupOptions =
    process.env.NODE_ENV === "production"
      ? { swaggerOptions: { supportedSubmitMethods: [] } }
      : undefined;

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, setupOptions));
}