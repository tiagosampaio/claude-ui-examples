# Claude UI Examples

Built with Claude. Not affiliated with Anthropic.

Fancy UI examples built to be recorded for Instagram and TikTok. They aren't
used in any product, so each one only has to look great on camera.

## Run

```bash
npm run dev
```

Then open <http://127.0.0.1:4173/>, which lists every example. There's nothing
to install. The only requirement is Node.

The examples are also published with GitHub Pages at
<https://tiagosampaio.github.io/claude-ui-examples/>, which updates on every push to
`main`.

```bash
npm test
```

## Recording

- Every example is a 1080×1920 stage that scales to fit the window.
- A scripted cursor plays the take on a loop, so each take is identical.
- Press **Space** to restart from the first frame.
- Add `?manual` to the URL to hide the fake cursor and use your real mouse.

## Examples

| Example | What it shows | Edit the words | Edit the timing |
|---|---|---|---|
| `glass-sidebar` | Frosted panel, dock-style icons, a springy glass highlight, night mode | `content.js` | `demo.js` |
| `lamp-login` | A pull cord with real physics, a flickering lamp, and a login card that appears in the light | `content.js` | `demo.js` |
| `glassy-otp` | A cut-corner glass card where a typed code rearranges into a wired grid, then bursts into a green check | `content.js` | `demo.js`, `timeline.js` |
| `clothes-rail` | Basketball shirts that swing round on a rail, then open with colour tags and a front and back view | `content.js` | `demo.js` |
| `liquid-footer` | A glass footer that pours in like water, with a wordmark cut through it, rippling links and an evening mode | `content.js` | `demo.js` |

## Adding an example

1. Create `examples/<name>/` with an `index.html` that loads
   `../../shared/base.css` and contains `<main class="stage" id="stage">`.
2. Respond to ordinary `pointermove` and `click` events. CSS `:hover` won't see
   the fake cursor.
3. Write the take in a `demo.js`, then start it with `runDemo` from
   `shared/demo-runner.js`. End on the first frame so the video loops cleanly.
4. Link it from the root `index.html` with a relative path. `npm test` fails if
   an example is missing.

## Layout

```
shared/     Stage scaling, scripted cursor, demo loop, spring physics
examples/   One self-contained folder per video
scripts/    Local dev server
tests/      Logic and demo script checks
```

## License

[MIT](LICENSE)
