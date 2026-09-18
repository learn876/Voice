import json
import time
import sys
import os
import math
from multiprocessing import Pool
from playwright.sync_api import sync_playwright
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env.local")

AGENT_URL = "https://omnidim.io/agent/252539"
SCENARIOS_FILE = "test_scenarios.json"
NUM_WORKERS = 2

def worker_run(args):
    worker_id, scenarios_chunk, completed_scenarios = args
    print(f"[{worker_id}] 🚀 Worker {worker_id} starting with {len(scenarios_chunk)} scenarios...")
    
    # Stagger logins to avoid collision
    time.sleep(worker_id * 5)
    
    with sync_playwright() as p:
        # Launch browser in visible mode
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        print(f"[{worker_id}] 🌐 Navigating to {AGENT_URL}...")
        page.goto(AGENT_URL, timeout=120000)
        time.sleep(8)

        # Check for auto-login
        if "login" in page.url or page.locator("input[type='email']").first.is_visible():
            print(f"[{worker_id}] 🔑 Login page detected. Attempting auto-login...")
            email = os.getenv("OMNIDIM_EMAIL")
            password = os.getenv("OMNIDIM_PASS")
            
            if not email or not password:
                print(f"[{worker_id}] ❌ Missing credentials in .env.local")
                return
                
            page.locator("input[type='email']").first.fill(email)
            page.locator("input[type='password']").first.fill(password)
            
            try:
                login_btn = page.locator("button[type='submit'], button:has-text('Log in'), button:has-text('Sign in')").first
                login_btn.click(timeout=5000)
            except:
                page.locator("input[type='password']").first.press("Enter")
            
            try:
                page.wait_for_url(lambda url: "login" not in url, timeout=15000)
                print(f"[{worker_id}] ✅ Logged in successfully!")
            except Exception as e:
                print(f"[{worker_id}] ⚠️ Auto-login might have failed: {e}")
                
            page.goto(AGENT_URL, timeout=120000)
            time.sleep(10)

        for i, scenario in enumerate(scenarios_chunk, 1):
            if scenario['name'] in completed_scenarios:
                print(f"[{worker_id}] ⏭️ Skipping Scenario {i}/{len(scenarios_chunk)}: {scenario['name']} (Already completed)")
                continue

            print(f"[{worker_id}] ▶️ Running Scenario {i}/{len(scenarios_chunk)}: {scenario['name']}")
            
            try:
                chat_button = page.get_by_role("button", name="Chat")
                if chat_button.first.is_visible():
                    chat_button.first.click()
            except Exception as e:
                print(f"[{worker_id}] ⚠️ Exception clicking Chat: {e}")

            time.sleep(2)

            messages = scenario.get("messages", [])
            for msg_idx, msg in enumerate(messages):
                print(f"[{worker_id}] 💬 [Msg {msg_idx+1}/{len(messages)}] Typing: '{msg}'")
                try:
                    chat_input = page.get_by_role("textbox", name=". .")
                    chat_input.fill(msg)
                    
                    try:
                        send_btn = page.locator(".inline-flex.items-center.justify-center.gap-2.whitespace-nowrap.rounded-md.text-sm.font-medium.transition-colors.focus-visible\\:outline-none.focus-visible\\:ring-1.focus-visible\\:ring-ring.disabled\\:pointer-events-none.disabled\\:opacity-50.\\[\\&_svg\\]\\:pointer-events-none.\\[\\&_svg\\]\\:size-4.\\[\\&_svg\\]\\:shrink-0.shadow").first
                        send_btn.click(timeout=3000)
                    except:
                        chat_input.press("Enter")
                except Exception as e:
                    print(f"[{worker_id}] ❌ Could not find chat input: {e}")
                
                # 30s inter-message wait (fixed)
                time.sleep(30)
            
            try:
                end_test_btn = page.get_by_role("button", name="End Test").first
                end_test_btn.click(timeout=5000)
            except Exception:
                page.reload(timeout=120000)
            
            time.sleep(10)
            
            try:
                with open("e2e_progress.txt", "a", encoding="utf-8") as pf:
                    pf.write(scenario['name'] + "\n")
            except Exception as e:
                print(f"[{worker_id}] ⚠️ Failed to save progress for {scenario['name']}: {e}")
            
        browser.close()
        print(f"[{worker_id}] 🎉 Worker finished its scenarios!")

import subprocess

def run_tests():
    print("🚀 Starting Parallel OmniDimension E2E Tester...")
    
    try:
        with open(SCENARIOS_FILE, "r", encoding="utf-8") as f:
            scenarios = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load scenarios: {e}")
        sys.exit(1)

    print(f"✅ Loaded {len(scenarios)} scenarios.")
    
    completed_scenarios = set()
    if os.path.exists("e2e_progress.txt"):
        try:
            with open("e2e_progress.txt", "r", encoding="utf-8") as f:
                for line in f:
                    completed_scenarios.add(line.strip())
            print(f"🔄 Resuming... Found {len(completed_scenarios)} completed scenarios to skip.")
        except Exception as e:
            print(f"⚠️ Could not read progress file: {e}")

    # Split into chunks
    chunk_size = math.ceil(len(scenarios) / NUM_WORKERS)
    chunks = [scenarios[i:i + chunk_size] for i in range(0, len(scenarios), chunk_size)]
    
    args = [(i, chunk, completed_scenarios) for i, chunk in enumerate(chunks)]
    
    print(f"🚀 Launching {NUM_WORKERS} parallel Playwright workers...")
    
    with Pool(NUM_WORKERS) as pool:
        pool.map(worker_run, args)

    print("\n🎉 All scenarios executed successfully across all workers!")
    print("⏳ Waiting 90 seconds for final webhook processing before generating report...")
    time.sleep(90)
    
    print("📊 Generating automated CSV report...")
    subprocess.run(["python", "e2e_reporter.py"], cwd=os.path.dirname(__file__))

if __name__ == "__main__":
    run_tests()
