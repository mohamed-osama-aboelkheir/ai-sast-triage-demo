# AI SAST triage demo

The demo app from the AppSec Untangled video **Use AI to Get Smarter, Not Lazier**.

A small Express + PostgreSQL order tracker with a Semgrep scan that reports 4 findings. Some are real
and some are not. Two of them are SQL injection findings that look the same, but only one can be
exploited. You find out which by following the data, not by reading the flagged line.

Use it to practise triaging SAST findings with AI in a way that leaves you understanding the code:
understand the feature, trace the data, decide with evidence, and prove the control works.

> ⚠️ **This app is deliberately vulnerable.** Run it locally only. Don't deploy it or expose it to a
> network. The tokens and passwords in `.env.example` and `db/init.sql` are fake demo values.

- 🎥 Video: https://youtu.be/VIDEO_ID
- 📝 Blog post: BLOG_URL
- 🧰 Skills used in the demo: [`appsec-skills`](https://github.com/mohamed-osama-aboelkheir/appsec-untangled-resources/tree/main/plugins/appsec-skills/skills)
  (`code-walkthrough`, `source-to-sink`, `semgrep-triage`, `security-experiment`)

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
npm run scan         # Semgrep p/default, WARNING and ERROR, writes semgrep.json
```

`semgrep.json` is committed, so you can start triaging without installing Semgrep.

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
