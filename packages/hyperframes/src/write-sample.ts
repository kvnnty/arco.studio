import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ArcoProject } from "@arco/project-schema";

import { stageProjectAssets } from "./assets.js";
import { compileArcoVideo } from "./compile.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const monorepoRoot = path.resolve(packageRoot, "../..");
const propsPath = path.join(packageRoot, "src/sample/golden-props.json");
const outputPath = path.join(packageRoot, "sample/index.html");

const raw = JSON.parse(await readFile(propsPath, "utf8")) as {
  project: ArcoProject;
};
const sampleRoot = path.dirname(outputPath);
await mkdir(sampleRoot, { recursive: true });
const stagedProject = await stageProjectAssets(
  raw.project,
  path.join(monorepoRoot, "apps/web/public"),
  path.join(sampleRoot, "assets"),
);
const compiled = compileArcoVideo(stagedProject, {
  assetBaseUrl: "assets",
  mode: "preview",
});

await writeFile(outputPath, compiled.html, "utf8");
console.log(`Wrote ${outputPath}`);
