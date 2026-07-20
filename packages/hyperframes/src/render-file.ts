import {
  parseArcoProject,
  type ArcoProject,
} from "@arco/project-schema";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stageProjectAssets } from "./assets.js";
import { compileArcoVideo } from "./compile.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const monorepoRoot = path.resolve(packageRoot, "../..");

function readArg(name: string, required = true): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (!match && required) {
    throw new Error(`Missing required argument: --${name}=...`);
  }
  return match?.slice(prefix.length);
}

function runHyperframes(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const cliEntry = path.join(
      packageRoot,
      "node_modules/hyperframes/bin/hyperframes.mjs",
    );
    const child = spawn(process.execPath, [cliEntry, ...args], {
      cwd: packageRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(
        new Error(
          stderr.trim() ||
            stdout.trim() ||
            `HyperFrames exited with code ${code ?? "unknown"}.`,
        ),
      );
    });
  });
}

export async function renderProjectToFile(
  project: ArcoProject,
  outputPath: string,
  publicRoot = path.join(monorepoRoot, "apps/web/public"),
): Promise<void> {
  const parsed = parseArcoProject(project);
  const outputDirectory = path.dirname(outputPath);
  const assetRoot = path.join(outputDirectory, "assets");
  await mkdir(outputDirectory, { recursive: true });
  const stagedProject = await stageProjectAssets(
    parsed,
    publicRoot,
    assetRoot,
  );
  const compiled = compileArcoVideo(stagedProject, {
    assetBaseUrl: "assets",
    mode: "export",
  });

  if (!compiled.quality.passed) {
    const errors = compiled.quality.findings
      .filter((finding) => finding.severity === "error")
      .map((finding) => finding.message)
      .join(" ");
    throw new Error(`Video quality gate failed. ${errors}`);
  }

  const compositionPath = path.join(
    path.dirname(outputPath),
    "index.html",
  );
  await writeFile(compositionPath, compiled.html, "utf8");

  await runHyperframes([
    "lint",
    path.dirname(compositionPath),
    "--json",
  ]);
  await runHyperframes([
    "render",
    path.dirname(compositionPath),
    "-o",
    outputPath,
    "--format",
    "mp4",
    "--quality",
    "high",
    "--crf",
    "16",
    "--workers",
    "1",
    "--low-memory-mode",
    "--strict-all",
    "--no-best-effort",
  ]);
}

async function main() {
  const propsPath = readArg("props");
  const outputPath = readArg("output");
  const publicRoot = readArg("public", false);

  if (!propsPath || !outputPath) {
    throw new Error("Props and output paths are required.");
  }

  const raw = JSON.parse(await readFile(propsPath, "utf8")) as {
    project: ArcoProject;
  };
  await renderProjectToFile(raw.project, outputPath, publicRoot);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
