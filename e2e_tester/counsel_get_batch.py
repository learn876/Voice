import pandas as pd
import json

BATCH_SIZE = 20

def get_batch():
    df = pd.read_csv('e2e_test_report.csv', encoding='utf-8')
    with open('counsel_progress.json', 'r') as f:
        tracker = json.load(f)
    
    start_row = tracker['current_row']
    if start_row >= len(df):
        print("NO MORE ROWS TO PROCESS.")
        return
        
    batch = df.iloc[start_row:start_row + BATCH_SIZE]
    
    with open('current_batch.txt', 'w', encoding='utf-8') as out_f:
        out_f.write(f"--- FETCHING BATCH (Rows {start_row} to {start_row + len(batch) - 1}) ---\n")
        for index, r in batch.iterrows():
            out_f.write(f"[{r['Call ID']}] Scenario: {r['Scenario Name']}\n")
            out_f.write(f"Expected: {r['Expected Outcome']}\n")
            out_f.write(f"Transcript:\n{r['Actual Transcript']}\n")
            out_f.write("-" * 50 + "\n")
            
    print("Batch successfully written to current_batch.txt")

if __name__ == '__main__':
    get_batch()
