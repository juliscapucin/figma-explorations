import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const tokensDir = path.join(projectRoot, "tokens");
const outputFile = path.join(projectRoot, "src/styles/tokens.css");
const tailwindThemeFile = path.join(projectRoot, "src/styles/tailwind-theme.css");

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const toKebab = (value) =>
  String(value)
    .trim()
    .replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const tokenPathToVarName = (tokenPath) =>
  tokenPath.map((part) => toKebab(part)).filter(Boolean).join("-");

const normalizeCollectionName = (value) =>
  tokenPathToVarName([value || "tokens"]) || "tokens";

const typeOrder = new Map([
  ["COLOR", 1],
  ["FLOAT", 2],
  ["STRING", 3],
  ["BOOLEAN", 4],
]);

const compareTokens = (a, b) => {
  const coll = a.collection.localeCompare(b.collection);
  if (coll !== 0) return coll;

  // top-level tokens (no group) sort before any named subgroup
  if (a.group === "" && b.group !== "") return -1;
  if (a.group !== "" && b.group === "") return 1;
  const grp = a.group.localeCompare(b.group);
  if (grp !== 0) return grp;

  const typ = (typeOrder.get(a.type) ?? 999) - (typeOrder.get(b.type) ?? 999);
  if (typ !== 0) return typ;

  return a.name.localeCompare(b.name);
};

const channelToByte = (value) =>
  Math.max(0, Math.min(255, Math.round(Number(value) * 255)));

const rgbaToCss = ({ r, g, b, a = 1 }) => {
  const red = channelToByte(r);
  const green = channelToByte(g);
  const blue = channelToByte(b);
  const alpha = Number(a);

  if (Number.isNaN(alpha) || alpha >= 1) {
    const hex = [red, green, blue]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    return `#${hex}`;
  }

  return `rgba(${red} ${green} ${blue} / ${alpha.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")})`;
};

const toCssValue = (tokenValue) => {
  if (typeof tokenValue === "string") {
    const referenceMatch = tokenValue.match(/^\{(.+)\}$/);
    if (referenceMatch) {
      const referencedPath = referenceMatch[1]
        .split(".")
        .map((part) => part.trim())
        .filter(Boolean);
      return `var(--${tokenPathToVarName(referencedPath)})`;
    }

    return JSON.stringify(tokenValue);
  }

  if (typeof tokenValue === "number") {
    return String(tokenValue);
  }

  if (isObject(tokenValue) && typeof tokenValue.hex === "string") {
    return tokenValue.hex.toUpperCase();
  }

  if (
    isObject(tokenValue) &&
    typeof tokenValue.r === "number" &&
    typeof tokenValue.g === "number" &&
    typeof tokenValue.b === "number"
  ) {
    return rgbaToCss(tokenValue);
  }

  return JSON.stringify(tokenValue);
};

const flattenTokens = (node, currentPath = []) => {
  const tokens = [];

  if (!isObject(node)) {
    return tokens;
  }

  if (Object.prototype.hasOwnProperty.call(node, "$value")) {
    const varName = tokenPathToVarName(currentPath);
    if (varName) {
      tokens.push({
        name: varName,
        value: toCssValue(node.$value),
        rawPath: currentPath,
      });
    }
    return tokens;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) {
      continue;
    }
    tokens.push(...flattenTokens(value, [...currentPath, key]));
  }

  return tokens;
};

const dedupeTokens = (tokens) =>
  Array.from(new Map(tokens.map((token) => [token.name, token])).values());

const sortTokens = (tokens) => [...tokens].sort(compareTokens);

const inferTokenType = (value) => {
  if (typeof value === "string") {
    return "STRING";
  }
  if (typeof value === "number") {
    return "FLOAT";
  }
  if (typeof value === "boolean") {
    return "BOOLEAN";
  }
  if (
    isObject(value) &&
    typeof value.r === "number" &&
    typeof value.g === "number" &&
    typeof value.b === "number"
  ) {
    return "COLOR";
  }
  if (isObject(value) && typeof value.hex === "string") {
    return "COLOR";
  }
  return "UNKNOWN";
};

const getCollectionModeId = (modes, matcher) => {
  for (const [modeId, modeName] of Object.entries(modes)) {
    if (matcher.test(String(modeName))) {
      return modeId;
    }
  }
  return null;
};

