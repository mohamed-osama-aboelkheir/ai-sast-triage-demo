# Source to sink 1 · sort → ORDER BY ${orderBy}

Follows every value that reaches `${orderBy}` in the ORDER BY clause of orderRepository.find (Semgrep node-postgres-sqli, src/repositories/orderRepository.js:8). userId and status are bound parameters ($1, $2) and are not traced.

**Legend:** one chain per source, top to bottom · top card = source (🔴 user input · 🔵 config · ⚪ constant · 🟢 authenticated identity · 🟣 stored data · 🟠 external service) · each card is a line of code with the value in **bold**, and each arrow says what the value is called next · ⚠️ sink has a thick black frame · dashed side cards: 🚫 a control on the path that does not cover the value, 🛡 one that does, ✋ a path that stops before the sink.

```mermaid
flowchart TB
    C1["<b>1</b> · ⚪ <b>SOURCE</b> · literal default, used when sort is absent<br/><i>services/orderService.js:4</i><br/><code>filters.orderColumn || <b>'created_at'</b></code>"]
    C2["<b>2</b> · 🔴 <b>SOURCE</b> · user input, any logged-in user<br/><i>controllers/ordersController.js:6</i><br/><code>const { status, <b>sort</b> } = req.query</code>"]
    C3["<b>3</b> · 🛡 auth only: any valid token can send sort<br/><i>routes/orders.js:5</i>"]
    C4["<b>4</b> · 🚫 allowlist covers status, not sort<br/><i>controllers/ordersController.js:7</i>"]
    C5["<b>5</b> · <i>controllers/ordersController.js:11</i><br/><code>orderService.search({ status, orderColumn: <b>sort</b> }, req.user)</code>"]
    C6["<b>6</b> · <i>services/orderService.js:4</i><br/><code>orderRepository.find(user.id, filters.status, <b>filters.orderColumn</b> || 'created_at')</code>"]
    C7["<b>7</b> · <i>repositories/orderRepository.js:6</i><br/><code>async function find(userId, status, <b>orderBy</b>)</code>"]
    C8["<b>8</b> · ⚠️ <b>SINK</b> · SQL text (ORDER BY)<br/><i>repositories/orderRepository.js:10</i><br/><code>ORDER BY <b>${orderBy}</b></code>"]

    C2 -.- C3
    C5 -.- C4
    C2 ==>|"sort → orderColumn"| C5
    C5 ==>|"filters.orderColumn"| C6
    C6 ==>|"orderColumn → orderBy"| C7
    C7 ==>|"orderBy"| C8
    C1 ==>|"orderBy"| C8

    classDef source_constant fill:#eceff1,stroke:#607d8b,stroke-width:3px,color:#000
    classDef hop_constant fill:#fff,stroke:#607d8b,stroke-width:2px,color:#000
    classDef sink_constant fill:#eceff1,stroke:#000,stroke-width:4px,color:#000
    classDef source_user fill:#fde2e1,stroke:#d93025,stroke-width:3px,color:#000
    classDef hop_user fill:#fff,stroke:#d93025,stroke-width:2px,color:#000
    classDef sink_user fill:#fde2e1,stroke:#000,stroke-width:4px,color:#000
    classDef side fill:#f1f3f4,stroke:#777,stroke-dasharray:4,color:#000
    classDef control fill:#e6f4ea,stroke:#188038,stroke-dasharray:4,color:#000
    class C1 source_constant
    class C2 source_user
    class C3 control
    class C4 side
    class C5 hop_user
    class C6 hop_user
    class C7 hop_user
    class C8 sink_user
    linkStyle 0 stroke:#188038,stroke-dasharray:4
    linkStyle 1 stroke:#999,stroke-dasharray:4
    linkStyle 2,3,4,5 stroke:#d93025,stroke-width:4px
    linkStyle 6 stroke:#607d8b,stroke-width:4px
```

| Source | Origin | Details | Reaches the sink? | Controls on the path |
|---|---|---|---|---|
| 1 · SOURCE: 'created_at' default | ⚪ constant | literal default, used when sort is absent | **Yes** | none |
| 2 · SOURCE: req.query.sort | 🔴 user input | user input, any logged-in user | **Yes** | 🛡 3: auth only: any valid token can send sort<br>🚫 4: allowlist covers status, not sort |

| # | Card | Code | Tour highlights |
|---|---|---|---|
| 1 | ⚪ SOURCE: 'created_at' default | `src/services/orderService.js:4` | `'created_at'` |
| 2 | 🔴 SOURCE: req.query.sort | `src/controllers/ordersController.js:6` | `sort` |
| 3 | 🛡 Check on the path: requireAuth | `src/routes/orders.js:5` | `requireAuth` |
| 4 | 🚫 Check on the path: status allowlist | `src/controllers/ordersController.js:7` | `if (status && !ALLOWED_STATUSES.includes(status))` |
| 5 |  sort → orderColumn | `src/controllers/ordersController.js:11` | `sort` |
| 6 |  orderColumn || 'created_at' | `src/services/orderService.js:4` | `filters.orderColumn` |
| 7 |  orderColumn → orderBy | `src/repositories/orderRepository.js:6` | `orderBy` |
| 8 | ⚠️ SINK: ORDER BY ${orderBy} | `src/repositories/orderRepository.js:10` | `${orderBy}` |

CodeTour: `.tours/source-to-sink-1-orders-order-by.tour` (step N = card N).
