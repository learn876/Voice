import pandas as pd
import json
import sys
import os

BATCH_SIZE = 20

def save_batch():
    if len(sys.argv) < 2:
        print("Usage: python counsel_save_batch.py <verdicts_json>")
        return
        
    verdicts_file = sys.argv[1]
    
    with open(verdicts_file, 'r', encoding='utf-8') as f:
        verdicts = json.load(f)
        
    with open('counsel_progress.json', 'r') as f:
        tracker = json.load(f)
        
    start_row = tracker['current_row']
    
    # Read the full original CSV as the base
    df = pd.read_csv('e2e_test_report.csv', encoding='utf-8')
    if 'Counsel Suggestions' not in df.columns:
        df['Counsel Suggestions'] = ""
        
    # If analyzed CSV exists, map its existing suggestions over so we don't lose past work
    if os.path.exists('e2e_test_report_analyzed.csv'):
        df_analyzed = pd.read_csv('e2e_test_report_analyzed.csv', encoding='utf-8')
        if 'Counsel Suggestions' in df_analyzed.columns:
            df['Counsel Suggestions'] = df_analyzed['Counsel Suggestions'].fillna("")
        
    # Apply verdicts
    for index in range(start_row, min(start_row + BATCH_SIZE, len(df))):
        call_id = str(df.at[index, 'Call ID'])
        if call_id in verdicts:
            df.at[index, 'Counsel Suggestions'] = verdicts[call_id]
            
    # Save CSV
    df.to_csv('e2e_test_report_analyzed.csv', index=False, encoding='utf-8')
    
    # Advance tracker
    tracker['current_row'] += BATCH_SIZE
    with open('counsel_progress.json', 'w') as f:
        json.dump(tracker, f, indent=2)
        
    print(f"✅ Successfully saved {len(verdicts)} verdicts. Tracker advanced to row {tracker['current_row']}.")

if __name__ == '__main__':
    save_batch()
