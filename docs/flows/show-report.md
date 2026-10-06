# Revenue report (GET /reports/:reportId)

How an admin fetches a revenue summary (`daily` or `monthly`), from the request through the config lookup to the SELECT ... FROM ${tableName} statement flagged by Semgrep (src/repositories/reportRepository.js:8).

**Legend:** coloured bands are phases · 🔒 security control · ⚠️ sink / scanner finding · 🎯 untrusted source · solid arrows are calls, dashed are returns and responses · `break` boxes stop the request · in lanes with several files, each file's steps sit in a white box headed 📄 *file*, stacked in call order.

```mermaid
sequenceDiagram
    actor C as Admin<br/>API client (Bearer token)
    participant E as Express
    participant AU as Auth
    participant O as Controller<br/>reportsController.js
    participant CF as Config<br/>reports.js
    participant S as Service<br/>reportService.js
    participant P as Store<br/>reportRepository.js
    participant D as Postgres

    rect rgba(66,133,244,0.10)
        Note over C,D: Routing · steps 1–3
        C->>E: 1 · Client: HTTP request<br/>GET /reports/daily<br/>Authorization: Bearer tok_…
        rect rgba(255,255,255,0.75)
            Note over E: 📄 app.js
            Note over E: 2 · App: mount reports router<br/>routes/reports mounted second
        end
        E->>E: routes/reports.js
        rect rgba(255,255,255,0.75)
            Note over E: 📄 routes/reports.js
            Note over E: 3 · Routing: GET /reports/:reportId<br/>requireAuth → requireRole('admin')<br/>→ reportsController.show
        end
        E->>AU: requireAuth(req, res, next)
    end

    rect rgba(52,168,83,0.10)
        Note over C,D: Authentication · steps 4–6
        rect rgba(255,255,255,0.75)
            Note over AU: 📄 middleware/requireAuth.js
            Note over AU: 4 · 🔒 Auth: read Bearer token<br/>Authorization: Bearer <token><br/>missing → 401
        end
        break no Bearer token
            AU-->>C: 401 {"error":"missing token"}
        end
        rect rgba(255,255,255,0.75)
            Note over AU: 📄 middleware/requireAuth.js
            Note over AU: 5 · 🔒 Auth: authenticate token<br/>unknown token → 401
        end
        AU->>AU: userService.authenticate → findByToken(token)
        rect rgba(255,255,255,0.75)
            Note over AU: 📄 repositories/userRepository.js
            Note over AU: 6 · 🔒 Auth store: token lookup<br/>WHERE api_token = $1
        end
        break token not found
            AU-->>C: 401 {"error":"invalid token"}
        end
    end

    rect rgba(52,168,83,0.10)
        Note over C,D: Authorization · step 7
        AU->>AU: requireRole('admin')(req, res, next)
        rect rgba(255,255,255,0.75)
            Note over AU: 📄 middleware/requireRole.js
            Note over AU: 7 · 🔒 Authz: require admin role<br/>req.user.role !== 'admin' → 403
        end
        break role is not admin
            AU-->>C: 403 {"error":"forbidden"}
        end
    end

    rect rgba(251,188,4,0.12)
        Note over C,D: Input handling · steps 8–10
        AU->>O: next() → reportsController.show(req, res)
        Note over O: 8 · 🎯 Controller: look up reportId<br/>reports[req.params.reportId]
        O->>CF: 9 · 🔒 Config: report definitions<br/>reports['daily']
        CF-->>O: { title, table: 'orders_daily_summary' }
        Note over O: 10 · 🔒 Controller: unknown report → 404<br/>no definition → 404
        break reportId not in config
            O-->>C: 404 {"error":"unknown report"}
        end
    end

    rect rgba(234,67,53,0.12)
        Note over C,D: Data access · steps 11–13
        O->>S: reportService.build(definition)
        S->>P: 11 · Service: pass definition.table<br/>summary(definition.table)
        Note over S,P: definition.table is renamed tableName
        Note over P: 12 · ⚠️ Store: FROM interpolation<br/>FROM ${tableName}<br/>Semgrep: node-postgres-sqli
        P->>D: 13 · Postgres: aggregate the view<br/>pool.query(SELECT count(*), sum(total) FROM orders_daily_summary)
    end

    rect rgba(128,128,128,0.10)
        Note over C,D: Response · steps 14–16
        alt row
            D-->>P: { orders: 2, revenue: '352.50' }
            P-->>S: rows[0]
            Note over S: 14 · Service: add the title<br/>{ title, orders, revenue }
            S-->>O: { title, orders, revenue }
            O-->>C: 15 · Response: 200 JSON<br/>200 {"title":…,"orders":2,"revenue":"352.50"}
        else SQL error (e.g. FROM undefined)
            D-->>P: error: relation "undefined" does not exist
            P-->>E: rejected promise → error handler
            E-->>C: 16 · Error handler: 500<br/>500 {"error":"internal error"}
        end
    end
```

| # | Step | Code |
|---|---|---|
| 1 | Client: HTTP request | (no code) |
| 2 | App: mount reports router | `src/app.js:12` |
| 3 | Routing: GET /reports/:reportId | `src/routes/reports.js:6` |
| 4 | 🔒 Auth: read Bearer token | `src/middleware/requireAuth.js:5` |
| 5 | 🔒 Auth: authenticate token | `src/middleware/requireAuth.js:8` |
| 6 | 🔒 Auth store: token lookup | `src/repositories/userRepository.js:7` |
| 7 | 🔒 Authz: require admin role | `src/middleware/requireRole.js:2` |
| 8 | 🎯 Controller: look up reportId | `src/controllers/reportsController.js:5` |
| 9 | 🔒 Config: report definitions | `src/config/reports.js:2` |
| 10 | 🔒 Controller: unknown report → 404 | `src/controllers/reportsController.js:6` |
| 11 | Service: pass definition.table | `src/services/reportService.js:4` |
| 12 | ⚠️ Store: FROM interpolation | `src/repositories/reportRepository.js:8` |
| 13 | Postgres: aggregate the view | (no code) |
| 14 | Service: add the title | `src/services/reportService.js:5` |
| 15 | Response: 200 JSON | `src/controllers/reportsController.js:8` |
| 16 | Error handler: 500 | `src/app.js:18` |

CodeTour: `.tours/2-show-report.tour` (step N matches diagram step N).
