import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import-x";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    plugins: {
      "import-x": importPlugin,
    },
    rules: {
      "import-x/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import-x/newline-after-import": "warn",
    },
  },
  {
    // The hero scene builds three.js objects once and mutates them every
    // frame inside `useFrame` — the standard react-three-fiber pattern, run
    // outside React render, so the compiler's immutability rule does not apply.
    files: ["src/components/sections/hero-scene/**/*.tsx"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
