"""QA: iPhone 17 Air (420x912 CSS px, dpr 3) + responzivny audit pretekania.

Spustenie: python3 scripts/qa/iphone-17-air.py [base_url]
"""

import asyncio
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
ROUTES = ["/", "/analyza-vypisov", "/vztahy", "/osoby", "/siet", "/viac", "/mcp-info"]

# iPhone 17 Air: 1260x2736 fyzickych px @3x => 420x912 logickych px
IPHONE_17_AIR = {
    "name": "iPhone 17 Air",
    "viewport": {"width": 420, "height": 912},
    "device_scale_factor": 3,
    "is_mobile": True,
    "has_touch": True,
    "user_agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 "
        "(KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1"
    ),
}

# iPhone 17 Air na sirku + dalsie kontrolne body
EXTRA = [
    ("iPhone 17 Air landscape", 912, 420),
    ("small phone", 360, 780),
    ("tablet", 834, 1112),
    ("desktop", 1280, 900),
    ("wide", 1600, 1000),
    ("ultrawide", 1920, 1080),
]

AUDIT_JS = """() => {
  const d = document.documentElement;
  const offenders = [];
  if (d.scrollWidth > d.clientWidth + 1) {
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > d.clientWidth + 1 || r.left < -1)) {
        offenders.push(el.tagName + '.' + String(el.className || '').slice(0, 120));
      }
    }
  }
  return { scrollWidth: d.scrollWidth, clientWidth: d.clientWidth, offenders: offenders.slice(0, 5) };
}"""


async def audit(page, label, route):
    await page.goto(BASE + route, wait_until="domcontentloaded")
    await page.wait_for_timeout(1200)
    res = await page.evaluate(AUDIT_JS)
    ok = res["scrollWidth"] <= res["clientWidth"] + 1
    print(f"{'PASS' if ok else 'FAIL'} {label:24} {route:18} sw={res['scrollWidth']} cw={res['clientWidth']}")
    for o in res["offenders"]:
        print("      offender:", o)
    return ok


async def main():
    failures = 0
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        ctx = await browser.new_context(
            viewport=IPHONE_17_AIR["viewport"],
            device_scale_factor=IPHONE_17_AIR["device_scale_factor"],
            is_mobile=IPHONE_17_AIR["is_mobile"],
            has_touch=IPHONE_17_AIR["has_touch"],
            user_agent=IPHONE_17_AIR["user_agent"],
        )
        page = await ctx.new_page()
        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        for route in ROUTES:
            if not await audit(page, IPHONE_17_AIR["name"], route):
                failures += 1
        # spodna navigacia musi byt viditelna a v ramci sirky
        await page.goto(BASE + "/", wait_until="domcontentloaded")
        await page.wait_for_timeout(800)
        nav = await page.evaluate(
            "() => { const n = document.querySelector('nav'); if (!n) return null;"
            " const r = n.getBoundingClientRect();"
            " return { w: Math.round(r.width), right: Math.round(r.right) }; }"
        )
        nav_ok = nav is not None and nav["right"] <= 421
        print(f"{'PASS' if nav_ok else 'FAIL'} {IPHONE_17_AIR['name']:24} bottom nav      {nav}")
        if not nav_ok:
            failures += 1
        if console_errors:
            print("FAIL console errors:", console_errors[:5])
            failures += 1
        await ctx.close()

        for label, w, h in EXTRA:
            ctx = await browser.new_context(viewport={"width": w, "height": h})
            page = await ctx.new_page()
            for route in ROUTES:
                if not await audit(page, label, route):
                    failures += 1
            await ctx.close()

        await browser.close()

    print("\nRESULT:", "ALL PASS" if failures == 0 else f"{failures} FAILURES")
    sys.exit(1 if failures else 0)


asyncio.run(main())
