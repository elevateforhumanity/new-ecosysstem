import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: true }
    },
    ignores: ["dist/", "node_modules/"],
    rules: {
      // custom rules here
    }
  }
);