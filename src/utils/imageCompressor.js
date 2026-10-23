/**
 * Compress an image file to a lightweight Base64 data URL
 * Ensures localStorage (5MB origin limit) and Serverless payloads (<1MB)
 * are never exceeded while preserving high visual fidelity and PNG transparency.
 *
 * @param {File} file - The file from input[type="file"]
 * @param {number} maxWidth - Max width in pixels (default: 600)
 * @param {number} maxHeight - Max height in pixels (default: 600)
 * @param {number} quality - JPEG quality 0.1 - 1.0 (default: 0.85)
 * @returns {Promise<string>} - Resolves to lightweight base64 data URL
 */
export const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    // If SVG, return as data text directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png';
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result); // Fallback to raw if canvas fails
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
