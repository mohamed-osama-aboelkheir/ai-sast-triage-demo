# List my orders (GET /orders?status=&sort=)

How a signed-in customer lists their own orders, filtered by status and sorted by a column, from the request to the SELECT ... ORDER BY statement flagged by Semgrep (src/repositories/orderRepository.js:8).

**Legend:** coloured bands are phases · 🔒 security control · ⚠️ sink / scanner finding · 🎯 untrusted source · solid arrows are calls, dashed are returns and responses · `break` boxes stop the request · in lanes with several files, each file's steps sit in a white box headed 📄 *file*, stacked in call order.

```mermaid
sequenceDiagram
    actor C as Customer<br/>API client (Bearer token)
    participant E as Express
    participant AU as Auth
    participant O as Controller<br/>ordersController.js
    participant S as Service<br/>orderService.js
    participant P as Store<br/>orderRepository.js
    participant D as Postgres

    rect rgba(66,133,244,0.10)
        Note over C,D: Routing · steps 1–3
        C->>E: 1 · Client: HTTP request<br/>GET /orders?status=open&sort=total<br/>Authorization: Bearer tok_…
        rect rgba(255,255,255,0.75)
            Note over E: 📄 app.js
            Note over E: 2 · App: mount orders router<br/>express.json / urlencoded first<br/>then routes/orders
        end
        E->>E: routes/orders.js
        rect rgba(255,255,255,0.75)
            Note over E: 📄 routes/orders.js
            Note over E: 3 · Routing: GET /orders<br/>requireAuth → ordersController.list<br/>no role check
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
            Note over AU: 5 · 🔒 Auth: authenticate token<br/>unknown token → 401<br/>req.user = { id, username, role }
        end
        AU->>AU: userService.authenticate → findByToken(token)
        rect rgba(255,255,255,0.75)
            Note over AU: 📄 repositories/userRepository.js
            Note over AU: 6 · 🔒 Auth store: token lookup<br/>WHERE api_token = $1<br/>token bound as a parameter
        end
        break token not found
            AU-->>C: 401 {"error":"invalid token"}
        end
    end

    rect rgba(251,188,4,0.12)
        Note over C,D: Input handling · steps 7–9
        AU->>O: next() → ordersController.list(req, res)
        Note over O: 7 · 🎯 Controller: read status, sort<br/>status, sort from the query string
        Note over O: 8 · 🔒 Controller: validate status<br/>status ∈ open|shipped|cancelled<br/>sort is not checked
        break status not allowed
            O-->>C: 400 {"error":"invalid status"}
        end
        O->>S: 9 · Controller: rename sort<br/>search({ status, orderColumn: sort }, req.user)
        Note over O,S: sort is renamed orderColumn
    end

    rect rgba(234,67,53,0.12)
        Note over C,D: Data access · steps 10–13
        S->>P: 10 · Service: default sort column<br/>find(user.id, status, orderColumn || 'created_at')
        Note over S,P: orderColumn is renamed orderBy
        Note over P: 11 · ⚠️ Store: ORDER BY interpolation<br/>ORDER BY ${orderBy}<br/>Semgrep: node-postgres-sqli
        Note over P: 12 · 🔒 Store: bound parameters<br/>$1 = userId, $2 = status<br/>bound, not in SQL text
        P->>D: 13 · Postgres: run the SELECT<br/>pool.query(SELECT … ORDER BY total, [1, 'open'])
    end

    rect rgba(128,128,128,0.10)
        Note over C,D: Response · steps 14–15
        alt rows
            D-->>P: rows
            P-->>O: orders
            O-->>C: 14 · Response: 200 JSON<br/>200 [{id, total, status, created_at}, …]
        else SQL error (e.g. unknown column)
            D-->>P: error: column "price" does not exist
            P-->>E: rejected promise → error handler
            E-->>C: 15 · Error handler: 500<br/>500 {"error":"internal error"}
        end
    end
```

| # | Step | Code |
|---|---|---|
| 1 | Client: HTTP request | (no code) |
| 2 | App: mount orders router | `src/app.js:11` |
| 3 | Routing: GET /orders | `src/routes/orders.js:5` |
| 4 | 🔒 Auth: read Bearer token | `src/middleware/requireAuth.js:5` |
| 5 | 🔒 Auth: authenticate token | `src/middleware/requireAuth.js:8` |
| 6 | 🔒 Auth store: token lookup | `src/repositories/userRepository.js:7` |
| 7 | 🎯 Controller: read status, sort | `src/controllers/ordersController.js:6` |
| 8 | 🔒 Controller: validate status | `src/controllers/ordersController.js:7` |
| 9 | Controller: rename sort | `src/controllers/ordersController.js:11` |
| 10 | Service: default sort column | `src/services/orderService.js:4` |
| 11 | ⚠️ Store: ORDER BY interpolation | `src/repositories/orderRepository.js:10` |
| 12 | 🔒 Store: bound parameters | `src/repositories/orderRepository.js:11` |
| 13 | Postgres: run the SELECT | (no code) |
| 14 | Response: 200 JSON | `src/controllers/ordersController.js:12` |
| 15 | Error handler: 500 | `src/app.js:18` |

CodeTour: `.tours/1-list-orders.tour` (step N matches diagram step N).
