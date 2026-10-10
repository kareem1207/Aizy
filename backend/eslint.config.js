import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/**", "database/prisma/**"] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 2023, sourceType: "module", globals: { ...globals.node, ...globals.jest } },
    rules: { "no-unused-vars": ["warn", { argsIgnorePattern: "^_|^next$", varsIgnorePattern: "^_", ignoreRestSiblings: true }] },
  },
];
