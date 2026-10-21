# Archive

Files that are **no longer in use** but should not be thrown away yet: replaced configs,
superseded prototypes, old assets, one-off exports.

The point is that the top folder stays a clean picture of the app as it is today. If a file
is not needed to run, deploy or document the platform, it does not belong next to
`package.json`, it belongs in here.

## How to use it

- Move the file in here instead of deleting it: `git mv old-thing.ts archive/`.
- Give it a name that still makes sense in a year, and add a row to the table below.
- Genuinely worthless files can just be deleted; git keeps the history of anything that was
  ever committed.

## What is in here

| File | What it was | Why it is here |
|---|---|---|
| `tailwind.config.ts` | The `create-next-app` starter Tailwind config: `content` globs plus a `gradient-radial` and `gradient-conic` background. | Dead since the real design system landed in `tailwind.config.js`. Tailwind resolves `tailwind.config.js` first and never read this file, so the two configs sitting side by side only invited edits to the wrong one. |
