# Why DOMPurify makes `<%- comment.html %>` safe

`src/views/comments.ejs:18` prints each comment with `<%- comment.html %>`. `<%-` writes the string **without escaping**, so Semgrep flags it (`template-explicit-unescape`): if a commenter's markup reached it as-is, every visitor of the public `GET /comments` page would run it.

The value comes from the comment body a logged-in user posts, rendered from Markdown on every page load. The control is one line in `src/utils/markdown.js:4`:

`exports.render = (text) => DOMPurify.sanitize(marked.parse(text));`

This notebook sends one classic payload through those steps twice: once without `DOMPurify.sanitize`, once with it, and shows what reaches the template each time.

```ts
// Same libraries and versions as the app (package-lock.json)
import { marked } from 'npm:marked@16.4.2';
import DOMPurify from 'npm:isomorphic-dompurify@2.36.0'; // DOMPurify 3.4.16 on a jsdom window, as in src/utils/markdown.js
import ejs from 'npm:ejs@3.1.10';
import { log, logList, setDanger, dedent } from './lib/show.ts';

// The app's real template
const template = Deno.readTextFileSync('../src/views/comments.ejs');

// The active part: an event-handler attribute runs script in the browser
setDanger([/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, /<script\b[\s\S]*?<\/script>/gi]);

// One classic, harmless demonstration payload, as a comment body
const payload = `Package arrived damaged <img src="x" onerror="alert('XSS')">`;

// The <li> the template renders for one comment, as the browser receives it
function renderComment(html: string) {
  const page = ejs.render(template, { comments: [{ author: 'alice', createdAt: new Date('2026-10-06T00:00:00Z'), html }] });
  return dedent(page.match(/^[ \t]*<li>[\s\S]*?<\/li>/m)![0]);
}

let input = '', html = '', sanitized = '', fragment = '';
```

## Without DOMPurify

**1 · Comment body** (`req.body.body`, `commentsController.js:9`, stored in `comments.body` and read back on every page load)

```ts
input = payload.trim();
log('req.body.body → comments.body → comment.body', input);
```

**2 · Markdown → HTML** (`marked.parse`, `markdown.js:4`)

```ts
html = marked.parse(input) as string;
log('marked.parse(text)', html);
```

`marked` turns Markdown into HTML but passes raw HTML through untouched: the handler is still there.

**3 · Template output** (`<%- comment.html %>`, `comments.ejs:18`)

```ts
fragment = renderComment(html);
log('comments.ejs, one <li>', fragment);
```

A browser would parse this `<img>`, fail to load `src="x"`, and run the `onerror` handler for every visitor of `/comments`, including anonymous ones.

## With DOMPurify: what the app does

**1 · Comment body** (`req.body.body`)

```ts
input = payload.trim();
log('req.body.body → comments.body → comment.body', input);
```

**2 · Markdown → HTML** (`marked.parse`)

```ts
html = marked.parse(input) as string;
log('marked.parse(text)', html);
```

**3 · Sanitise** (`DOMPurify.sanitize`, `markdown.js:4`)

```ts
sanitized = DOMPurify.sanitize(html);
log('DOMPurify.sanitize(html)', sanitized);
logList('what DOMPurify removed', DOMPurify.removed.map((r: any) =>
  r.attribute
    ? `${r.attribute.name}="${r.attribute.value}" from <${r.from.nodeName.toLowerCase()}>: event handlers are not on its allowlist`
    : `<${r.element.nodeName.toLowerCase()}>: not on its allowlist`));
```

**4 · Template output** (`<%- comment.html %>`)

```ts
fragment = renderComment(sanitized);
log('comments.ejs, one <li>', fragment);
```

The `<img>` is still shown (it's allowed markup), but it has nothing left to run.

## Why that's enough, and what would break it

- **Why it works:** DOMPurify parses the HTML the way a browser does and keeps only allowlisted elements and attributes. Event handlers (`on…`), `<script>` and `javascript:` URLs are not on the allowlist, so they're removed from the parsed tree before the string is rebuilt.
- **Why it's enough here:** it runs on the *output* of `marked`, on every render, and it's the last step before `<%-`: nothing truncates, decodes or concatenates the string afterwards (`commentService.js:9` stores the result straight into `html`).
- **What would break it:** removing it or moving it to input only (existing rows would then render raw); any change to the HTML after sanitising (a preview that truncates, a mention replacer); printing `comment.body` instead of `comment.html`; or an outdated DOMPurify/jsdom with a known bypass. The default allowlist still allows `<form>`, `<style>` and `style`, which can't run script but can restyle the page: a narrow `ALLOWED_TAGS` list would remove that too.

*Try another payload: change `payload` in the setup cell, then re-run the cells.*
