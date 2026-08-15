# SADAR Finance Frontend

React + Vite frontend untuk SADAR Finance.

## Styling

Project ini memakai kombinasi:

- Bootstrap 5, Reactstrap, dan Sass dari template dashboard.
- Tailwind CSS v4 untuk landing page SADAR Finance.

Entry Tailwind ada di:

```txt
src/tailwind.css
```

Tailwind di-load dari:

```txt
src/main.jsx
```

Landing page SADAR Finance ada di:

```txt
src/pages/Landing/OnePage/index.jsx
```

Styling landing page ditulis langsung sebagai utility class Tailwind di `className`, jadi file CSS lama `sadarLanding.css` tidak dipakai lagi.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```