const extractFromCollectionFormat = (json, fileName) => {
  if (!isObject(json) || !Array.isArray(json.variables) || !isObject(json.modes)) {
    return null;
  }
  const fallbackCollection = path.parse(fileName).name;
  const collectionLabel = String(json.name ?? fallbackCollection);
  const collection = normalizeCollectionName(collectionLabel);

  const modeEntries = Object.entries(json.modes);
  if (modeEntries.length === 0) {
    return { baseTokens: [], darkTokens: [] };
  }

  const baseModeId =
    getCollectionModeId(json.modes, /light/i) ?? modeEntries[0][0];
  const darkModeId = getCollectionModeId(json.modes, /dark/i);

  const idToVarName = new Map();
  for (const variable of json.variables) {
    if (!isObject(variable) || typeof variable.name !== "string") {
      continue;
    }
    const varName = tokenPathToVarName(variable.name.split("/"));
    if (!varName || typeof variable.id !== "string") {
      continue;
    }
    idToVarName.set(variable.id, varName);
  }

  const readModeValue = (rawValue) => {
    if (
      isObject(rawValue) &&
      rawValue.type === "VARIABLE_ALIAS" &&
      typeof rawValue.id === "string"
    ) {
      const aliasName = idToVarName.get(rawValue.id);
      if (aliasName) {
        return `var(--${aliasName})`;
      }
    }

    return toCssValue(rawValue);
  };

  const baseTokens = [];
  const darkTokens = [];

  for (const variable of json.variables) {
    if (
      !isObject(variable) ||
      typeof variable.name !== "string" ||
      !isObject(variable.valuesByMode)
    ) {
      continue;
    }

    const varName = tokenPathToVarName(variable.name.split("/"));
    if (!varName) {
      continue;
    }

    const nameParts = variable.name.split("/");
    // group is the raw subgroup label (e.g. "Buttons") used in comments and sort
    const group = nameParts.length > 1 ? nameParts[0].trim() : "";

    if (Object.prototype.hasOwnProperty.call(variable.valuesByMode, baseModeId)) {
      baseTokens.push({
        name: varName,
        value: readModeValue(variable.valuesByMode[baseModeId]),
        collection,
        collectionLabel,
        group,
        type: String(variable.type ?? inferTokenType(variable.valuesByMode[baseModeId])),
      });
    }

    if (
      darkModeId &&
      Object.prototype.hasOwnProperty.call(variable.valuesByMode, darkModeId)
    ) {
      darkTokens.push({
        name: varName,
        value: readModeValue(variable.valuesByMode[darkModeId]),
        collection,
        collectionLabel,
        group,
        type: String(variable.type ?? inferTokenType(variable.valuesByMode[darkModeId])),
      });
    }
  }

  return { baseTokens, darkTokens };
};

const extractFromLegacyFormat = (json, fileName) => {
  const fallbackCollection = path.parse(fileName).name;
  const collectionLabel = String(json?.name ?? fallbackCollection);
  const collection = normalizeCollectionName(collectionLabel);
  const flattened = flattenTokens(json).map((token) => ({
    ...token,
    collection,
    collectionLabel,
    group: token.rawPath.length > 1 ? token.rawPath[0] : "",
    type: inferTokenType(token.value),
  }));

  if (/dark-mode/i.test(fileName)) {
    return { baseTokens: [], darkTokens: flattened };
  }

  if (/light-mode/i.test(fileName)) {
    return { baseTokens: flattened, darkTokens: [] };
  }

  return { baseTokens: flattened, darkTokens: [] };
};

const loadTokensFromFiles = async (fileNames) => {
  const baseTokens = [];
  const darkTokens = [];

  for (const tokenFile of fileNames) {
    const tokenFilePath = path.join(tokensDir, tokenFile);
    const raw = await fs.readFile(tokenFilePath, "utf8");
    const json = JSON.parse(raw);
    const parsed =
      extractFromCollectionFormat(json, tokenFile) ??
      extractFromLegacyFormat(json, tokenFile);
    baseTokens.push(...parsed.baseTokens);
    darkTokens.push(...parsed.darkTokens);
  }

  return {
    baseTokens: sortTokens(dedupeTokens(baseTokens)),
    darkTokens: sortTokens(dedupeTokens(darkTokens)),
  };
};

const renderTokenLines = (tokens, indent) => {
  const lines = [];
  let lastCollection = null;
  let lastGroup = null;

  for (const token of tokens) {
    const collectionChanged = token.collectionLabel !== lastCollection;
    const groupChanged = collectionChanged || token.group !== lastGroup;

    if (groupChanged) {
      if (lines.length > 0) lines.push("");
      const label = token.group
        ? `${token.collectionLabel} / ${token.group}`
        : token.collectionLabel;
      lines.push(`${indent}/* ${label} */`);
      lastCollection = token.collectionLabel;
      lastGroup = token.group;
    }

    lines.push(`${indent}--${token.name}: ${token.value};`);
  }

  return lines;
};

