# AI Memories and Windsurf Artifacts

Restored Windsurf artifacts and extracted AI-related snippets are stored in the central restore folder:

`C:\Users\danga\OneDrive - Exposure Solutions\Clients\ACTIVE\Windsurf_Restore\`

Files of interest (full extracts available in the restore):

- `Windsurf_Restore\memory_snippets.txt` — extracted preferences, cache entries and small JSON fragments
- `Windsurf_Restore\leveldb_parsing\recovered_memories.txt`
- `Windsurf_Restore\leveldb_parsing_advanced\advanced_recovered.txt`

Summary:

- Preferences JSON (UI/devtools) was recovered.
- Many cache entries reference Codeium / unleash telemetry endpoints.
- No `.mdc` or `.cursor` rule files found and no clear assistant/chat JSON recovered so far.

If you want deeper recovery, run the LevelDB/IndexedDB extractor script `leveldb_extractor.py` in the restore folder. The script will attempt to use `plyvel` if available, otherwise it will perform a byte-scan for JSON-like fragments.

Excerpt (examples found in the restore):

```
{"electron":{"devtools":{"bounds":{"height":602,"width":801,...}
1/0/https://unleash.codeium.com/api/frontend?sessionId=...&appName=codeium-extension
```

See the restore folder for full extracts and logs.
