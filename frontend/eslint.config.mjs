import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  {
    ignores: [".next/**", "dist/**", "node_modules/**"]
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "react/no-unescaped-entities": "off",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    }
  }
]);

export default eslintConfig;
