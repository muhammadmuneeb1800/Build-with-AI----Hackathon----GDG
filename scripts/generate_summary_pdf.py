"""
Generate a simple PDF from `project_summary.md` using ReportLab.

This script is intentionally minimal: it reads the markdown file, strips Mermaid blocks,
wraps the text and writes it into a PDF. For higher-fidelity exports, use Pandoc or
WeasyPrint to convert Markdown to PDF with proper styling and diagram rendering.

Usage:
    pip install reportlab
    python scripts/generate_summary_pdf.py
"""
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

SOURCE = Path(__file__).resolve().parents[1] / "project_summary.md"
OUT = Path(__file__).resolve().parents[1] / "project_summary.pdf"

def _read_markdown(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    # remove mermaid blocks for simple text PDF
    import re
    text = re.sub(r"```mermaid[\s\S]*?```", "", text)
    return text


def generate_pdf(src: Path, out: Path):
    text = _read_markdown(src)
    width, height = A4
    c = canvas.Canvas(str(out), pagesize=A4)
    margin = 20 * mm
    y = height - margin
    line_height = 10
    max_width = width - margin * 2
    c.setFont("Helvetica", 11)

    for paragraph in text.split("\n\n"):
        # wrap paragraph
        words = paragraph.split()
        line = ""
        for w in words:
            test = f"{line} {w}".strip()
            if c.stringWidth(test, "Helvetica", 11) < max_width:
                line = test
            else:
                y -= line_height
                if y < margin:
                    c.showPage()
                    c.setFont("Helvetica", 11)
                    y = height - margin
                c.drawString(margin, y, line)
                line = w
        if line:
            y -= line_height
            if y < margin:
                c.showPage()
                c.setFont("Helvetica", 11)
                y = height - margin
            c.drawString(margin, y, line)
        # paragraph spacing
        y -= line_height
        if y < margin:
            c.showPage()
            c.setFont("Helvetica", 11)
            y = height - margin

    c.save()
    print(f"Wrote PDF: {out}")


if __name__ == "__main__":
    try:
        generate_pdf(SOURCE, OUT)
    except Exception as e:
        print("Failed to generate PDF:", e)
