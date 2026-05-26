from pathlib import Path

from pypdf import PdfReader
from docx import Document as DocxDocument


def load_text_from_file(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        reader = PdfReader(str(path))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n\n".join(pages).strip()
    if suffix in (".docx", ".doc"):
        doc = DocxDocument(str(path))
        return "\n".join(p.text for p in doc.paragraphs if p.text).strip()
    if suffix in (".txt", ".md", ".markdown"):
        return path.read_text(encoding="utf-8", errors="ignore").strip()
    raise ValueError(f"Formato no soportado: {suffix}")
