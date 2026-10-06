# Use AI to Get Smarter, Not Lazier — demo repo

<table>
<tr>
<td width="100%">

<a href="https://youtu.be/z_A_UVAFx0M">
  <img src="https://img.youtube.com/vi/z_A_UVAFx0M/hqdefault.jpg" align="right" width="240" alt="Watch the video">
</a>

### 🎥 This demo is explained in detail on my YouTube channel <img src="assets/AppSec_Untangled_Logo.jpg" width="30"> [AppSec Untangled](https://www.youtube.com/@AppSecUntangled)

The same Semgrep triage done twice: a one-line "just triage it" prompt vs. using AI to understand
the code, trace the data, decide with evidence and prove the control works.

[![Watch on YouTube](https://img.shields.io/badge/▶_Watch_the_video-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/z_A_UVAFx0M)

📝 Blog post: BLOG_URL

</td>
</tr>
</table>

**This repo was built for that video and blog post.** It's a small, deliberately vulnerable
Express + PostgreSQL order tracker, plus the Semgrep findings and every artifact the AI produced in
the demo. It isn't a product or a library. It exists so you can follow along, check the outputs,
and try the workflow yourself.

> ⚠️ **This app is deliberately vulnerable.** Run it locally only. Don't deploy it or expose it to a
> network. The tokens and passwords in `.env.example` and `db/init.sql` are fake demo values.

**The idea:** AI makes the shortcut from "task" to "done" shorter than ever, but "do it for me" skips
the part where you learn, and that builds cognitive debt. The demo uses AI to balance **doing** and
**understanding**. Two SQL injection findings below look the same. Only one is exploitable, and you
find out which by following the data, not by reading the flagged line.

🧰 Skills used in the demo: [`appsec-skills`](https://github.com/mohamed-osama-aboelkheir/appsec-untangled-resources/tree/main/plugins/appsec-skills/skills)
(`code-walkthrough`, `source-to-sink`, `semgrep-triage`, `security-experiment`)

## The Semgrep scan from the video

This is the terminal output of the `semgrep scan` run at the start of the video, trimmed to the
findings ([full output](semgrep-scan-output.txt)):

```text
$ semgrep scan
...
┌─────────────────┐
│ 5 Code Findings │
└─────────────────┘

    src/app.js
     ❱ javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage
          ❰❰ Blocking ❱❱
          A CSRF middleware was not detected in your express application. Ensure you are either using one such
          as `csurf` or `csrf` (see rule references) and/or you are properly doing CSRF validation in your
          routes with a token or cookies.
          Details: https://sg.run/BxzR

            5┆ const app = express();

    src/repositories/orderRepository.js
    ❯❱ javascript.lang.security.audit.sqli.node-postgres-sqli.node-postgres-sqli
          ❰❰ Blocking ❱❱
          Detected string concatenation with a non-literal variable in a node-postgres JS SQL statement. This
          could lead to SQL injection if the variable is user-controlled and not properly sanitized. In order
          to prevent SQL injection, use parameterized queries or prepared statements instead. You can use
          parameterized statements like so: `client.query('SELECT $1 from table', [userinput])`
          Details: https://sg.run/0n3v

            8┆ `SELECT id, total, status, created_at FROM orders
            9┆  WHERE user_id = $1 AND ($2::text IS NULL OR status = $2)
           10┆  ORDER BY ${orderBy}`,

    src/repositories/reportRepository.js
    ❯❱ javascript.lang.security.audit.sqli.node-postgres-sqli.node-postgres-sqli
          ❰❰ Blocking ❱❱
          Detected string concatenation with a non-literal variable in a node-postgres JS SQL statement. This
          could lead to SQL injection if the variable is user-controlled and not properly sanitized. In order
          to prevent SQL injection, use parameterized queries or prepared statements instead. You can use
          parameterized statements like so: `client.query('SELECT $1 from table', [userinput])`
          Details: https://sg.run/0n3v

            8┆ `SELECT count(*)::int AS orders, coalesce(sum(total), 0) AS revenue FROM ${tableName}`

    src/services/exportService.js
    ❯❱ javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
          ❰❰ Blocking ❱❱
          Detected possible user input going into a `path.join` or `path.resolve` function. This could
          possibly lead to a path traversal vulnerability,  where the attacker can access arbitrary files
          stored in the file system. Instead, be sure to sanitize or validate user input first.
          Details: https://sg.run/OPqk

            4┆ exports.getPath = (file) => path.join(config.exportDir, file);

    src/views/comments.ejs
    ❯❱ javascript.express.security.audit.xss.ejs.explicit-unescape.template-explicit-unescape
          ❰❰ Blocking ❱❱
          Detected an explicit unescape in an EJS template, using '<%- ... %>' If external data can reach
          these locations, your application is exposed to a cross-site scripting (XSS) vulnerability. Use '<%=
          ... %>' to escape this data. If you need escaping, ensure no external data can reach this location.
          Details: https://sg.run/dKXQ

           18┆ <div><%- comment.html %></div>



...
Ran 240 rules on 43 files: 5 findings.
```

`semgrep.json` holds the same scan in JSON, made with `npm run scan` (Semgrep 1.177.0, `p/default`,
WARNING and ERROR only, `src/` only). It has 4 findings: that run leaves out the CSRF audit rule,
which doesn't apply here anyway, because the app authenticates with Bearer tokens, not cookies.

## Branches

- `main`: the app and the Semgrep results, with no AI output. Start here if you want to run the
  skills yourself and compare.
- [`reference-output`](../../tree/reference-output): everything the skills produced in the recorded
  session:
  - `docs/flows/`: sequence diagrams for the two SQL injection routes
  - `docs/traces/`: source-to-sink traces
  - `docs/triage/`: the triage reports
  - `.tours/`: CodeTour walkthroughs; step N matches step N in the diagram
  - `experiments/`: the DOMPurify notebook (Deno + Jupyter)

## Run it

```sh
cp .env.example .env
npm install
npm run db:up        # Postgres on localhost:5433, seeded from db/init.sql
npm start            # http://localhost:3000
```

Seeded API tokens (send as `Authorization: Bearer <token>`):

| User  | Role  | Token              |
|-------|-------|--------------------|
| alice | user  | `tok_alice_7d2f9c` |
| bob   | user  | `tok_bob_3a8e1b`   |
| admin | admin | `tok_admin_c41f6e` |

## Endpoints

| Method | Path                    | Auth  | What it does                         |
|--------|-------------------------|-------|--------------------------------------|
| GET    | `/orders?status=&sort=` | user  | Your orders, filtered and sorted     |
| GET    | `/exports?file=`        | user  | Download a CSV export                |
| GET    | `/reports/:reportId`    | admin | Revenue summary (`daily`, `monthly`) |
| GET    | `/comments`             | none  | Comments page (Markdown rendered)    |
| POST   | `/comments`             | user  | Add a comment (`{"body": "..."}`)    |

## Static analysis

```sh
npm run scan         # writes semgrep.json
semgrep scan         # the terminal view shown in the video
```

## Try it with Claude Code

```sh
/plugin marketplace add mohamed-osama-aboelkheir/appsec-untangled-resources
/plugin install appsec-skills@appsec-untangled
```

Then, from the repo root:

```text
/appsec-skills:code-walkthrough the node-postgres-sqli findings in semgrep.json
/appsec-skills:source-to-sink src/repositories/orderRepository.js:10
/appsec-skills:semgrep-triage semgrep.json
/appsec-skills:security-experiment why DOMPurify makes src/views/comments.ejs:18 safe
```

Try to decide each finding yourself before you run `semgrep-triage`. Or add `--learn`: you give
your verdict first, then compare it with the skill's.

## Code tours

The tours on the `reference-output` branch are for the
[CodeTour](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.codetour) VS Code
extension. Each step is anchored by a regex `pattern`. After you change the code, recompute the
highlights:

```sh
npm run tours         # update step selections from their patterns
npm run tours:check   # fail if any selection is stale or a pattern is ambiguous
```

## License

[MIT](LICENSE)
