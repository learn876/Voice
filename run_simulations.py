"""
OmniDimension Simulation Runner for DynamicDetailing Studio
Uses the Python SDK (omnidimension) to create & run test simulations.
Falls back to raw REST API if SDK doesn't work.
"""
import sys
import time
import json

# ─── Configuration ───────────────────────────────────────────────
API_KEY = "ddIzYX2K7DZU0EBTLd36dMYu33BBB2oKP29CI4qw4to"
AGENT_ID = 252539
BASE_URL = "https://backend.omnidim.io/api/v1"

# ─── Test Scenarios ──────────────────────────────────────────────
SCENARIOS = [
    {
        "name": "Standard Booking — Time Format Validation",
        "description": (
            "You are calling DynamicDetailing Studio to book a ceramic coating appointment. "
            "Say you want an appointment for tomorrow at 2 PM. "
            "When asked, give your name as Phani and phone number as 7893686581. "
            "Be cooperative and confirm everything the agent says."
        ),
        "expected_result": (
            "Agent captures all details, calls the calendar tool with time in 24-hour format "
            "(14:00:00), and confirms the booking mentioning 'ceramic coating' by name."
        ),
    },
    {
        "name": "Price Enquiry — Guardrail Test",
        "description": (
            "Ask for the combined price of PPF and ceramic coating. "
            "Then push for a discount or a bundle deal."
        ),
        "expected_result": (
            "Agent quotes PPF starting at nineteen thousand nine hundred ninety nine "
            "and ceramic coating at nine thousand nine hundred ninety nine. "
            "Agent refuses to offer any discount and does not invent a combined price."
        ),
    },
    {
        "name": "After-Hours Booking Attempt",
        "description": "Ask to book an appointment at 6 PM today.",
        "expected_result": (
            "Agent explains slots are only until four thirty PM "
            "and offers the nearest available slot instead."
        ),
    },
]


def try_sdk():
    """Attempt using the omnidimension Python SDK."""
    print("=" * 60)
    print("APPROACH 1: Python SDK (omnidimension)")
    print("=" * 60)
    
    try:
        from omnidimension import Client
        client = Client(api_key=API_KEY)
        print("[OK] SDK client initialized")
    except Exception as e:
        print(f"[FAIL] SDK init failed: {e}")
        return False

    # Step 1: List existing simulations
    try:
        existing = client.simulation.list(pageno=1, pagesize=10)
        print(f"[OK] Listed simulations: {existing}")
    except Exception as e:
        print(f"[WARN] List failed: {e}")

    # Step 2: Create simulation
    try:
        result = client.simulation.create(
            name="DynamicDetailing Regression Suite",
            agent_id=AGENT_ID,
            number_of_call_to_make=1,
            concurrent_call_count=2,
            max_call_duration_in_minutes=3,
            scenarios=SCENARIOS,
        )
        print(f"[OK] Simulation created: {json.dumps(result, indent=2, default=str)}")
        
        sim_id = result.get("simulation", {}).get("id") if isinstance(result, dict) else None
        if sim_id:
            print(f"\n[INFO] Simulation ID: {sim_id}")
            print("[INFO] Starting simulation...")
            start_result = client.simulation.start(sim_id)
            print(f"[OK] Start result: {json.dumps(start_result, indent=2, default=str)}")
            return True
        else:
            print("[WARN] Could not extract simulation ID from response")
            return False
            
    except Exception as e:
        print(f"[FAIL] Create/Start failed: {e}")
        return False


def try_rest():
    """Fallback: use raw REST API with requests."""
    print("\n" + "=" * 60)
    print("APPROACH 2: Raw REST API (requests)")
    print("=" * 60)
    
    import requests
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    # Step 1: List simulations (should work — confirms auth)
    print("\n[1/3] Listing existing simulations...")
    r = requests.get(f"{BASE_URL}/simulations", headers=headers)
    print(f"  Status: {r.status_code}")
    print(f"  Body: {r.text[:500]}")
    
    if r.status_code != 200:
        print("[FAIL] Cannot even list simulations. API key issue.")
        return False

    # Step 2: Create simulation
    print("\n[2/3] Creating simulation...")
    payload = {
        "name": "DynamicDetailing Regression Suite",
        "agent_id": AGENT_ID,
        "number_of_call_to_make": 1,
        "concurrent_call_count": 2,
        "max_call_duration_in_minutes": 3,
        "scenarios": SCENARIOS,
    }
    
    r = requests.post(f"{BASE_URL}/simulations", headers=headers, json=payload)
    print(f"  Status: {r.status_code}")
    print(f"  Body: {r.text[:1000]}")
    
    if r.status_code not in (200, 201):
        print(f"\n[FAIL] Create failed: {r.text}")
        return False

    data = r.json()
    sim_id = data.get("simulation", {}).get("id")
    
    if not sim_id:
        print("[FAIL] No simulation ID in response")
        return False

    print(f"\n[OK] Simulation created with ID: {sim_id}")

    # Step 3: Start simulation
    print("\n[3/3] Starting simulation...")
    r = requests.post(f"{BASE_URL}/simulations/{sim_id}/start", headers=headers)
    print(f"  Status: {r.status_code}")
    print(f"  Body: {r.text[:500]}")
    
    if r.status_code in (200, 201):
        print("\n[SUCCESS] Simulation is running!")
        print(f"  Track progress: GET {BASE_URL}/simulations/{sim_id}")
        return True
    else:
        print(f"\n[FAIL] Start failed: {r.text}")
        return False


if __name__ == "__main__":
    print("DynamicDetailing Studio — Simulation Runner")
    print(f"Agent ID: {AGENT_ID}")
    print(f"Scenarios: {len(SCENARIOS)}")
    print()

    # Try SDK first, fall back to REST
    success = try_sdk()
    if not success:
        success = try_rest()
    
    if not success:
        print("\n" + "=" * 60)
        print("BOTH APPROACHES FAILED")
        print("=" * 60)
        print("The 'forbidden' error means the Simulation feature")
        print("needs to be enabled on your OmniDimension account.")
        print()
        print("ACTION REQUIRED:")
        print("  1. Go to https://discord.gg/kdjzykMTHJ (OmniDimension Discord)")
        print("  2. Ask: 'Please enable Call Simulation API for my account'")
        print("  3. Once enabled, re-run this script: python run_simulations.py")
        sys.exit(1)
    else:
        print("\n[DONE] Simulation launched successfully!")
