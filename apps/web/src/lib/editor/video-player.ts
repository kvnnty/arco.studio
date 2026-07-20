export type VideoPlayerHandle = {
  getCurrentFrame: () => number;
  seekTo: (frame: number) => void;
};
