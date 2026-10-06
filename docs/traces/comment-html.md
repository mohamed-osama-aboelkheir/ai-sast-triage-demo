# Source to sink 3 · comment body → <%- comment.html %>

Follows the value printed raw by `<%- comment.html %>` in src/views/comments.ejs:18 (Semgrep template-explicit-unescape) back through the comments table to the POST /comments body that writes it.

**Legend:** one chain per source, top to bottom · top card = source (🔴 user input · 🔵 config · ⚪ constant · 🟢 authenticated identity · 🟣 stored data · 🟠 external service) · each card is a line of code with the value in **bold**, and each arrow says what the value is called next · ⚠️ sink has a thick black frame · dashed side cards: 🚫 a control on the path that does not cover the value, 🛡 one that does, ✋ a path that stops before the sink.

```mermaid
flowchart TB
    C1["<b>1</b> · 🔴 <b>SOURCE</b> · user input, any logged-in user#59; shown to every visitor (anonymous)<br/><i>controllers/commentsController.js:9</i><br/><code>const body = (<b>req.body.body</b> || '').trim()</code>"]
    C2["<b>2</b> · 🛡 auth only: any valid token can write a comment<br/><i>routes/comments.js:6</i>"]
    C3["<b>3</b> · 🚫 rejects empty only#59; no HTML check on input<br/><i>controllers/commentsController.js:10</i>"]
    C4["<b>4</b> · <i>services/commentService.js:13</i><br/><code>commentRepository.create(user.id, <b>body</b>)</code>"]
    C5["<b>5</b> · <i>repositories/commentRepository.js:16</i><br/><code>INSERT INTO comments (user_id, body) VALUES ($1, $2)', [userId, <b>body</b>]</code>"]
    C6["<b>6</b> · <i>repositories/commentRepository.js:8</i><br/><code>SELECT c.id, <b>c.body</b>, c.created_at, u.username FROM comments c JOIN users u ...</code>"]
    C7["<b>7</b> · <i>services/commentService.js:9</i><br/><code>html: markdown.render(<b>comment.body</b>)</code>"]
    C8["<b>8</b> · <i>utils/markdown.js:4</i><br/><code>DOMPurify.sanitize(marked.parse(<b>text</b>))</code>"]
    C9["<b>9</b> · 🛡 covers it: DOMPurify allowlist, last step before output<br/><i>utils/markdown.js:4</i>"]
    C10["<b>10</b> · <i>services/commentService.js:9</i><br/><code><b>html</b>: markdown.render(comment.body)</code>"]
    C11["<b>11</b> · <i>controllers/commentsController.js:5</i><br/><code>res.render('comments', { <b>comments</b> })</code>"]
    C12["<b>12</b> · ⚠️ <b>SINK</b> · raw HTML output<br/><i>views/comments.ejs:18</i><br/><code>#lt;div#gt;#lt;%- <b>comment.html</b> %#gt;#lt;/div#gt;</code>"]

    C1 -.- C2
    C4 -.- C3
    C1 ==>|"body"| C4
    C4 ==>|"body → comments.body"| C5
    C5 ==>|"comments.body (read back)"| C6
    C6 ==>|"comment.body → text"| C7
    C7 ==>|"text"| C8
    C10 -.- C9
    C8 ==>|"sanitised HTML → html"| C10
    C10 ==>|"comments[].html"| C11
    C11 ==>|"comment.html"| C12

    classDef source_user fill:#fde2e1,stroke:#d93025,stroke-width:3px,color:#000
    classDef hop_user fill:#fff,stroke:#d93025,stroke-width:2px,color:#000
    classDef sink_user fill:#fde2e1,stroke:#000,stroke-width:4px,color:#000
    classDef side fill:#f1f3f4,stroke:#777,stroke-dasharray:4,color:#000
    classDef control fill:#e6f4ea,stroke:#188038,stroke-dasharray:4,color:#000
    class C1 source_user
    class C2 control
    class C3 side
    class C4 hop_user
    class C5 hop_user
    class C6 hop_user
    class C7 hop_user
    class C8 hop_user
    class C9 control
    class C10 hop_user
    class C11 hop_user
    class C12 sink_user
    linkStyle 0,7 stroke:#188038,stroke-dasharray:4
    linkStyle 1 stroke:#999,stroke-dasharray:4
    linkStyle 2,3,4,5,6,8,9,10 stroke:#d93025,stroke-width:4px
```

| Source | Origin | Details | Reaches the sink? | Controls on the path |
|---|---|---|---|---|
| 1 · SOURCE: req.body.body | 🔴 user input | user input, any logged-in user; shown to every visitor (anonymous) | **Yes** | 🛡 2: auth only: any valid token can write a comment<br>🚫 3: rejects empty only; no HTML check on input<br>🛡 9: covers it: DOMPurify allowlist, last step before output |

| # | Card | Code | Tour highlights |
|---|---|---|---|
| 1 | 🔴 SOURCE: req.body.body | `src/controllers/commentsController.js:9` | `req.body.body` |
| 2 | 🛡 Check on the path: requireAuth on POST | `src/routes/comments.js:6` | `requireAuth` |
| 3 | 🚫 Check on the path: empty comment | `src/controllers/commentsController.js:10` | `if (!body)` |
| 4 |  body → commentRepository.create | `src/services/commentService.js:13` | `body` |
| 5 |  Stored in comments.body | `src/repositories/commentRepository.js:16` | `body` |
| 6 |  Read back for every visitor | `src/repositories/commentRepository.js:8` | `c.body` |
| 7 |  comment.body → markdown.render(text) | `src/services/commentService.js:9` | `comment.body` |
| 8 |  Markdown → HTML (marked) | `src/utils/markdown.js:4` | `text` |
| 9 | 🛡 Check on the path: DOMPurify.sanitize | `src/utils/markdown.js:4` | `DOMPurify.sanitize` |
| 10 |  Sanitised HTML → comment.html | `src/services/commentService.js:9` | `html` |
| 11 |  res.render('comments', { comments }) | `src/controllers/commentsController.js:5` | `comments` |
| 12 | ⚠️ SINK: <%- comment.html %> | `src/views/comments.ejs:18` | `comment.html` |

CodeTour: `.tours/source-to-sink-3-comment-html.tour` (step N = card N).
