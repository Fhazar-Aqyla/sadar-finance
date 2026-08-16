export const OCR_IMAGE_TARGET_BYTES = 850 * 1024;
const OCR_IMAGE_MAX_DIMENSION = 2400;

export const scaleReceiptDimensions = (width, height, maxDimension = OCR_IMAGE_MAX_DIMENSION) => {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

const canvasToBlob = (canvas, quality) => new Promise((resolve, reject) => {
  canvas.toBlob(
    (blob) => (blob ? resolve(blob) : reject(new Error("Gambar gagal dikompresi."))),
    "image/jpeg",
    quality,
  );
});

const loadImage = async (file) => {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      release: () => bitmap.close(),
    };
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Format gambar tidak dapat dibaca browser."));
      element.src = url;
    });
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
};

export const compressReceiptImage = async (file, targetBytes = OCR_IMAGE_TARGET_BYTES) => {
  if (!file || !file.type?.startsWith("image/") || file.size <= targetBytes) return file;

  let decoded;
  try {
    decoded = await loadImage(file);
    let dimensions = scaleReceiptDimensions(decoded.width, decoded.height);
    let quality = 0.9;
    let bestBlob = null;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas browser tidak tersedia.");

      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);

      const blob = await canvasToBlob(canvas, quality);
      if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
      if (blob.size <= targetBytes) break;

      const shrink = Math.max(0.65, Math.min(0.9, Math.sqrt(targetBytes / blob.size) * 0.95));
      dimensions = {
        width: Math.max(1, Math.round(dimensions.width * shrink)),
        height: Math.max(1, Math.round(dimensions.height * shrink)),
      };
      quality = Math.max(0.68, quality - 0.05);
    }

    if (!bestBlob || bestBlob.size >= file.size) return file;

    const baseName = file.name?.replace(/\.[^.]+$/, "") || "struk";
    return new File([bestBlob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified || Date.now(),
    });
  } catch {
    // HEIC dan format tertentu belum dapat didekode di semua browser; backend tetap menanganinya.
    return file;
  } finally {
    decoded?.release();
  }
};

export const compressOcrFormData = async (formData) => {
  const original = formData.get("image");
  const compressed = await compressReceiptImage(original);
  if (compressed && compressed !== original) {
    formData.set("image", compressed, compressed.name);
  }
  return formData;
};
