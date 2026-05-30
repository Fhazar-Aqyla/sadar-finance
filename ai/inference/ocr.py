import os
from pathlib import Path
from typing import Optional

from PIL import Image, ImageEnhance, ImageFilter
import pytesseract


TESSERACT_CMD = os.getenv("TESSERACT_CMD")
WINDOWS_TESSERACT_CMD = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
elif WINDOWS_TESSERACT_CMD.exists():
    pytesseract.pytesseract.tesseract_cmd = str(WINDOWS_TESSERACT_CMD)


def preprocess_image(image_path: str) -> Image.Image:
    image = Image.open(image_path)
    image = image.convert("L")
    image = ImageEnhance.Contrast(image).enhance(1.8)
    image = image.filter(ImageFilter.SHARPEN)

    width, height = image.size
    target_width = int(os.getenv("OCR_TARGET_WIDTH", "600"))
    max_height = int(os.getenv("OCR_MAX_HEIGHT", "1800"))

    if width < target_width:
        scale = target_width / max(width, 1)
        image = image.resize((int(width * scale), int(height * scale)))

    if image.height > max_height:
        scale = max_height / max(image.height, 1)
        image = image.resize((max(1, int(image.width * scale)), max_height))

    return image


def extract_text_from_image(image_path: str, lang: Optional[str] = None) -> str:
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    image = preprocess_image(str(path))
    tesseract_lang = lang or "ind+eng"
    config = "--psm 6"
    timeout = int(os.getenv("OCR_TIMEOUT_SECONDS", "15"))
    try:
        return pytesseract.image_to_string(image, lang=tesseract_lang, config=config, timeout=timeout)
    except pytesseract.TesseractError:
        return pytesseract.image_to_string(image, lang="eng", config=config, timeout=timeout)
