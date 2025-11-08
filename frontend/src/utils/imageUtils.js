// src/utils/imageUtils.js
// Resize an image file to width x height (center-crop) and return a Blob
export function resizeImage(file, width = 300, height = 300) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      const iw = img.width;
      const ih = img.height;
      // scale to cover
      const ratio = Math.max(width / iw, height / ih);
      const sw = Math.round(width / ratio);
      const sh = Math.round(height / ratio);
      const sx = Math.round((iw - sw) / 2);
      const sy = Math.round((ih - sh) / 2);

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg", 0.85);
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

export default resizeImage;
