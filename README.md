# D3vex Academy

D3vex Academy is an independent, browser-based study platform for the KCNA and CKA Kubernetes certifications. It is built for IT students who want one structured path from cloud native fundamentals to hands-on cluster administration, without assembling a curriculum from scattered notes and links.

The outcome is a working study loop: read an exam-mapped lesson, drill the corresponding kubectl command, sit a timed simulator, and use the resulting evidence to decide what to study next. The application is a static Vue front end with no account or backend; progress stays in the browser.

| Track | KCNA — cloud native foundations | CKA — cluster administration |
| --- | --- | --- |
| Lessons | 12 | 15 |
| Practice | 60 multiple-choice questions | 17 command drills |
| Timed simulator | 60 questions, 90 minutes | 17 tasks, 2 hours |
| Official format | Proctored multiple-choice, 90 minutes | Performance-based, 2 hours, Kubernetes v1.37 |

## What is inside

- **27 exam-mapped lessons** — 12 KCNA and 15 CKA lessons across nine modules. Every lesson belongs to a published exam domain and includes objectives, a Markdown body, an applied lab and a checkpoint question.
- **60-question KCNA bank** — four-option questions with explanations. Filter by domain or difficulty, answer one at a time, and revisit recorded answers.
- **17 CKA command drills** — type a kubectl command and receive per-requirement feedback, labels for missing checks, hints and a worked solution.
- **Two timed simulators** — the full KCNA question bank in 90 minutes, or all 17 CKA scenarios in 2 hours, with per-domain scoring and saved attempts.
- **Searchable reference** — a 59-entry kubectl and kubeadm cheat sheet, a 45-term glossary, and links to official Kubernetes, CNCF and Linux Foundation material. Global search also indexes lesson bodies.
- **Local progress** — lesson completion, bookmarks, quiz answers, drill passes, the last lesson and the 20 most recent exam attempts, stored in `localStorage`.
- **Portable front end** — Vue 3, Vite 6, Vue Router 4 and `marked`, with plain CSS and no UI framework. Tests use Vitest 4.

## Curriculum coverage

The curriculum follows the published domains and weights. Lesson counts show how this repository distributes its material; they are not official exam allocations.

### KCNA — Kubernetes and Cloud Native Associate

The official exam is a 90-minute, proctored multiple-choice test aligned with the current CNCF curriculum.

| Official domain | Weight | Lessons here |
| --- | ---: | ---: |
| Kubernetes Fundamentals | 44% | 3 |
| Container Orchestration | 28% | 4 |
| Cloud Native Application Delivery | 16% | 2 |
| Cloud Native Architecture | 12% | 3 |
| **Total** | **100%** | **12** |

### CKA — Certified Kubernetes Administrator

The official exam is performance-based, lasts two hours, and is aligned with Kubernetes v1.37.

| Official domain | Weight | Lessons here |
| --- | ---: | ---: |
| Cluster Architecture, Installation & Configuration | 25% | 4 |
| Workloads & Scheduling | 15% | 4 |
| Services & Networking | 20% | 3 |
| Storage | 10% | 2 |
| Troubleshooting | 30% | 2 |
| **Total** | **100%** | **15** |

## Quick start

Requirements: Node.js with npm. The production container builds on Node 22.

```bash
git clone git@github.com:d3vex/kcna-cka-learning-platform.git
cd kcna-cka-learning-platform
npm install
npm run dev
```

The dev server listens on `http://localhost:4173`, as configured in `vite.config.js`. The HTTPS clone URL is `https://github.com/d3vex/kcna-cka-learning-platform.git`.

```bash
npm test         # Vitest: 5 files, 30 tests
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle locally
```

## Project structure

```text
.
├── src/
│   ├── components/       Header, sidebar, search, Markdown and UI pieces
│   ├── content/          Lesson bodies in Markdown: kcna/ and cka/
│   ├── data/             Tracks, domains, lesson metadata, questions, challenges, reference
│   ├── lib/              Progress, command checks, exam scoring, search, tests
│   ├── views/            Route-level pages
│   └── router.js         History-mode routes
├── public/               favicon.svg and _redirects
├── deploy/nginx.conf     Production server block
├── Dockerfile            Node 22 build → nginx 1.27 runtime
├── docker-compose.yml    Port 8080, restart policy
├── netlify.toml
├── vercel.json
├── vite.config.js        Dev port 4173 and Vitest configuration
└── package.json
```

## How the learning flow works

1. **Learn** — open a track at `/track/:trackId`, then a lesson at `/track/:trackId/lesson/:lessonId`. Each lesson combines objectives, a Markdown explanation, an applied lab, a checkpoint question and previous/next navigation. Completion and bookmarking are explicit actions, so reading a page does not mark it done.
2. **Practice** — `/practice` has two modes. The KCNA quiz filters by domain and difficulty, explains every answer and records accuracy per domain. The CKA drills normalize a typed command and test it against the requirements defined for that scenario, then show which checks failed, a hint and a worked solution.
3. **Simulate** — `/exam` runs the full question bank randomized under time: 60 KCNA questions in 90 minutes or 17 CKA tasks in 2 hours. The timer starts immediately, keeps running while you navigate, and submits automatically at zero. Neither simulator provides hints. Results include a per-domain breakdown and comparison with the in-app practice target.
4. **Review** — `/progress` brings together overall and per-domain lesson completion, KCNA quiz accuracy, simulator history, bookmarks and the last lesson visited. Use the weakest domain or the missed command checks to choose the next lesson.

Progress is stored in `localStorage` under `d3vex-academy-progress-v1`. If that key is absent and data exists under the former `cloudpath-progress-v1` key, it is migrated automatically on first load. There is no account or cloud sync: clearing site data erases progress.

