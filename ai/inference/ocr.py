import os
from pathlib import Path
from typing import Optional

from PIL import Image, ImageEnhance, ImageFilter
import pytesseract


TESSERACT_CMD = os.getenv("TESSERACT_CMD")
if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD


def preprocess_image(image_path: str) -> Image.Image:
    image = Image.open(image_path)
    image = image.convert("L")
    image = ImageEnhance.Contrast(image).enhance(1.8)
    image = image.filter(ImageFilter.SHARPEN)

    width, height = image.size
    if width < 1200:
        scale = 1200 / max(width, 1)
        image = image.resize((int(width * scale), int(height * scale)))

    return image


def extract_text_from_image(image_path: str, lang: Optional[str] = None) -> str:
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    image = preprocess_image(str(path))
    tesseract_lang = lang or "ind+eng"
    config = "--psm 6"
    try:
        return pytesseract.image_to_string(image, lang=tesseract_lang, config=config)
    except pytesseract.TesseractError:
        return pytesseract.image_to_string(image, lang="eng", config=config)
