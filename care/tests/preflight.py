"""Read-only recovery/live comparison; isolated repair tests. No credentials needed."""
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tempfile
import urllib.error
import urllib.request
import zipfile

CARE = Path(__file__).resolve().parents[1]
ORIGIN = "https://realmwright-care.mdnahin537.workers.dev"
ARCHIVE_SHA256 = "d188c7c284397eabd3a07f3b5be4ccdb4be79718b983cc54204f2244ff673533"
PREFIX = "RealmWright-Care/"
report = {"scope": "Read-only public GET requests and isolated recovery tests",
          "repository_commit": __import__("os").environ.get("GITHUB_SHA"),
          "archive_sha256": None, "asset_comparison": [], "live_checks": [],
          "recovery_tests": []}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def get(path):
    request = urllib.request.Request(ORIGIN + path, headers={"Accept": "*/*", "User-Agent": "RealmWright-Care-Audit/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()

def live_check(path, expected_status, expected_source=None, json_fields=None):
    status, body = get(path)
    row = {"path": path, "status": status, "expected_status": expected_status}
    passed = status == expected_status
    if expected_source is not None:
        row["sha256"] = digest(body)
        row["expected_sha256"] = digest(expected_source)
        row["source_match"] = body == expected_source
        passed = passed and row["source_match"]
    if json_fields:
        try:
            data = json.loads(body)
            row["public_metadata"] = {key: data.get(key) for key in json_fields}
            passed = passed and all(data.get(key) == value for key, value in json_fields.items())
        except (ValueError, AttributeError):
            passed = False
            row["error"] = "Expected JSON response"
            if path == "/api/health":
                row["public_error_response"] = body.decode("utf-8", errors="replace")[:800]
    row["passed"] = passed
    report["live_checks"].append(row)
    print(json.dumps(row, ensure_ascii=False), flush=True)

def main():
    archive_bytes = (CARE / "handoff/RealmWright-Care-repair-source.zip").read_bytes()
    report["archive_sha256"] = digest(archive_bytes)
    assert report["archive_sha256"] == ARCHIVE_SHA256, "Recovery ZIP checksum mismatch"
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        assert archive.testzip() is None, "Recovery ZIP CRC mismatch"
        asset_prefix = PREFIX + "assets-fixed/"
        for name in archive.namelist():
            if not name.startswith(asset_prefix) or name.endswith("/"):
                continue
            relative = name[len(asset_prefix):]
            expected = archive.read(name)
            current = (CARE / "public" / relative).read_bytes()
            report["asset_comparison"].append({
                "path": relative, "repository_sha256": digest(current),
                "archive_sha256": digest(expected), "same": current == expected})
        live_check("/api/health", 200, json_fields={
            "ok": True, "release": "2026-09-29-care-repair"})
        live_check("/report/", 200)
        live_check("/api/feed", 200)
        live_check("/api/desk/summary", 404)
        live_check("/api/desk/notifications", 404)
        live_check("/desk/", 404)
        live_check("/desk/desk.js", 404)
        for name in ["wizard", "board", "item"]:
            live_check("/js/" + name + ".js", 200,
                       expected_source=archive.read(asset_prefix + "js/" + name + ".js"))
        live_check("/privacy/", 200)

        with tempfile.TemporaryDirectory(prefix="care-recovery-") as temporary:
            root = Path(temporary)
            for name in archive.namelist():
                target = (root / name).resolve()
                assert target.is_relative_to(root.resolve()), "Unsafe ZIP path"
            archive.extractall(root)
            for script in ["test.cjs", "test-client.cjs"]:
                result = subprocess.run(["node", script], cwd=root / "RealmWright-Care",
                                        text=True, capture_output=True, timeout=60)
                print(result.stdout, flush=True)
                if result.returncode:
                    print(result.stderr, flush=True)
                report["recovery_tests"].append({
                    "command": "node " + script, "exit_code": result.returncode,
                    "output": result.stdout.strip()})
    assert all(row["passed"] for row in report["live_checks"]), "Live baseline differs; review before source edits"
    assert all(row["exit_code"] == 0 for row in report["recovery_tests"]), "Recovery regression checks failed"

try:
    main()
finally:
    output = CARE / "test-results"
    output.mkdir(exist_ok=True)
    (output / "preflight.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
