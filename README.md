<div align="center">

<img src="https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django"/>
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
<img src="https://img.shields.io/badge/DRF-REST%20API-red?style=for-the-badge&logo=django&logoColor=white" alt="DRF"/>

<br/><br/>

```
  ███████╗████████╗███████╗██████╗ ███╗   ██╗ █████╗
  ██╔════╝╚══██╔══╝██╔════╝██╔══██╗████╗  ██║██╔══██╗
  █████╗     ██║   █████╗  ██████╔╝██╔██╗ ██║███████║
  ██╔══╝     ██║   ██╔══╝  ██╔══██╗██║╚██╗██║██╔══██║
  ███████╗   ██║   ███████╗██║  ██║██║ ╚████║██║  ██║
  ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
```

### *A living sketchbook of memory*

**Eterna is not a social network.**  
It exists to preserve memories, tell stories, and help people realize they are never truly alone.

[🌐 Live Demo](https://eterna.onrender.com) · [📖 Docs](#-getting-started) · [🐛 Report a Bug](https://github.com/aumpatro22/Eterna/issues)

<br/>

![Eterna Hero](https://img.shields.io/badge/Status-MVP%20Live-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-orange?style=flat-square)

</div>

---

## ✨ What Is Eterna?

> *"Every life is a story worth remembering."*

Eterna is a **memory preservation platform** where families can:

- 📖 Create beautiful **memorial pages** for loved ones
- ✍️ Pin **memories, photos, and voice notes** to a Memory Lane
- ⏳ Build **chronological life timelines** with milestones
- 🤝 **Invite family members** as contributors
- 📬 Leave **guestbook messages** — heartfelt, permanent, no likes
- 🏷️ Connect with others through **Experience Tags** like *"Lost Grandmother"*

### What We Will Never Build

| ❌ No follower counts | ❌ No trending pages | ❌ No algorithmic feeds |
|---|---|---|
| ❌ No likes or reactions | ❌ No influencers | ❌ No infinite scrolling |

> Grief is not a competition. Memory is not content.

---

## 🖼️ Screenshots

<div align="center">

### Landing Page — Hero Section
*Typewriter headline · 3D tilting notebook · Floating paper scraps*

```
┌─────────────────────────────────────────────────────────────┐
│  ✨ A place for memory, not metrics                          │
│                                                              │
│  Every life is a story.▌          ┌──────────────────────┐  │
│                                   │ 📖 In Loving Memory  │  │
│  Eterna is a living sketchbook    │    ┌──────────────┐   │  │
│  of memory — where families       │    │      👴      │   │  │
│  preserve stories and realize     │    │  1941—2023   │   │  │
│  they are never truly alone.      │    └──────────────┘   │  │
│                                   │  He loved gardening…  │  │
│  [Start a Memorial Free →]        │  Every Sunday morning…│  │
│  [See How It Works]               └──────────────────────┘  │
│                                                              │
│  No follower counts. No algorithms. No advertising.         │
└─────────────────────────────────────────────────────────────┘
```

### Memorial Detail Page — 5 Tabs
```
┌─────────────────────────────────────────────────────────────┐
│  [Cover Image Banner]                                        │
│                                                              │
│  👤 Profile   Helen Ross                                     │
│     Photo     1940 – 2024                                    │
│               🏷️ Lost Grandmother  🌱 Caregiver              │
│                                                              │
│  [Overview] [Memory Lane(3)] [Timeline] [Gallery] [Contrib]  │
│                                                              │
│  ✍️ Memory Lane                                              │
│  ┌──────────────────────────────────────────┐               │
│  │  "Visiting the Garden"   — by Sarah      │               │
│  │  I remember picking fresh tomatoes…      │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

</div>

---

## 🏗️ Architecture

```
Eterna/
├── 🐍 Backend (Django + DRF)
│   ├── eternal_memories/       Project config, URLs, SPA view
│   ├── memorials/              Core app — memorials, memories, tags
│   │   ├── models.py           9 models
│   │   ├── serializers.py      9 serializers
│   │   └── api_views.py        15+ REST endpoints
│   ├── users/                  Auth, profiles
│   ├── tales/                  Story collections
│   └── communities/            Community groups
│
└── ⚛️  Frontend (React + Vite + Tailwind)
    └── frontend/src/
        ├── pages/              12 page components
        │   ├── Landing.jsx     Marketing landing page (8 sections)
        │   ├── Home.jsx        Memorial browser
        │   ├── MemorialCreate  Memorial creation form
        │   └── MemorialDetail  5-tab memorial view
        └── components/
            ├── Home/           Interactive3DNotebook, DoodleCorkboard
            ├── Memorial/       InteractiveCandle, CassetteTapePlayer
            └── layout/         Navbar, Footer, ExitIntentHook
```

---

## 🎨 Design System

Eterna uses a **hand-drawn sketchbook aesthetic** — wobbly borders, paper textures, pencil fonts.

| Token | Value | Usage |
|---|---|---|
| `paper` | `#fdfbf7` | Page background |
| `ink` | `#2d2d2d` | Text, borders, shadows |
| `marker` | `#ff4d4d` | Accent, CTA, highlights |
| `postit` | `#fff9c4` | Sticky note backgrounds |
| `erased` | `#e5e0d8` | Secondary backgrounds |

**Fonts:** [Kalam](https://fonts.google.com/specimen/Kalam) (headings) · [Patrick Hand](https://fonts.google.com/specimen/Patrick+Hand) (body)

---

## 🚀 Features

### Core MVP

| Feature | Description |
|---|---|
| 📖 **Memorial Pages** | Full profile with biography, cover & profile images, visibility controls |
| 📸 **Photo Albums** | Polaroid-style gallery with unlimited uploads |
| ⏳ **Life Timeline** | Chronological milestone entries with dates and images |
| ✍️ **Memory Lane** | Pin text memories, photos, and audio voice notes |
| 🔒 **Privacy Controls** | Public / Family Only / Private — per memorial and per memory |
| 📬 **Guestbook** | Heartfelt permanent messages, zero gamification |
| 🏷️ **Experience Tags** | Lost Grandmother · Lost Father · Pet Loss · Cancer Survivor · Caregiver |
| 🤝 **Contributors** | Invite family by username, role-based access |
| 📬 **Invitations** | Pending invite dashboard on home page (Accept / Decline) |

### Interactive UI

| Feature | Description |
|---|---|
| 📓 **3D Notebook Hero** | Tilts with mouse movement, page-turn animations |
| 🗂️ **Draggable Corkboard** | Sticky notes you can drag, drop, and rearrange — persists in localStorage |
| 🕯️ **Candle Lighting** | Interactive SVG candle with wobbly flame animation |
| 📼 **Cassette Tape Player** | Hand-drawn SVG with spinning reels |
| 🚪 **Exit Intent Hook** | Tear-off paper slip animation when leaving the page |
| ✏️ **Sketch Mode** | Draw freehand doodles over any page |

---

## 🛠️ Tech Stack

### Backend
| Tech | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Language |
| Django | 4.2 | Web framework |
| Django REST Framework | 3.14 | REST APIs |
| django-cors-headers | 4.x | CORS for Vite dev server |
| Whitenoise | 6.x | Static file serving |
| Pillow | 10.x | Image upload processing |
| SQLite | — | Local development database |
| PostgreSQL | — | Production (Render) |

### Frontend
| Tech | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 8 | Build tool + dev server |
| Tailwind CSS | 4 | Styling |
| React Router | 6 | Client-side routing |
| Axios | — | HTTP client |

---

## ⚙️ Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/aumpatro22/Eterna.git
cd Eterna
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Seed experience tags
python manage.py shell -c "
from memorials.models import ExperienceTag
tags = ['Lost Grandmother','Lost Father','Lost Mother','Pet Loss','Caregiver','Cancer Survivor']
for t in tags: ExperienceTag.objects.get_or_create(name=t)
print('Tags seeded.')
"

# Create a superuser (optional)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

The backend will be available at **http://127.0.0.1:8000/**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite dev server (proxies API to Django)
npm run dev
```

The frontend will be available at **http://localhost:5173/**

> **Note:** The Vite dev server automatically proxies all `/api/` and `/media/` requests to the Django backend.

### 4. Production Build

```bash
cd frontend
npm run build
# Outputs to frontend/dist/ — served automatically by Django + Whitenoise
```

---

## 🌍 Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

# Database (leave empty for SQLite in dev)
DATABASE_URL=

# AI Features (optional)
GROQ_API_KEY=
AI_HORDE_API_KEY=

# Email (optional, uses console backend if empty)
EMAIL_HOST=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

---

## 📡 API Reference

All endpoints are prefixed with `/api/`.

### Memorials

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/memorials/` | List all public memorials (paginated) | — |
| `POST` | `/memorials/` | Create a memorial | ✅ |
| `GET` | `/memorials/<id>/` | Get memorial detail | — |
| `PATCH` | `/memorials/<id>/` | Update memorial | Owner |
| `DELETE` | `/memorials/<id>/` | Delete memorial | Owner |
| `GET` | `/memorials/tags/` | List all experience tags | — |

### Memorial Content

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET/POST` | `/memorials/<id>/memories/` | List / add memories | — / ✅ |
| `POST` | `/memorials/<id>/messages/` | Leave a guestbook message | — |
| `POST` | `/memorials/<id>/candles/` | Light a candle | — |
| `POST` | `/memorials/<id>/photos/` | Upload a gallery photo | ✅ |
| `POST` | `/memorials/<id>/timeline/` | Add a timeline event | ✅ |

### Contributors & Invitations

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/memorials/<id>/contributors/` | List contributors | ✅ |
| `POST` | `/memorials/<id>/contributors/invite/` | Send an invitation | Owner |
| `GET` | `/memorials/invitations/` | My pending invitations | ✅ |
| `POST` | `/memorials/invitations/<id>/respond/` | Accept or decline | ✅ |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login/` | Login |
| `POST` | `/api/auth/logout/` | Logout |
| `GET` | `/api/auth/me/` | Get current user |
| `POST` | `/api/auth/register/` | Register |

---

## 🗂️ Data Models

```
Memorial ──────────────── MemorialPhoto
    │                         │
    ├── Memory                │
    ├── TimelineEvent         │
    ├── Message (Guestbook)   │
    ├── Candle                │
    ├── ExperienceTag (M2M) ──┘
    ├── Contributor
    └── ContributorInvitation
```

### Visibility Levels
Every memorial and individual memory supports three visibility levels:

| Level | Who Can See |
|---|---|
| `PUBLIC` | Everyone, including anonymous visitors |
| `FAMILY_ONLY` | Owner and all contributors |
| `PRIVATE` | Owner only |

### Contributor Roles

| Role | Permissions |
|---|---|
| `OWNER` | Full control — edit, delete, invite |
| `FAMILY_MEMBER` | Add memories, photos, timeline events |
| `EDITOR` | Edit biography and tribute text |

---

## 🚢 Deployment

Eterna is configured for deployment on [Render](https://render.com) via `render.yaml`.

### Render Setup

1. Connect your GitHub repository to Render
2. Render will auto-detect `render.yaml`
3. Set environment variables in the Render dashboard:
   - `SECRET_KEY`
   - `DATABASE_URL` (auto-provided by Render PostgreSQL)
   - `GROQ_API_KEY` (optional)
4. Deploy — Render runs `collectstatic` and `migrate` automatically

### Build Commands (configured in `render.yaml`)
```yaml
buildCommand: pip install -r requirements.txt && cd frontend && npm install && npm run build && cd .. && python manage.py collectstatic --noinput
startCommand: gunicorn eternal_memories.wsgi
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these principles:

### Core Rules
1. **Does this help people remember or connect?** If not, don't build it.
2. **No popularity mechanics** — no likes, follower counts, trending, or algorithmic feeds
3. **Privacy first** — default to most restrictive visibility
4. **Empathy over engagement** — optimize for healing, not time-on-site

### Development Workflow
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Commit
git add .
git commit -m "feat: add your feature description"

# Push and open a PR
git push origin feature/your-feature-name
```

### Commit Convention
```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting, no logic change
refactor: Code restructure, no behavior change
chore:    Build process, dependencies
```

---

## 🔮 Roadmap

The following features are planned for future phases, pending real user feedback:

- [ ] **Email notifications** — gentle, opt-in, for new contributions
- [ ] **Community spaces** — shared groups for grief journeys
- [ ] **Discovery** — gentle connection suggestions based on Experience Tags
- [ ] **Mobile app** — React Native companion
- [ ] **AI tribute drafting** — AI drafts a tribute from biography (user edits, AI never invents memories)
- [ ] **Export** — Download a memorial as a PDF keepsake
- [ ] **Shared grief circles** — Private group support spaces

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 💛 Acknowledgements

- Fonts: [Google Fonts](https://fonts.google.com) — Kalam & Patrick Hand
- Inspired by the universal human need to remember
- Built with empathy, for people going through loss

---

<div align="center">

**Someone deserves to be remembered.**

*It takes five minutes to create a memorial page. It lasts forever.*

[**Create a Memorial — Free →**](https://eterna.onrender.com/register)

<br/>

Made with 💛 by [Aumpatro](https://github.com/aumpatro22)

</div>
