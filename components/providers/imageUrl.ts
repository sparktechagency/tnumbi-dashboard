import { imageUrl } from "@/lib/baseApi";

export const getImageUrl = (path?: string): string => {
  if (!path) {
    return "/assets/image4.png"; // default image
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  
  return `${imageUrl}/${path}`;
};
