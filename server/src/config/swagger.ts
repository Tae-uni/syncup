import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";

const swaggerDocument = YAML.parse(
  fs.readFileSync(path.join(__dirname, "../../swagger.yaml"), "utf-8")
);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}