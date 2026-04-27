from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone


PRIORITY_KEYWORDS = {
    "high": ("urgent", "asap", "immediately", "today", "now", "important", "critical"),
    "low": ("whenever", "someday", "later", "low priority", "not urgent"),
}


def clean_task(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text).strip()
    cleaned = re.sub(r"^(please\s+|kindly\s+)", "", cleaned, flags=re.IGNORECASE)
    return cleaned[:180]


def infer_priority(text: str) -> str:
    lowered = text.lower()
    for priority, keywords in PRIORITY_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return priority
    if any(keyword in lowered for keyword in ("tomorrow", "deadline", "follow up", "follow-up")):
        return "high"
    return "medium"


def infer_deadline(text: str) -> datetime | None:
    lowered = text.lower()
    now = datetime.now(timezone.utc)
    if "tomorrow" in lowered:
        return now + timedelta(days=1)
    if "today" in lowered:
        return now
    if match := re.search(r"in\s+(\d+)\s+days?", lowered):
        return now + timedelta(days=int(match.group(1)))
    return None


def build_task(text: str) -> str:
    task = clean_task(text)
    task = re.sub(r"\b(today|tomorrow|tonight|asap|immediately|by\s+.+)$", "", task, flags=re.IGNORECASE)
    return clean_task(task or text)


def extract_structured_commitment(text: str) -> dict[str, object]:
    deadline = infer_deadline(text)
    priority = infer_priority(text)
    task = build_task(text)

    return {
        "content": text.strip(),
        "task": task,
        "deadline": deadline,
        "priority": priority,
        "status": "pending",
    }


def build_risk_sentence(task: str, reason: str) -> str:
    return f"{task}: {reason}"