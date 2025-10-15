# EFH Test Report
Base URL: https://5173--0199e898-a551-7da5-ae3e-ede91f5fa3a8.us-east-1-01.gitpod.dev
Generated: 2025-10-15T17:43:45.180Z
Total Duration: 1903ms

**Summary**
- PASS: 3
- FAIL: 9
- WARN: 4

| Kind | Name | Code | Time | Status | Note |
|------|------|------|------|--------|------|
| API | /api/health | 500 | 272ms | FAIL | Non-2xx (500) |
| API | /api/ai-tutor/chat | 500 | 7ms | FAIL | Non-2xx (500) |
| API | /api/courses | 500 | 5ms | FAIL | Non-2xx (500) |
| API-ERR | /api/health | 500 | 4ms | PASS | Handled error path |
| API-ERR | /api/ai-tutor/chat | 500 | 5ms | PASS | Handled error path |
| API-ERR | /api/courses | 500 | 5ms | PASS | Handled error path |
| PAGE | / | 200 | 387ms | WARN | Loaded w/ console errors: Failed to load resource: the server responded with a status of 404 () |
| PAGE | /get-started | 500 | 40ms | FAIL | Empty or non-2xx. Console: Failed to load resource: the server responded with a status of 500 () |
| PAGE | /programs | 200 | 250ms | WARN | Loaded w/ console errors: Failed to load resource: the server responded with a status of 403 () |
| PAGE | /about | 200 | 247ms | WARN | Loaded w/ console errors: Failed to load resource: the server responded with a status of 403 () |
| PAGE | /connect | 500 | 40ms | FAIL | Empty or non-2xx. Console: Failed to load resource: the server responded with a status of 500 () |
| PAGE | /courses | 500 | 38ms | FAIL | Empty or non-2xx. Console: Failed to load resource: the server responded with a status of 500 () |
| PAGE | /lms | 200 | 288ms | WARN | Loaded w/ console errors: Failed to load resource: the server responded with a status of 403 () |
| PAGE | /dashboard | 500 | 41ms | FAIL | Empty or non-2xx. Console: Failed to load resource: the server responded with a status of 500 () |
| PAGE | /profile | 500 | 39ms | FAIL | Empty or non-2xx. Console: Failed to load resource: the server responded with a status of 500 () |
| PAGE | /settings | 500 | 42ms | FAIL | Empty or non-2xx. Console: Failed to load resource: the server responded with a status of 500 () |