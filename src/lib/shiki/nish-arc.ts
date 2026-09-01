import type { ThemeRegistrationRaw } from "shiki";

/**
 * `nish-arc` — the dark-mode syntax theme for blog code blocks, built from the
 * site's dark palette so highlighted code sits in the same colour world as the
 * page around it.
 *
 * Every foreground here clears 4.5:1 against the theme background (#05070D),
 * including comments — the palette's `--muted-dim` (#5C6B7D) is decorative only
 * and lands at 3.7:1, so comments use the lifted #7A8A9C (5.7:1) instead.
 *
 * Token rules live under `settings` rather than the VS Code `tokenColors` alias:
 * shiki copies `tokenColors` into `settings` at load time, and `settings` is the
 * field its `ThemeRegistrationRaw` type actually requires.
 */
export const nishArc = {
  name: "nish-arc",
  type: "dark",
  colors: {
    "editor.background": "#05070D",
    "editor.foreground": "#DDE7F0",
  },
  settings: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#7A8A9C" },
    },
    {
      scope: ["string", "string.quoted", "string.template", "meta.embedded.assembly"],
      settings: { foreground: "#2EE6A8" },
    },
    {
      scope: [
        "constant",
        "constant.numeric",
        "constant.language",
        "constant.character.escape",
        "variable.other.constant",
      ],
      settings: { foreground: "#FFB339" },
    },
    {
      scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.operator"],
      settings: { foreground: "#33E1FF" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: "#7BEBFF" },
    },
    {
      scope: ["variable", "variable.parameter", "meta.definition.variable", "support.variable"],
      settings: { foreground: "#DDE7F0" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "entity.other.inherited-class",
        "support.class",
        "support.type",
      ],
      settings: { foreground: "#FFB339" },
    },
    {
      scope: ["entity.name.tag", "entity.other.attribute-name"],
      settings: { foreground: "#33E1FF" },
    },
    {
      scope: ["invalid", "invalid.illegal", "invalid.deprecated"],
      settings: { foreground: "#FF4D6D" },
    },
    {
      scope: ["punctuation", "meta.brace", "punctuation.separator", "punctuation.terminator"],
      settings: { foreground: "#8A9BB0" },
    },
    {
      scope: ["markup.heading", "entity.name.section"],
      settings: { foreground: "#33E1FF", fontStyle: "bold" },
    },
    {
      scope: ["markup.inserted", "meta.diff.header.to-file"],
      settings: { foreground: "#2EE6A8" },
    },
    {
      scope: ["markup.deleted", "meta.diff.header.from-file"],
      settings: { foreground: "#FF4D6D" },
    },
  ],
} satisfies ThemeRegistrationRaw;