## Deployment

The app uses Vue Router history mode, so every host must serve `index.html` for unknown paths. Configuration for containers, Netlify, Vercel and plain static hosting is included. Clone from `git@github.com:d3vex/kcna-cka-learning-platform.git` or `https://github.com/d3vex/kcna-cka-learning-platform.git`.

### Docker Compose (recommended)

```bash
docker compose up --build -d
```

Open `http://localhost:8080`. Compose publishes container port 80 on host port 8080 and sets `restart: unless-stopped`. The image is a two-stage build: Node 22 runs `npm ci` and the Vite build, then nginx 1.27 serves `dist/` with SPA fallback, gzip, security headers, one-year caching for `/assets/`, and `GET /healthz`.

```bash
docker compose logs -f web
docker compose ps
docker compose down
```

`/healthz` returns `200 ok`. The image `HEALTHCHECK` calls it every 30 seconds, so `docker compose ps` reports the service as healthy.

### Docker CLI

```bash
docker build -t d3vex-academy .
docker run -d --name d3vex-academy \
  --restart unless-stopped \
  -p 8080:80 \
  d3vex-academy
curl -fsS http://localhost:8080/healthz
```

`deploy/nginx.conf` is the production server block copied into the image. It also sets a Content Security Policy that allows the app's own assets and the Google Fonts origins used by `index.html`.

### Netlify

`netlify.toml` supplies the build command, publish directory, a 200 rewrite to `index.html`, security headers and immutable caching for `/assets/*`.

```bash
npx netlify login
npx netlify init
npx netlify deploy --build --prod
```

### Vercel

`vercel.json` supplies the Vite build, output directory, SPA rewrite, security headers and asset caching.

```bash
npx vercel login
npx vercel --prod
```

### Static hosting or an existing nginx server

```bash
npm run build
```

Upload the contents of `dist/` to the web root, then configure the SPA fallback:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

On nginx, `deploy/nginx.conf` can be adapted as a `sites-available` server block. Hosts that support `_redirects` receive `public/_redirects` in the build output, which contains `/* /index.html 200`. Do not open `dist/index.html` through a `file://` URL; history-mode routing needs an HTTP server.

### Custom domain and TLS

Point the domain's DNS record at the server, terminate TLS at a reverse proxy, and forward traffic to port 8080. The container itself serves HTTP only. A TLS-terminating proxy such as Caddy, nginx or Traefik can front it; this Caddy example obtains and renews certificates automatically:

```caddyfile
academy.example.com {
    encode gzip
    reverse_proxy 127.0.0.1:8080
}
```

### Subpath caveat

The included configurations target a domain root. To serve the app at `https://example.com/d3vex/`, set Vite's `base` option to `/d3vex/`, change the router to `createWebHistory('/d3vex/')`, and add the matching proxy or rewrite rule at the host. Without all three changes, asset URLs and deep links resolve against the wrong base.

## Verification

The following checks were run manually against this repository. There is no CI workflow, so they are not repeated automatically on every change.

| Check | Evidence |
| --- | --- |
| Test suite | `npm test` — 5 test files, 30 tests passing. Covers curriculum integrity, KCNA and CKA scoring, command matching, search and progress migration. |
| Production build | `npm run build` — succeeds and emits `dist/` with hashed JavaScript and CSS assets plus `_redirects`. |
| Container and Compose | The image builds, `nginx -t` accepts `deploy/nginx.conf`, Compose starts the service, the container reports healthy, and `GET /healthz` returns `200 ok`. |
| Deep links | A direct request to a nested lesson path such as `/track/cka/lesson/cka-rbac` returns the app through the nginx fallback instead of a 404. The Netlify, Vercel and `_redirects` rules encode the same fallback. |
| CSP render | The production build renders in a browser under the configured Content Security Policy, including hashed assets and Google Fonts, without CSP violations. |
| Dependencies | `npm audit` — 0 vulnerabilities. |

## Scope and limitations

- **CKA requires a real cluster.** The CKA exam is performance-based, and the lessons' labs expect kubectl access. Practise on kind, minikube or a disposable cloud cluster; reading alone is not enough.
- **The command simulator checks shape, not cluster state.** It normalizes input and matches required patterns. It does not execute kubectl, contact an API server or verify that an object exists. It can accept an incomplete command or reject a valid alternative, so confirm each task against a live cluster.
- **KCNA is knowledge-based.** The question bank and explanations support recall and reasoning across the four domains, but they are not a substitute for the official exam objectives.
- **Practice targets are study benchmarks.** The in-app targets of 75% for KCNA and 66% for CKA are not official passing scores. The Linux Foundation pages govern pass/fail rules.
- **Progress is local to one browser.** There is no login, backend or sync. Clearing site storage or switching devices starts from an empty record.
- **Exam details can change.** Curriculum versions, domain weights and formats are checked against public sources, but the official pages always take precedence over this README or the app.

## Official sources

- [KCNA certification](https://training.linuxfoundation.org/certification/kubernetes-cloud-native-associate/)
- [KCNA curriculum](https://github.com/cncf/curriculum/blob/main/KCNA_Curriculum.pdf)
- [CKA certification](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/)
- [CKA curriculum v1.37](https://github.com/cncf/curriculum/blob/main/CKA_Curriculum_v1.37.pdf)
- [Kubernetes documentation](https://kubernetes.io/docs/)

Review these pages before booking an exam or studying toward a specific curriculum version.

## Trademark and affiliation

D3vex Academy is an independent educational project. It is not affiliated with, endorsed by or sponsored by The Linux Foundation, the Cloud Native Computing Foundation or any cloud provider. Kubernetes and Cloud Native Computing Foundation are trademarks of The Linux Foundation. All other names remain the property of their respective owners.
