import fitz
from pathlib import Path

source = Path("attached_assets/UPALA_PHARMACY_1787309247482.pdf")
output = Path(".agents/outputs/upala-pharmacy-pages")
output.mkdir(parents=True, exist_ok=True)

document = fitz.open(source)
print(f"Pages: {document.page_count}")
for page_number, page in enumerate(document):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    page_path = output / f"page-{page_number + 1}.png"
    pixmap.save(page_path)
    print(page_path)

print(document.get_toc())