from __future__ import annotations
from datetime import datetime, timezone

import json
import os
from datetime import datetime, timezone
from typing import Any


try:
    from google import genai as google_genai
except ImportError:  # pragma: no cover - optional runtime dependency
    google_genai = None

from app.config.settings import get_settings
from app.services.decision_engine import build_risk_sentence, extract_structured_commitment

settings = get_settings()


def _safe_json(text: str) -> dict[str, Any] | None:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            return None
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            return None


def _call_gemini(prompt: str) -> dict[str, Any] | None:
    api_key = os.getenv("GEMINI_API_KEY", settings.gemini_api_key)
    if not api_key:
        return None

    if google_genai is None:
        return None

    client = google_genai.Client(api_key=api_key)
    response = client.models.generate_content(model=settings.gemini_model, contents=prompt)
    response_text = getattr(response, "text", None)
    if not response_text:
        return None
    return _safe_json(response_text)


def extract_commitment(text: str) -> dict[str, Any]:
    prompt = (
        "You are a startup operations AI. Extract task, deadline, and priority from the text. "
        "Return JSON only with keys: task, deadline, priority. Text: "
        f"{text}"
    )
    gemini_payload = _call_gemini(prompt)
    if gemini_payload:
        structured = extract_structured_commitment(text)
        structured["task"] = str(gemini_payload.get("task") or structured["task"])
        structured["priority"] = str(gemini_payload.get("priority") or structured["priority"])
        deadline_value = gemini_payload.get("deadline")
        if isinstance(deadline_value, str) and deadline_value:
            try:
                structured["deadline"] = datetime.fromisoformat(deadline_value.replace("Z", "+00:00"))
            except ValueError:
                pass
        return structured
    return extract_structured_commitment(text)


def analyze_risk(commitments: list[dict[str, Any]]) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    overdue: list[dict[str, Any]] = []
    high_priority_pending: list[dict[str, Any]] = []

    for commitment in commitments:
        deadline = commitment.get("deadline")
        if isinstance(deadline, str) and deadline:
            try:
                deadline = datetime.fromisoformat(deadline.replace("Z", "+00:00"))
            except ValueError:
                deadline = None
        if deadline and deadline.tzinfo is None:
             deadline = deadline.replace(tzinfo=timezone.utc)
        status = str(commitment.get("status") or "pending")
        priority = str(commitment.get("priority") or "medium")
        task = str(commitment.get("task") or commitment.get("content") or "Untitled commitment")
        action_text = f"Follow up on {task.lower()}"

        if status != "done" and deadline and deadline < now:
            overdue.append(
                {
                    "commitment_id": str(commitment.get("id") or ""),
                    "task": task,
                    "reason": "deadline passed",
                    "priority": priority,
                    "deadline": deadline,
                    "action_text": build_risk_sentence(task, "deadline passed"),
                }
            )

        if status == "pending" and priority == "high":
            high_priority_pending.append(
                {
                    "commitment_id": str(commitment.get("id") or ""),
                    "task": task,
                    "reason": "high priority pending",
                    "priority": priority,
                    "deadline": deadline,
                    "action_text": action_text,
                }
            )

    return {
        "overdue": overdue,
        "high_priority_pending": high_priority_pending,
        "generated_at": now,
    }


def generate_daily_brief(commitments: list[dict[str, Any]]) -> dict[str, Any]:
    analysis = analyze_risk(commitments)
    pending = [item for item in commitments if str(item.get("status") or "pending") == "pending"]
    sorted_pending = sorted(
        pending,
        key=lambda item: (
            0 if str(item.get("priority") or "medium") == "high" else 1 if str(item.get("priority") or "medium") == "medium" else 2,
            item.get("deadline") or datetime.max.replace(tzinfo=timezone.utc),
        ),
    )

    top_priorities = [
        str(item.get("task") or item.get("content") or "Untitled commitment")
        for item in sorted_pending[:3]
    ]
    if not top_priorities:
        top_priorities = ["No active commitments. Add a new input to generate priorities."]

    risks = [f"{item['task']} - {item['reason']}" for item in analysis["overdue"]]
    risks.extend(f"{item['task']} - {item['reason']}" for item in analysis["high_priority_pending"])
    if not risks:
        risks = ["No immediate risks detected."]

    suggested_actions = []
    for item in sorted_pending[:3]:
        suggested_actions.append(f"Advance {str(item.get('task') or 'this commitment').lower()} today.")
    if not suggested_actions:
        suggested_actions = ["Keep monitoring the backlog and add new commitments as they arrive."]

    return {
        "top_priorities": top_priorities,
        "risks": risks,
        "suggested_actions": suggested_actions,
        "generated_at": analysis["generated_at"],
    }