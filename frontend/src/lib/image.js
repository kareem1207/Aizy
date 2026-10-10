const TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const MAX_BYTES = 5 * 1024 * 1024;
const MAX_SIDE = 1200;

/** Validates an image file and returns a (downscaled) data URL. Rejects with Error(message). */
export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file selected"));
    if (!TYPES.includes(file.type)) return reject(new Error("Please upload a JPEG, PNG, GIF or WEBP image"));
    if (file.size > MAX_BYTES) return reject(new Error("Please upload an image smaller than 5MB"));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.onload = () => {
      const src = reader.result;
      if (file.type === "image/gif") return resolve({ dataUrl: src, type: file.type });
      const img = new Image();
      img.onerror = () => reject(new Error("That file is not a valid image"));
      img.onload = () => {
        const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        if (scale === 1) return resolve({ dataUrl: src, type: file.type });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const type = file.type === "image/png" ? "image/png" : "image/jpeg";
        resolve({ dataUrl: canvas.toDataURL(type, 0.85), type });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
