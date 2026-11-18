# Diagrams

Mermaid sources for the README and the docs, in Jōge's colours (night stage and cream day, vermilion borders):

```bash
mmdc -i lifecycle.mmd -o ../assets/diagrams/lifecycle-dark.png -c mermaid-dark.json -b "#050505" -s 2 -w 900 --cssFile fonts.css
```

Each source renders twice at 2x with `mmdc -s 2 --cssFile fonts.css`: `-c mermaid-light.json -b '#F4EEE3'` and
`-c mermaid-dark.json -b '#050505'` into `.github/assets/diagrams/<name>-{light,dark}.png` (`readme-system.mmd` becomes
`system-*`). Width: `-w 1400` for the system map, `-w 900` for the others. Then copy the PNGs to
`docs-site/public/diagrams/` and update the sizes in `docs-site/lib/diagrams.ts`.
