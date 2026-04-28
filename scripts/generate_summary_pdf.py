"""
Generate a presentation-ready PDF summary for the project.

The output contains:
- an executive summary page
- a rendered architecture diagram drawn with ReportLab primitives
- key technology and operational notes

Usage:
    pip install reportlab
    python scripts/generate_summary_pdf.py
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer


SOURCE = Path(__file__).resolve().parents[1] / "project_summary.md"
OUT = Path(__file__).resolve().parents[1] / "project_summary.pdf"


def build_summary_sections() -> list[str]:
    text = SOURCE.read_text(encoding="utf-8")
    sections: list[str] = []
    for chunk in text.split("## "):
        chunk = chunk.strip()
        if not chunk or chunk.startswith("<!--"):
            continue
        if chunk.startswith("One-line summary"):
            continue
        if chunk.startswith("Flow (high-level)"):
            continue
        if chunk.startswith("Diagrams"):
            continue
        sections.append(chunk)
    return sections


def draw_architecture_diagram(canvas, width: float, height: float) -> None:
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#1f2937"))
    canvas.setFillColor(colors.HexColor("#f9fafb"))
    canvas.setLineWidth(1.5)

    boxes = [
        (30 * mm, 210 * mm, 40 * mm, 16 * mm, "Input\nWhatsApp / Email"),
        (82 * mm, 210 * mm, 40 * mm, 16 * mm, "Backend Ingest"),
        (134 * mm, 210 * mm, 40 * mm, 16 * mm, "AI Extraction"),
        (186 * mm, 210 * mm, 40 * mm, 16 * mm, "Commitment DB"),
        (134 * mm, 168 * mm, 44 * mm, 16 * mm, "Task Sync\nNotion / ClickUp"),
        (186 * mm, 168 * mm, 40 * mm, 16 * mm, "Calendar"),
        (238 * mm, 188 * mm, 44 * mm, 16 * mm, "Notifications\nFrontend UI"),
    ]

    for x, y, w, h, label in boxes:
        canvas.roundRect(x, y, w, h, 4 * mm, stroke=1, fill=1)
        canvas.setFillColor(colors.HexColor("#111827"))
        canvas.setFont("Helvetica-Bold", 9)
        text_y = y + h / 2 + 2
        for line in label.split("\n"):
            canvas.drawCentredString(x + w / 2, text_y, line)
            text_y -= 9
        canvas.setFillColor(colors.HexColor("#f9fafb"))

    def arrow(x1, y1, x2, y2):
        canvas.line(x1, y1, x2, y2)
        canvas.line(x2, y2, x2 - 2 * mm, y2 + 1.2 * mm)
        canvas.line(x2, y2, x2 - 2 * mm, y2 - 1.2 * mm)

    arrow(70 * mm, 218 * mm, 82 * mm, 218 * mm)
    arrow(122 * mm, 218 * mm, 134 * mm, 218 * mm)
    arrow(174 * mm, 218 * mm, 186 * mm, 218 * mm)
    arrow(156 * mm, 210 * mm, 156 * mm, 184 * mm)
    arrow(200 * mm, 184 * mm, 200 * mm, 184 * mm)
    arrow(178 * mm, 176 * mm, 238 * mm, 196 * mm)

    canvas.setFont("Helvetica-Bold", 16)
    canvas.setFillColor(colors.HexColor("#0f172a"))
    canvas.drawString(24 * mm, 255 * mm, "System Architecture")
    canvas.setFont("Helvetica", 10)
    canvas.setFillColor(colors.HexColor("#334155"))
    canvas.drawString(24 * mm, 247 * mm, "Multi-channel commitment capture and task orchestration flow")
    canvas.restoreState()


def generate_pdf(src: Path, out: Path) -> None:
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="SummaryTitle", parent=styles["Title"], fontName="Helvetica-Bold", textColor=colors.HexColor("#0f172a"), fontSize=24, leading=28, spaceAfter=10))
    styles.add(ParagraphStyle(name="SectionHeading", parent=styles["Heading2"], fontName="Helvetica-Bold", textColor=colors.HexColor("#111827"), spaceBefore=10, spaceAfter=6))
    styles.add(ParagraphStyle(name="BodyCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=10.5, leading=14, textColor=colors.HexColor("#334155")))

    doc = SimpleDocTemplate(
        str(out),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="Build With AI Project Summary",
        author="GitHub Copilot",
    )

    story = []
    story.append(Paragraph("Build With AI", styles["SummaryTitle"]))
    story.append(Paragraph("Project Summary", styles["SectionHeading"]))
    story.append(Paragraph("A multi-channel AI orchestrator that captures commitments from communication channels, extracts structured tasks, syncs them to productivity platforms, schedules calendar events, and surfaces status to the frontend.", styles["BodyCustom"]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Key Capabilities", styles["SectionHeading"]))
    story.append(Paragraph("• Multi-channel ingestion via WhatsApp and Email providers.<br/>• AI extraction service for task, priority, and deadline parsing.<br/>• Sync adapters for Notion, ClickUp, and Google Calendar.<br/>• React frontend with notifications and dashboards.<br/>• Structured logging and test coverage for reliability.", styles["BodyCustom"]))
    story.append(PageBreak())

    # Draw architecture diagram on its own page.
    story.append(Paragraph("Architecture Diagram", styles["SectionHeading"]))
    story.append(Spacer(1, 4))
    story.append(Paragraph("The diagram below shows the main control flow from message intake through backend processing and platform synchronization.", styles["BodyCustom"]))

    def on_page(canvas, doc):
        draw_architecture_diagram(canvas, A4[0], A4[1])

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)


if __name__ == "__main__":
    try:
        generate_pdf(SOURCE, OUT)
        print(f"Wrote PDF: {OUT}")
    except Exception as e:
        print(f"Failed to generate PDF: {e}")
