import sys
import json
import os

def load_matrix(matrix_path):
    with open(matrix_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def find_downstream(matrix, target, visited=None):
    if visited is None:
        visited = set()
    
    if target in visited:
        return []
        
    visited.add(target)
    
    downstream = []
    if target in matrix:
        for dependency in matrix[target]:
            downstream.append(dependency)
            downstream.extend(find_downstream(matrix, dependency, visited))
            
    return list(dict.fromkeys(downstream)) # Deduplicate preserving order

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python impact_horizon.py <filename>")
        sys.exit(1)
        
    target_file = sys.argv[1]
    
    # Resolve the matrix path relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    matrix_path = os.path.join(script_dir, "dependency_matrix.json")
    
    if not os.path.exists(matrix_path):
        print(f"Error: {matrix_path} not found.")
        sys.exit(1)
        
    matrix = load_matrix(matrix_path)
    
    # Normalize paths for comparison
    normalized_target = target_file.replace("\\", "/")
    
    # Check if target exists in matrix (either as key or value)
    all_files = set(matrix.keys())
    for deps in matrix.values():
        all_files.update(deps)
        
    matched_target = None
    for file in all_files:
        if normalized_target.endswith(file):
            matched_target = file
            break
            
    if not matched_target:
        print(f"\n[?] '{target_file}' is not currently tracked in the dependency matrix.")
        sys.exit(0)
        
    downstream = find_downstream(matrix, matched_target)
    
    print(f"\n=== IMPACT HORIZON ANALYSIS ===")
    print(f"Target File: {matched_target}")
    print(f"-------------------------------")
    
    if not downstream:
        print("No downstream dependencies detected. This file can be modified safely.")
    else:
        print("WARNING: Modifying this file WILL break or affect the following downstream components:\n")
        for i, dep in enumerate(downstream, 1):
            print(f"  {i}. {dep}")
        print("\nACTION REQUIRED: You must explicitly update or verify these files if you proceed.")
    print("===============================\n")
