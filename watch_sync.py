import os
import json
import time

MATRIX_FILE = os.path.join(os.path.dirname(__file__), '.agents', 'dependency_matrix.json')

def load_matrix():
    if not os.path.exists(MATRIX_FILE):
        return {}
    with open(MATRIX_FILE, 'r') as f:
        return json.load(f)

def main():
    print("🚀 Starting OmniDimension Watchdog...")
    print("👀 Watching for manual edits to core architectural files...")
    
    matrix = load_matrix()
    if not matrix:
        print("❌ Error: dependency_matrix.json not found!")
        return

    # Track last modified times
    last_mtimes = {}
    for core_file in matrix.keys():
        path = os.path.join(os.path.dirname(__file__), core_file)
        if os.path.exists(path):
            last_mtimes[core_file] = os.path.getmtime(path)
        else:
            last_mtimes[core_file] = 0

    try:
        while True:
            time.sleep(3)
            for core_file, dependents in matrix.items():
                path = os.path.join(os.path.dirname(__file__), core_file)
                if os.path.exists(path):
                    current_mtime = os.path.getmtime(path)
                    
                    # If the file was modified since our last check
                    if current_mtime > last_mtimes[core_file]:
                        last_mtimes[core_file] = current_mtime
                        print(f"\n⚠️  WARNING: Manual edit detected in -> {core_file}")
                        print(f"   You MUST ask the AI Assistant to sync the following dependent files:")
                        for dep in dependents:
                            print(f"   - {dep}")
                        print("\n   Example Prompt for AI: 'I just updated {core_file}. Please run the Master Sync rule.'\n")
                        
    except KeyboardInterrupt:
        print("\n🛑 Watchdog stopped.")

if __name__ == "__main__":
    main()
