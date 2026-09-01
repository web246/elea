import json
from pathlib import Path

# Path to the Playwright result file created by the tool
result_path = Path(r"c:\Users\brian\AppData\Roaming\Code\User\workspaceStorage\d8983d4e2730493070066779c68013a7\GitHub.copilot-chat\chat-session-resources\c06ffc53-e668-44fb-bef1-82565b9dc810\call_ZnJLkyuy5XM47hl8aMsH07aU__vscode-1788078850634\content.txt")
out_dir = Path(r"c:\Users\brian\Desktop\apex\screenshots")

text = result_path.read_text(encoding='utf-8')
# The tool may prefix the JSON with non-JSON text like "Result: ". Find the first '{'
start = text.find('{')
if start == -1:
    raise SystemExit('No JSON object found in result file')
json_text = text[start:]
obj = json.loads(json_text)

for k,v in obj.items():
    # v may be an object with {"type":"Buffer","data":[...]}
    if isinstance(v, dict) and 'data' in v:
        data = v['data']
        out_path = out_dir / f"hero_{k}.png"
        out_path.write_bytes(bytearray(data))
        print('wrote', out_path)
    else:
        # in some outputs the value is a base64 string; handle that
        try:
            import base64
            out_path = out_dir / f"hero_{k}.png"
            out_path.write_bytes(base64.b64decode(v))
            print('wrote', out_path)
        except Exception as e:
            print('skipped', k, 'error', e)
print('done')
