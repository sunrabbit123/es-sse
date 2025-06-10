import antfu from "@antfu/eslint-config";

export default antfu({
  formatters: true,
  typescript: {
    tsconfigPath: "./tsconfig.json",
    overridesTypeAware: {
      "ts/strict-boolean-expressions": ["error", { allowNullableBoolean: false, allowNullableObject: false, allowString: false }],
    },
  },
  yaml: {
    overrides: {
      indent: 2,
    },
  },
  stylistic: {
    indent: 2,
    quotes: "double",
    semi: true,
  },
  ignores: ["vitest.config.mts", "tsup.config.ts"],
});
