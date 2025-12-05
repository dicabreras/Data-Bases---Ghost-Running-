import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["**/*.js", "**/*.cjs", "**/*.mjs", "**/*.ts", "**/*.tsx"],
		plugins: {
			"@typescript-eslint": tseslint.plugin,
			unicorn: unicorn
		},
		rules: {
			// --- Naming Convention Rules (TypeScript) ---
			"@typescript-eslint/naming-convention": [
				"error",

				{
					selector: "variable",
					format: ["camelCase", "UPPER_CASE"]
				},

				{
					selector: "function",
					format: ["camelCase", "PascalCase"]
				},

				{
					selector: "class",
					format: ["PascalCase"]
				},

				{
					selector: "interface",
					format: ["PascalCase"]
				},

				{
					selector: "enum",
					format: ["PascalCase"]
				},

				{
					selector: "typeAlias",
					format: ["PascalCase"]
				}
			],

			// --- Existing project rules ---
			"arrow-spacing": ["warn", { before: true, after: true }],
			"brace-style": ["error", "1tbs", { allowSingleLine: true }],
			"comma-dangle": ["warn", "never"],
			"comma-spacing": ["warn", { before: false, after: true }],
			"comma-style": ["error", "last"],
			curly: "error",
			"dot-location": ["error", "property"],
			indent: ["error", "tab"],
			"keyword-spacing": "error",
			"max-nested-callbacks": ["error", { max: 4 }],
			"no-console": "off",
			"no-empty-function": "warn",
			"no-floating-decimal": "warn",
			"no-inline-comments": "error",
			"no-lonely-if": "error",
			"no-multi-spaces": "error",
			"no-multiple-empty-lines": ["error", { max: 2, maxEOF: 0, maxBOF: 0 }],
			"no-shadow": ["error", { allow: ["err", "resolve", "reject"] }],
			"no-trailing-spaces": "error",
			"no-var": "error",
			"object-curly-spacing": [
				"error",
				"always",
				{ arraysInObjects: true, objectsInObjects: false }
			],
			"prefer-const": "error",
			quotes: "off",
			semi: ["error", "always"],
			"space-before-blocks": "error",
			"space-before-function-paren": [
				"error",
				{ anonymous: "never", named: "never", asyncArrow: "always" }
			],
			"space-in-parens": ["error", "never"],
			"space-infix-ops": "error",
			"space-unary-ops": "error",
			"spaced-comment": [
				"error",
				"always",
				{ line: { exceptions: ["="] }}
			],
			yoda: "error"
		},
		languageOptions: {
			sourceType: "module"
		}
	},
	{
		files: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
		rules: {
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
			"no-inline-comments": "off",
			"no-trailing-spaces": "off",
			"@typescript-eslint/no-require-imports": "off",
			// Allow shadowing in tests to avoid nested variable collisions in test mocks
			"no-shadow": "off"
		}
	}
];