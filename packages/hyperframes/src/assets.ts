import {
  parseArcoProject,
  type ArcoProject,
} from "@arco/project-schema";
import {
  getMusicTrack,
} from "@arco/project-schema/music";
import { createHash } from "node:crypto";
import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SENTINEL_ASSETS = new Set(["pending", "placeholder"]);
const REMOTE_ASSET_PATTERN = /^(?:https?:|blob:|data:)/i;

function assertInside(root: string, target: string): void {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`Asset path escapes its allowed root: ${target}`);
  }
}

function normalizedPublicPath(src: string): string {
  const withoutQuery = src.split(/[?#]/, 1)[0] ?? src;
  const normalized = withoutQuery
    .replace(/^[/\\]+/, "")
    .replaceAll("\\", "/");
  const segments = normalized.split("/");

  if (
    !normalized ||
    segments.some((segment) => segment === ".." || segment === ".")
  ) {
    throw new Error(`Invalid local asset path: ${src}`);
  }

  return normalized;
}

async function ensureFile(filePath: string): Promise<void> {
  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat?.isFile()) {
    throw new Error(`Referenced video asset does not exist: ${filePath}`);
  }
}

async function stageOneAsset(
  src: string,
  publicRoot: string,
  assetRoot: string,
): Promise<string> {
  if (SENTINEL_ASSETS.has(src) || REMOTE_ASSET_PATTERN.test(src)) {
    return src;
  }

  let sourcePath: string;
  let stagedPath: string;

  if (src.startsWith("file:")) {
    sourcePath = fileURLToPath(src);
    const extension = path.extname(sourcePath);
    const digest = createHash("sha256")
      .update(path.resolve(sourcePath))
      .digest("hex")
      .slice(0, 16);
    stagedPath = `external/${digest}${extension}`;
  } else if (path.win32.isAbsolute(src)) {
    sourcePath = src;
    const extension = path.extname(sourcePath);
    const digest = createHash("sha256")
      .update(path.resolve(sourcePath))
      .digest("hex")
      .slice(0, 16);
    stagedPath = `external/${digest}${extension}`;
  } else {
    stagedPath = normalizedPublicPath(src);
    sourcePath = path.resolve(
      publicRoot,
      ...stagedPath.split("/"),
    );
    assertInside(publicRoot, sourcePath);
  }

  await ensureFile(sourcePath);
  const destinationPath = path.resolve(
    assetRoot,
    ...stagedPath.split("/"),
  );
  assertInside(assetRoot, destinationPath);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await copyFile(sourcePath, destinationPath);
  return stagedPath;
}

export async function stageProjectAssets(
  project: ArcoProject,
  publicRoot: string,
  assetRoot: string,
): Promise<ArcoProject> {
  const staged = structuredClone(parseArcoProject(project));
  await mkdir(assetRoot, { recursive: true });

  await stageOneAsset(
    "fonts/figtree-latin-wght-normal.woff2",
    publicRoot,
    assetRoot,
  );

  if (staged.brand?.logoSrc) {
    staged.brand.logoSrc = await stageOneAsset(
      staged.brand.logoSrc,
      publicRoot,
      assetRoot,
    );
  }

  if (!SENTINEL_ASSETS.has(staged.recording.src)) {
    staged.recording.src = await stageOneAsset(
      staged.recording.src,
      publicRoot,
      assetRoot,
    );
  }

  if (staged.audio?.customMusicSrc) {
    staged.audio.customMusicSrc = await stageOneAsset(
      staged.audio.customMusicSrc,
      publicRoot,
      assetRoot,
    );
  } else {
    const musicTrack = getMusicTrack(staged.audio?.musicId);
    if (musicTrack) {
      await stageOneAsset(musicTrack.file, publicRoot, assetRoot);
    }
  }

  if (staged.scenes) {
    for (const scene of staged.scenes) {
      scene.imageSrc = await stageOneAsset(
        scene.imageSrc,
        publicRoot,
        assetRoot,
      );
      if (scene.voAudioSrc) {
        scene.voAudioSrc = await stageOneAsset(
          scene.voAudioSrc,
          publicRoot,
          assetRoot,
        );
      }
    }
  }

  return parseArcoProject(staged);
}
