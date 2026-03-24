import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const tokensDir = path.join(projectRoot, "tokens");
const outputFile = path.join(projectRoot, "src/styles/tokens.css");

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

const main = async () => {
  const entries = await fs.readdir(tokensDir, { withFileTypes: true });
  const tokenFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const allTokens = [];

  for (const tokenFile of tokenFiles) {
    const tokenFilePath = path.join(tokensDir, tokenFile);
    const raw = await fs.readFile(tokenFilePath, "utf8");
    const json = JSON.parse(raw);
    allTokens.push(...flattenTokens(json));
  }

  const uniqueTokens = Array.from(
    new Map(allTokens.map((token) => [token.name, token])).values(),
  );

  const cssLines = [
    "/* Auto-generated from tokens/*.json. Do not edit directly. */",
    ":root {",
    ...uniqueTokens.map((token) => `  --${token.name}: ${token.value};`),
    "}",
    "",
  ];

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, cssLines.join("\n"), "utf8");

  console.log(
    `Generated ${uniqueTokens.length} tokens from ${tokenFiles.length} files: ${outputFile}`,
  );
};

main().catch((error) => {
  console.error("Failed to generate CSS tokens.");
  console.error(error);
  process.exit(1);
});
