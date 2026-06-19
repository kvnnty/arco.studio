import { parseArcoProject, type ArcoProject } from "@arco/project-schema";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readArg(name: string): string {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (!match) {
    throw new Error(`Missing required argument: --${name}=...`);
  }
  return match.slice(prefix.length);
}

export async function renderProjectToFile(
  project: ArcoProject,
  outputLocation: string,
): Promise<void> {
  const entryPoint = path.join(__dirname, "index.tsx");

  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  const inputProps = { project: parseArcoProject(project) };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "ArcoComposition",
    inputProps,
  });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    inputProps,
  });
}

async function main() {
  const propsPath = readArg("props");
  const outputPath = readArg("output");

  const raw = JSON.parse(readFileSync(propsPath, "utf8")) as {
    project: ArcoProject;
  };
  const project = parseArcoProject(raw.project);

  await renderProjectToFile(project, outputPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
