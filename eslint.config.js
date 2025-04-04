import js from "@eslint/js";
import google from "eslint-config-google";

// Google JavaScript Style Guidelines - simplified for ESLint v9
const googleStyleRules = {
  "require-jsdoc": "off",
  "max-len": ["error", { code: 100 }],
  "object-curly-spacing": ["error", "always"],

  indent: ["error", 2],
  semi: ["error", "always"],
  "arrow-parens": ["error", "always"],

  "no-unused-vars": ["error", { argsIgnorePattern: "next|req|res" }],
  "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
  "key-spacing": ["error", { beforeColon: false, afterColon: true }],
  "space-in-parens": ["error", "never"],
  "keyword-spacing": ["error", { before: true, after: true }],
  "space-before-blocks": ["error", "always"],
  "space-before-function-paren": [
    "error",
    { anonymous: "always", named: "never", asyncArrow: "always" },
  ],
};

export default [
  js.configs.recommended,
  google,
  {
    ignores: [
      "node_modules/**",
      "frontend/node_modules/**",
      "frontend/src/**",
      "dist/**",
      ".git/**",
      "coverage/**",
      // Exclude CommonJS config files
      ".eslintrc.js",
      "frontend/.eslintrc.js",
      "frontend/postcss.config.js",
      "frontend/tailwind.config.js",
    ],
  },
  {
    files: ["server.js", "backend/**/*.js", "frontend/**/*.js", "frontend/**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",

      globals: {
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      ...googleStyleRules,
    },
  },
];