const TYPOGRAPHY_PROPERTY_MAP = [
  { suffix: /-size$/, twPrefix: "text", calcPx: true, label: "Font Size" },
  { suffix: /-line-height$/, twPrefix: "leading", calcPx: true, label: "Line Height" },
  { suffix: /-letter-spacing$/, twPrefix: "tracking", calcPx: true, label: "Letter Spacing" },
  { suffix: /-weight$/, twPrefix: "font-weight", calcPx: false, label: "Font Weight" },
];

const renderColorThemeLines = (tokens) => {
  const colorTokens = tokens.filter((t) => t.type === "COLOR");
  const lines = [];
  let lastGroup = null;

  for (const token of colorTokens) {
    const group = token.group
      ? `${token.collectionLabel} / ${token.group}`
      : token.collectionLabel;

    if (group !== lastGroup) {
      if (lastGroup !== null) lines.push("");
      lines.push(`  /* ${group} */`);
      lastGroup = group;
    }

    lines.push(`  --color-${token.name}: var(--${token.name});`);
  }

  return { lines, count: colorTokens.length };
};

const renderTypographyThemeLines = (tokens) => {
  const typographyTokens = tokens.filter((t) => t.collection === "typography");
  if (typographyTokens.length === 0) return { lines: [], count: 0 };

  const lines = [];
  let count = 0;

  const fontFamilyTokens = typographyTokens.filter((t) =>
    t.name.startsWith("font-family-"),
  );
  if (fontFamilyTokens.length > 0) {
    lines.push("  /* Typography / Font Family */");
    for (const token of fontFamilyTokens) {
      const fontName = token.name.replace(/^font-family-/, "");
      lines.push(`  --font-${fontName}: var(--${token.name});`);
      count++;
    }
  }

  const scaledTokens = typographyTokens.filter(
    (t) => !t.name.startsWith("font-family-"),
  );

  for (const { suffix, twPrefix, calcPx, label } of TYPOGRAPHY_PROPERTY_MAP) {
    const matching = scaledTokens.filter((t) => suffix.test(t.name));
    if (matching.length === 0) continue;

    if (lines.length > 0) lines.push("");
    lines.push(`  /* Typography / ${label} */`);

    for (const token of matching) {
      const scaleName = token.name.replace(suffix, "");
      const value = calcPx
        ? `calc(var(--${token.name}) * 1px)`
        : `var(--${token.name})`;
      lines.push(`  --${twPrefix}-${scaleName}: ${value};`);
      count++;
    }
  }

  return { lines, count };
};

const renderTailwindThemeLines = (tokens) => {
  const { lines: colorLines, count: colorCount } = renderColorThemeLines(tokens);
  const { lines: typographyLines, count: typographyCount } =
    renderTypographyThemeLines(tokens);

  const lines = [...colorLines];
  if (typographyLines.length > 0) {
    if (lines.length > 0) lines.push("");
    lines.push(...typographyLines);
  }

  return { lines, count: colorCount + typographyCount };
};

const main = async () => {
  const entries = await fs.readdir(tokensDir, { withFileTypes: true });
  const tokenFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const { baseTokens, darkTokens } = await loadTokensFromFiles(tokenFiles);

  const cssLines = [
    "/* Auto-generated from tokens/*.json. Do not edit directly. */",
    ":root {",
    ...renderTokenLines(baseTokens, "  "),
    "}",
  ];

  if (darkTokens.length > 0) {
    cssLines.push(
      "",
      "@media (prefers-color-scheme: dark) {",
      "  :root {",
      ...renderTokenLines(darkTokens, "    "),
      "  }",
      "}",
    );
  }

  cssLines.push("");

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, cssLines.join("\n"), "utf8");

  console.log(
    `Generated ${baseTokens.length} base tokens and ${darkTokens.length} dark-mode overrides from ${tokenFiles.length} files: ${outputFile}`,
  );

  const { lines: themeLines, count: themeCount } = renderTailwindThemeLines(baseTokens);
  const tailwindThemeLines = [
    "/* Auto-generated from tokens/*.json. Do not edit directly. */",
    "@theme inline {",
    ...themeLines,
    "}",
    "",
  ];

  await fs.writeFile(tailwindThemeFile, tailwindThemeLines.join("\n"), "utf8");

  console.log(
    `Generated ${themeCount} Tailwind theme variables: ${tailwindThemeFile}`,
  );
};

main().catch((error) => {
  console.error("Failed to generate CSS tokens.");
  console.error(error);
  process.exit(1);
});
