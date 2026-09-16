const eslint = require("@eslint/js");
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
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
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

      // Rules to be enabled: this library passes `any` around a lot, typing that properly is a
      // separate exercise. The number of findings at the time of writing is behind each rule.
      "@typescript-eslint/no-unsafe-assignment": "off", // 19
      "@typescript-eslint/no-unsafe-return": "off", // 13
      "@typescript-eslint/no-unsafe-call": "off", // 5
      "@typescript-eslint/no-unsafe-argument": "off", // 2
    },
  },
  {
    files: ["test/**/*.ts"],
    rules: {
      // Chai assertions like `expect(result).to.be.undefined` are expressions.
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
);
