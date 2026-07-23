export type GalleryItem = {
  name: string;
  type: string;
  src: string;
  featured?: boolean;
};

export const galleryItems: GalleryItem[] = [
  {
    name: "Mosaic",
    type: "Product launch",
    src: "https://storage.googleapis.com/motion-studio-assets/studio/mosaic-launch.mp4",
    featured: true,
  },
  {
    name: "Ornadyne",
    type: "Product launch",
    src: "https://storage.googleapis.com/motion-studio-assets/studio/Ornadyne-O1.mp4",
  },
  {
    name: "GitHits",
    type: "Feature announcement",
    src: "https://storage.googleapis.com/motion-studio-assets/studio/githits.mp4",
  },
  {
    name: "Perch",
    type: "App showcase",
    src: "https://storage.googleapis.com/motion-studio-assets/studio/perch-by-candlefish-1080p.mp4",
  },
];

export const galleryFeatured =
  galleryItems.find((item) => item.featured) ?? galleryItems[0];

export const galleryPreviewItems = galleryItems
  .filter((item) => !item.featured)
  .slice(0, 2);
