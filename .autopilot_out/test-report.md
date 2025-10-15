# EFH Test Report
Base URL: http://localhost:3000
Generated: 2025-10-15T18:36:09.720Z
Total Duration: 279ms

**Summary**
- PASS: 1
- FAIL: 9
- WARN: 0

| Kind | Name | Code | Time | Status | Note |
|------|------|------|------|--------|------|
| API | /api/health | ERR | 16ms | FAIL | connect ECONNREFUSED 127.0.0.1:3000 |
| API-ERR | /api/health | SIM | 2ms | PASS | Thrown & caught (acceptable) |
| PAGE | / | ERR | 30ms | FAIL | page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/ Call log: - navigating to "http://localhost:3000/", waiting until "load" |
| PAGE | /get-started | ERR | 22ms | FAIL | page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/get-started Call log: - navigating to "http://localhost:3000/get-started", waiting until "load" |
| PAGE | /programs | ERR | 21ms | FAIL | page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/programs Call log: - navigating to "http://localhost:3000/programs", waiting until "load" |
| PAGE | /about | ERR | 21ms | FAIL | page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/about Call log: - navigating to "http://localhost:3000/about", waiting until "load" |
| PAGE | /connect | ERR | 20ms | FAIL | page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/connect Call log: - navigating to "http://localhost:3000/connect", waiting until "load" |
| PAGE | /government | ERR | 21ms | FAIL | page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/government Call log: - navigating to "http://localhost:3000/government", waiting until "load" |
| PAGE | /philanthropy | ERR | 22ms | FAIL | page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/philanthropy Call log: - navigating to "http://localhost:3000/philanthropy", waiting until "load" |
| PAGE | /professional | ERR | 21ms | FAIL | page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/professional Call log: - navigating to "http://localhost:3000/professional", waiting until "load" |