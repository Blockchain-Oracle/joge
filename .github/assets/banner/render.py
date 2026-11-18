"""Renders banner-{dark,light}.png and demo-cover.png from banner.html (uv run --with playwright python render.py)."""
import glob, os
from pathlib import Path
from playwright.sync_api import sync_playwright
here = Path(__file__).parent
with sync_playwright() as p:
    exe = sorted(glob.glob(os.path.expanduser("~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell")))
    b = p.chromium.launch(executable_path=exe[-1])
    page = b.new_page(viewport={"width": 2560, "height": 1280})
    for name, query in [("banner-dark", "theme=dark"), ("banner-light", "theme=light"), ("demo-cover", "theme=dark&kind=cover")]:
        page.goto(f"file://{here}/banner.html?{query}")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1500)
        page.screenshot(path=str(here.parent / f"{name}.png"))
        print(name)
    b.close()
