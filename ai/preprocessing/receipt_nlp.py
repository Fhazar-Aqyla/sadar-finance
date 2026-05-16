import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple


CATEGORY_KEYWORDS = {
    "food_and_beverage": [
        "ayam",
        "bakso",
        "burger",
        "coffee",
        "kopi",
        "makan",
        "mie",
        "minum",
        "nasi",
        "resto",
        "restaurant",
        "tea",
    ],
    "groceries": [
        "alfamart",
        "beras",
        "gula",
        "indomaret",
        "minyak",
        "roti",
        "sabun",
        "susu",
        "telur",
    ],
    "transportation": [
        "bbm",
        "bensin",
        "gojek",
        "grab",
        "parkir",
        "pertamina",
        "tol",
        "transport",
    ],
    "utilities": [
        "air",
        "internet",
        "listrik",
        "pdam",
        "pulsa",
        "token",
        "wifi",
    ],
    "shopping": [
        "baju",
        "fashion",
        "mall",
        "sepatu",
        "shopee",
        "tokopedia",
    ],
}

TOTAL_LABELS = [
    "grand total",
    "total belanja",
    "total bayar",
    "total",
    "jumlah",
    "amount",
]


def normalize_text(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


def parse_currency(value: str) -> Optional[int]:
    cleaned = re.sub(r"[^0-9,.]", "", value)
    if not cleaned:
        return None

    if "," in cleaned and "." in cleaned:
        cleaned = cleaned.replace(".", "").split(",")[0]
    elif "." in cleaned:
        parts = cleaned.split(".")
        cleaned = "".join(parts) if all(len(part) == 3 for part in parts[1:]) else parts[0]
    elif "," in cleaned:
        parts = cleaned.split(",")
        cleaned = "".join(parts) if all(len(part) == 3 for part in parts[1:]) else parts[0]

    try:
        return int(cleaned)
    except ValueError:
        return None


def extract_amounts(text: str) -> List[int]:
    candidates = re.findall(r"(?:Rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d{4,})", text, re.IGNORECASE)
    amounts = [parse_currency(candidate) for candidate in candidates]
    return [amount for amount in amounts if amount is not None and amount > 0]


def extract_total(lines: List[str], text: str) -> Optional[int]:
    for line in reversed(lines):
        lower_line = line.lower()
        if any(label in lower_line for label in TOTAL_LABELS):
            amounts = extract_amounts(line)
            if amounts:
                return max(amounts)

    amounts = extract_amounts(text)
    return max(amounts) if amounts else None


def extract_date(text: str) -> Optional[str]:
    patterns = [
        r"\b(\d{4}[-/]\d{1,2}[-/]\d{1,2})\b",
        r"\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b",
        r"\b(\d{1,2}\s+(?:jan|feb|mar|apr|mei|may|jun|jul|agu|aug|sep|okt|oct|nov|des|dec)[a-z]*\s+\d{2,4})\b",
    ]
    formats = [
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%d-%m-%y",
        "%d/%m/%y",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if not match:
            continue
        value = match.group(1)
        normalized = value.replace("/", "-")
        for fmt in formats:
            try:
                return datetime.strptime(normalized, fmt).date().isoformat()
            except ValueError:
                pass
        parsed_month_date = _parse_month_name_date(value)
        if parsed_month_date:
            return parsed_month_date

    return None


def _parse_month_name_date(value: str) -> Optional[str]:
    month_map = {
        "jan": 1,
        "feb": 2,
        "mar": 3,
        "apr": 4,
        "mei": 5,
        "may": 5,
        "jun": 6,
        "jul": 7,
        "agu": 8,
        "aug": 8,
        "sep": 9,
        "okt": 10,
        "oct": 10,
        "nov": 11,
        "des": 12,
        "dec": 12,
    }
    match = re.match(r"(\d{1,2})\s+([a-zA-Z]+)\s+(\d{2,4})", value.strip())
    if not match:
        return None

    day = int(match.group(1))
    month = month_map.get(match.group(2).lower()[:3])
    year = int(match.group(3))
    if year < 100:
        year += 2000
    if not month:
        return None

    try:
        return datetime(year, month, day).date().isoformat()
    except ValueError:
        return None


def extract_merchant(lines: List[str]) -> Optional[str]:
    joined = "\n".join(lines)
    merchant_patterns = [
        r"pembayaran\s+ke\s+(.+)",
        r"pay\s+to\s+(.+)",
        r"nama\s+merchant\s+(.+)",
    ]
    for pattern in merchant_patterns:
        match = re.search(pattern, joined, re.IGNORECASE)
        if match:
            merchant = re.sub(r"\s+", " ", match.group(1)).strip(" -:")
            if merchant:
                return merchant.title()

    ignored = ("struk", "receipt", "nota", "telp", "phone", "tanggal", "date", "kasir")
    for line in lines[:8]:
        clean = re.sub(r"[^A-Za-z0-9 &.'-]", "", line).strip()
        if len(clean) < 3:
            continue
        if any(keyword in clean.lower() for keyword in ignored):
            continue
        if not re.search(r"\d{4,}", clean):
            return clean.title()
    return None


def extract_items(lines: List[str], total: Optional[int]) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    blocked = (
        "subtotal",
        "total",
        "tunai",
        "cash",
        "kembali",
        "change",
        "pajak",
        "tax",
        "diskon",
        "id dana",
        "id grup",
        "id order",
        "id terminal",
        "id transaksi",
        "merchant location",
        "merchant pan",
        "nama merchant",
        "nama penerbit",
        "rrn",
        "qris",
    )

    for line in lines:
        lower_line = line.lower()
        if any(keyword in lower_line for keyword in blocked):
            continue
        if extract_date(line):
            continue

        amounts = extract_amounts(line)
        if not amounts:
            continue

        amount = amounts[-1]
        if total and amount == total:
            continue

        name = re.sub(r"(?:Rp\.?\s*)?\d{1,3}(?:[.,]\d{3})+|\d{4,}", "", line, flags=re.IGNORECASE)
        name = re.sub(r"[^A-Za-z0-9 &.'/-]", " ", name)
        name = re.sub(r"\s+", " ", name).strip(" -:")
        if len(name) < 2:
            continue

        items.append({"name": name.title(), "amount": amount})

    return items[:20]


def classify_category(text: str, merchant: Optional[str], items: List[Dict[str, Any]]) -> Tuple[str, float]:
    haystack = " ".join(
        [
            text.lower(),
            (merchant or "").lower(),
            " ".join(item["name"].lower() for item in items),
        ]
    )

    scores = {
        category: sum(1 for keyword in keywords if keyword in haystack)
        for category, keywords in CATEGORY_KEYWORDS.items()
    }
    category, score = max(scores.items(), key=lambda item: item[1])
    if score == 0:
        return "other", 0.55
    return category, min(0.7 + (score * 0.08), 0.95)


def estimate_confidence(raw_text: str, extracted: Dict[str, Any]) -> float:
    score = 0.35
    if raw_text and len(raw_text) >= 20:
        score += 0.2
    if extracted.get("merchant"):
        score += 0.1
    if extracted.get("date"):
        score += 0.1
    if extracted.get("total"):
        score += 0.15
    if extracted.get("items"):
        score += 0.1
    return round(min(score, 0.98), 4)


def parse_receipt_text(raw_text: str) -> Dict[str, Any]:
    normalized = normalize_text(raw_text)
    lines = [line.strip() for line in normalized.split("\n") if line.strip()]
    total = extract_total(lines, normalized)
    merchant = extract_merchant(lines)
    date = extract_date(normalized)
    items = extract_items(lines, total)
    category, category_confidence = classify_category(normalized, merchant, items)

    data = {
        "merchant": merchant,
        "date": date,
        "items": items,
        "total": total,
        "currency": "IDR" if total else None,
        "category": category,
        "categoryConfidence": category_confidence,
    }

    return {
        "rawText": normalized,
        "data": data,
        "confidence": estimate_confidence(normalized, data),
    }
