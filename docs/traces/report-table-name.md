# Source to sink 2 · reports[reportId].table → FROM ${tableName}

Follows every value that reaches `${tableName}` in reportRepository.summary (Semgrep node-postgres-sqli, src/repositories/reportRepository.js:8). The user's reportId only selects a config entry; the table name itself comes from src/config/reports.js.

**Legend:** one chain per source, top to bottom · top card = source (🔴 user input · 🔵 config · ⚪ constant · 🟢 authenticated identity · 🟣 stored data · 🟠 external service) · each card is a line of code with the value in **bold**, and each arrow says what the value is called next · ⚠️ sink has a thick black frame · dashed side cards: 🚫 a control on the path that does not cover the value, 🛡 one that does, ✋ a path that stops before the sink.

```mermaid
flowchart TB
    C1["<b>1</b> · 🔴 <b>SOURCE</b> · user input, admin only<br/><i>controllers/reportsController.js:5</i><br/><code>const definition = reports[<b>req.params.reportId</b>]</code>"]
    C2["<b>2</b> · 🛡 only role admin can send reportId<br/><i>routes/reports.js:6</i>"]
    C3["<b>3</b> · ✋ <b>used only as an object key</b><br/><i>controllers/reportsController.js:5</i><br/><code>const definition = <b>reports[req.params.reportId]</b></code>"]
    C4["<b>4</b> · 🔵 <b>SOURCE</b> · source-code config, changed only by developers<br/><i>config/reports.js:2</i><br/><code>daily: { ..., table: '<b>orders_daily_summary</b>' }, monthly: { ..., table: '<b>orders_monthly_summary</b>' }</code>"]
    C5["<b>5</b> · <i>controllers/reportsController.js:5</i><br/><code>const <b>definition</b> = reports[req.params.reportId]</code>"]
    C6["<b>6</b> · 🛡 unknown key → 404#59; inherited keys pass with table undefined<br/><i>controllers/reportsController.js:6</i>"]
    C7["<b>7</b> · <i>services/reportService.js:4</i><br/><code>const summary = await reportRepository.summary(<b>definition.table</b>)</code>"]
    C8["<b>8</b> · <i>repositories/reportRepository.js:6</i><br/><code>async function summary(<b>tableName</b>)</code>"]
    C9["<b>9</b> · ⚠️ <b>SINK</b> · SQL text (FROM)<br/><i>repositories/reportRepository.js:8</i><br/><code>SELECT count(*)::int AS orders, ... FROM <b>${tableName}</b></code>"]

    C1 -.- C2
    C1 -.->|"reportId"| C3
    C4 ==>|"reports[reportId] → definition"| C5
    C7 -.- C6
    C5 ==>|"definition.table"| C7
    C7 ==>|"definition.table → tableName"| C8
    C8 ==>|"tableName"| C9

    classDef source_user fill:#fde2e1,stroke:#d93025,stroke-width:3px,color:#000
    classDef hop_user fill:#fff,stroke:#d93025,stroke-width:2px,color:#000
    classDef sink_user fill:#fde2e1,stroke:#000,stroke-width:4px,color:#000
    classDef source_config fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px,color:#000
    classDef hop_config fill:#fff,stroke:#1a73e8,stroke-width:2px,color:#000
    classDef sink_config fill:#e8f0fe,stroke:#000,stroke-width:4px,color:#000
    classDef side fill:#f1f3f4,stroke:#777,stroke-dasharray:4,color:#000
    classDef control fill:#e6f4ea,stroke:#188038,stroke-dasharray:4,color:#000
    class C1 source_user
    class C2 control
    class C3 side
    class C4 source_config
    class C5 hop_config
    class C6 control
    class C7 hop_config
    class C8 hop_config
    class C9 sink_config
    linkStyle 0,3 stroke:#188038,stroke-dasharray:4
    linkStyle 1 stroke:#999,stroke-dasharray:4
    linkStyle 2,4,5,6 stroke:#1a73e8,stroke-width:4px
```

| Source | Origin | Details | Reaches the sink? | Controls on the path |
|---|---|---|---|---|
| 1 · SOURCE: req.params.reportId | 🔴 user input | user input, admin only | No (✋ card 3) | 🛡 2: only role admin can send reportId |
| 4 · SOURCE: config/reports.js table names | 🔵 config | source-code config, changed only by developers | **Yes** | 🛡 6: unknown key → 404; inherited keys pass with table undefined |

| # | Card | Code | Tour highlights |
|---|---|---|---|
| 1 | 🔴 SOURCE: req.params.reportId | `src/controllers/reportsController.js:5` | `req.params.reportId` |
| 2 | 🛡 Check on the path: requireRole('admin') | `src/routes/reports.js:6` | `requireRole('admin')` |
| 3 | ✋ User input stops here | `src/controllers/reportsController.js:5` | `reports[req.params.reportId]` |
| 4 | 🔵 SOURCE: config/reports.js table names | `src/config/reports.js:2` | `daily: { title: 'Orders in the last 24 hours', table: 'orders_daily_summary' },` |
| 5 |  reports[reportId] → definition | `src/controllers/reportsController.js:5` | `definition` |
| 6 | 🛡 Check on the path: !definition → 404 | `src/controllers/reportsController.js:6` | `if (!definition) return res.status(404).json({ error: 'unknown report' });` |
| 7 |  definition.table → summary() | `src/services/reportService.js:4` | `definition.table` |
| 8 |  definition.table → tableName | `src/repositories/reportRepository.js:6` | `tableName` |
| 9 | ⚠️ SINK: FROM ${tableName} | `src/repositories/reportRepository.js:8` | `${tableName}` |

CodeTour: `.tours/source-to-sink-2-report-table-name.tour` (step N = card N).
