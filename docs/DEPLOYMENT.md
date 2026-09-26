# AuraFinance OS — Production Deployment Guide
## Target: Web Innovation Unleashed Global Category

AuraFinance OS compiles into a pure, static client-side web application. It requires zero Node.js server runtimes, zero databases to manage, and zero backend microservices. It can be deployed to any modern edge hosting platform with global CDN acceleration.

---

## 1. Production Build Commands

```bash
# Clean install dependencies
npm ci

# Typecheck and produce static bundle
npm run build

# Preview build locally
npm run preview
```

The output artifacts are written to the `./dist` directory.

---

## 2. Platform Deployment Guides

### Option A: Vercel (Recommended)
1. Import the repository into your Vercel Dashboard.
2. The bundled `vercel.json` automatically configures single-page application routing rewrites:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
3. Set **Framework Preset** to `Vite`.
4. (Optional) Set `VITE_GEMINI_API_KEY` in Environment Variables if overriding the bundled key.
5. Click **Deploy**. Vercel will build and distribute the app across its global Edge Network.

---

### Option B: Cloudflare Pages
1. Connect your GitHub repository to Cloudflare Pages.
2. **Build command:** `npm run build`
3. **Build output directory:** `dist`
4. **Environment variables:**
   - `NODE_VERSION`: `20`
   - `VITE_GEMINI_API_KEY`: *(optional personal key)*
5. Add a `_redirects` file in `public/` (or use Cloudflare's Single Page Application default):
   ```
   /*    /index.html   200
   ```

---

### Option C: GitHub Pages
The project includes a production-ready GitHub Actions workflow at `.github/workflows/deploy.yml`:
1. Push to the `main` branch.
2. The workflow will automatically install dependencies, execute `tsc --noEmit`, run `vite build`, and publish the `./dist` folder to GitHub Pages via `peaceiris/actions-gh-pages`.
3. Under repository **Settings -> Pages**, select `Deploy from a branch` -> `gh-pages` branch.

---

## 3. Environment Configuration

| Variable Name | Required | Default / Fallback | Description |
| :--- | :--- | :--- | :--- |
| `VITE_GEMINI_API_KEY` | No (Evaluation key bundled) | Bundled pre-configured test key | Google Gemini API key for multimodal receipt OCR and live Copilot responses. |

*Note: In the absence of an API key or when offline, AuraFinance OS automatically engages its deterministic client-side heuristic engines with zero disruption to the user.*
