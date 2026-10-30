import subprocess
import os
import time
import pymupdf
import sys

sys.stdout.reconfigure(encoding='utf-8')

html_path = os.path.abspath('CareSync_Mini_Project_Report.html')
pdf_path = os.path.abspath('CareSync_Mini_Project_Report.pdf')
edge_exe = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

file_url = 'file:///' + html_path.replace('\\', '/')

cmd = [
    edge_exe,
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    f'--print-to-pdf={pdf_path}',
    file_url
]

print('Exporting HTML to PDF using Edge...')
res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
print('Exit code:', res.returncode)
time.sleep(2)

if os.path.exists(pdf_path):
    print(f'PDF successfully generated: {pdf_path} ({os.path.getsize(pdf_path)} bytes)')
    doc = pymupdf.open(pdf_path)
    print(f'*** TOTAL PAGES: {len(doc)} ***')
    for i, page in enumerate(doc):
        text = page.get_text().strip()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        top = lines[0] if lines else 'BLANK'
        bottom = lines[-1] if lines else 'BLANK'
        print(f'Page {i+1:2d} ({len(lines):2d} lines): Top -> {top[:45]} | Bottom -> {bottom[:45]}')
else:
    print('Error: PDF file was not created.')

