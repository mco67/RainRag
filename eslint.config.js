// @ts-check
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default tseslint.config(
  // Ignore build folder
  { ignores: ["dist"] },
  // Ignore other files
  { ignores: ["**/node_modules/**"] },
  { files: ["**/*.{ts,js}"] },

  pluginJs.configs.recommended,
  tseslint.configs.strictTypeChecked,
  stylistic.configs.customize({ flat: true }),

  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
  },

  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.nodeBuiltin,
        ...globals.node,
        ...globals.es2024,
      },
    },
  },

  {
    files: ["**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      sourceType: "commonjs",
      parserOptions: {
        project: false,
      },
    },
  },

  {
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  }
);
