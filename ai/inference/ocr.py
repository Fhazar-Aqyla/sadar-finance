import os
from pathlib import Path
from typing import Optional

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import pytesseract
from pytesseract import Output

try:
    import cv2
except ImportError:
    cv2 = None

TESSERACT_CMD = os.getenv("TESSERACT_CMD")
WINDOWS_TESSERACT_CMD = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
elif WINDOWS_TESSERACT_CMD.exists():
    pytesseract.pytesseract.tesseract_cmd = str(WINDOWS_TESSERACT_CMD)


def _order_points(points):
    rectangle = np.zeros((4, 2), dtype="float32")
    sums = points.sum(axis=1)
    differences = np.diff(points, axis=1).reshape(-1)
    rectangle[0], rectangle[2] = points[np.argmin(sums)], points[np.argmax(sums)]
    rectangle[1], rectangle[3] = points[np.argmin(differences)], points[np.argmax(differences)]
    return rectangle


def _crop_and_warp_receipt(rgb):
    if cv2 is None:
        return rgb
    height, width = rgb.shape[:2]
    scale = 900 / max(height, width) if max(height, width) > 900 else 1
    preview = cv2.resize(rgb, None, fx=scale, fy=scale) if scale != 1 else rgb.copy()
    gray = cv2.cvtColor(preview, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(cv2.GaussianBlur(gray, (5, 5), 0), 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    image_area = preview.shape[0] * preview.shape[1]
    for contour in sorted(contours, key=cv2.contourArea, reverse=True)[:12]:
        polygon = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
        if len(polygon) != 4 or cv2.contourArea(polygon) < image_area * 0.2:
            continue
        tl, tr, br, bl = _order_points(polygon.reshape(4, 2).astype("float32") / scale)
        out_width = int(max(np.linalg.norm(br - bl), np.linalg.norm(tr - tl)))
        out_height = int(max(np.linalg.norm(tr - br), np.linalg.norm(tl - bl)))
        if out_width < 100 or out_height < 100:
            continue
        target = np.array([[0, 0], [out_width - 1, 0], [out_width - 1, out_height - 1], [0, out_height - 1]], dtype="float32")
        return cv2.warpPerspective(rgb, cv2.getPerspectiveTransform(np.array([tl, tr, br, bl]), target), (out_width, out_height))
    return rgb


def preprocess_variants(image_path: str):
    image = ImageOps.exif_transpose(Image.open(image_path)).convert("RGB")
    image = Image.fromarray(_crop_and_warp_receipt(np.asarray(image)))
    target_width = int(os.getenv("OCR_TARGET_WIDTH", "1200"))
    max_height = int(os.getenv("OCR_MAX_HEIGHT", "3200"))
    if image.width < target_width:
        ratio = target_width / max(image.width, 1)
        image = image.resize((target_width, int(image.height * ratio)))
    if image.height > max_height:
        ratio = max_height / image.height
        image = image.resize((max(1, int(image.width * ratio)), max_height))
    gray_pil = ImageEnhance.Contrast(image.convert("L")).enhance(1.8).filter(ImageFilter.SHARPEN)
    variants = [("contrast", gray_pil)]
    if cv2 is not None:
        gray = np.asarray(gray_pil)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
        adaptive = cv2.adaptiveThreshold(clahe, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 35, 11)
        otsu = cv2.threshold(clahe, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        variants.extend([("adaptive", Image.fromarray(adaptive)), ("otsu", Image.fromarray(otsu))])
    return variants


def preprocess_image(image_path: str) -> Image.Image:
    return preprocess_variants(image_path)[0][1]


def _run_variant(image, language, psm, timeout):
    data = pytesseract.image_to_data(image, lang=language, config=f"--oem 3 --psm {psm}", timeout=timeout, output_type=Output.DICT)
    confidences, grouped = [], {}
    for index, text in enumerate(data.get("text", [])):
        text = str(text).strip()
        try:
            confidence = float(data["conf"][index])
        except (ValueError, TypeError):
            confidence = -1
        if not text:
            continue
        if confidence >= 0:
            confidences.append(confidence)
        key = (data.get("block_num", [0])[index], data.get("par_num", [0])[index], data.get("line_num", [0])[index])
        grouped.setdefault(key, {"words": [], "confidence": []})
        grouped[key]["words"].append(text)
        if confidence >= 0:
            grouped[key]["confidence"].append(confidence)
    lines = [{"text": " ".join(value["words"]), "confidence": round(sum(value["confidence"]) / len(value["confidence"]), 2) if value["confidence"] else None} for value in grouped.values()]
    raw_text = "\n".join(line["text"] for line in lines)
    confidence = sum(confidences) / len(confidences) if confidences else 0
    return {"rawText": raw_text, "ocrConfidence": round(confidence / 100, 4), "lines": lines, "score": confidence + min(len(raw_text) / 30, 20)}


def extract_ocr_result(image_path: str, lang: Optional[str] = None):
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")
    language = lang or "ind+eng"
    timeout = int(os.getenv("OCR_TIMEOUT_SECONDS", "20"))
    results = []
    for variant_name, image in preprocess_variants(str(path)):
        for psm in (6, 4):
            try:
                result = _run_variant(image, language, psm, timeout)
            except pytesseract.TesseractError:
                result = _run_variant(image, "eng", psm, timeout)
            result.update({"variant": variant_name, "psm": psm})
            results.append(result)
    best = max(results, key=lambda result: result["score"])
    best.pop("score", None)
    best.update({"ocrSource": "tesseract", "modelVersion": "tesseract-multivariant-v2"})
    return best


def extract_text_from_image(image_path: str, lang: Optional[str] = None) -> str:
    return extract_ocr_result(image_path, lang)["rawText"]
