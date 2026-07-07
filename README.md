# ClarityCut - AI Background Remover

A premium, production-ready AI background removal SaaS built with vanilla web technologies.

## Features
- Drag & drop + file upload
- Real-time Before/After comparison (side-by-side + slider)
- Transparent PNG download
- Glassmorphism + dark mode
- Fully responsive
- Secure backend via Cloudflare Workers

## Deployment

1. Create GitHub repo and push all frontend files (`index.html`, `style.css`, etc.)
2. Enable GitHub Pages
3. Create Cloudflare Worker with `worker.js`
4. Add `REMOVEBG_API_KEY` environment variable in Cloudflare dashboard
5. Update `CONFIG.WORKER_URL` in `config.js`
6. Deploy!

**Note**: Get your free remove.bg API key from https://www.remove.bg/api
