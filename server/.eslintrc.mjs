import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: path.resolve(__dirname, "./tsconfig.json"),
    tsconfigRootDir: __dirname,
    sourceType: "module",
    ecmaVersion: "latest",
  },
  env: {
    node: true,
    es2021: true,
  },
  plugins: [
    "@typescript-eslint",
    "prettier",
    "import",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  rules: {
    "prettier/prettier": "error",

    "typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "typescript-eslint/no-explicit-any": "warn",

    "import/order": [
      "warn",
      {
        groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
        "newlines-between": "always"
      }
    ],
  },
  ignorePatterns: ["dist/", "node_modules/", ".eslintrc.js", ".eslintrc.cjs"],
}