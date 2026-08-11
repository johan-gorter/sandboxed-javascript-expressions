const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "dist/**",
      ".vscode/**",
      "public/**",
      ".cicleci/**",
      "templates/**",
    ],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 11,
        sourceType: "module",
        project: [
          "./src/tsconfig.json",
          "./tsconfig.json",
        ],
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Additional rules:
      "eqeqeq": "error",
      "no-console": "error",
      "no-return-await": "error",
      "prefer-template": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],

      // Should be enabled by recommended...
      "no-unreachable": "error",

      // Additional config for rules:
      "quotes": ["warn", "double", { "avoidEscape": true }],
      "@typescript-eslint/explicit-module-boundary-types": ["error", { "allowArgumentsExplicitlyTypedAsAny": true }],

      // Disabled rules:
      "prefer-const": "off",
      "no-shadow": "off", // Replaced with "@typescript-eslint/no-shadow".
      "no-unused-vars": "off", // Replaced with "@typescript-eslint/no-unused-vars".
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/ban-ts-comment": "off",

      // Rules to be enabled:
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-implied-eval": "off",
      "no-prototype-builtins": "off",
      "@typescript-eslint/restrict-template-expressions": "off",

      // Rules to be discussed:
      "prefer-spread": "off",
      "no-async-promise-executor": "off",
      "no-case-declarations": "off",
      "no-fallthrough": "off",
      "no-inner-declarations": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/prefer-regexp-exec": "off",
    },
  },
);
