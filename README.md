# Oryn — AI Prompt Gallery

**Oryn** is a curated gallery platform for discovering, saving, and sharing AI-generated art prompts. Built with a modern editorial aesthetic featuring dark/light themes, masonry layouts, and smooth animations.

## ✨ Features

- **Masonry Gallery** — Infinite scrollable grid with tag filtering, search, and sort (newest / trending / most liked)
- **Image Detail Modal** — Full-screen image view with prompt copy, like, save, and similar image recommendations
- **Prompt Builder** — Compose and refine AI art prompts
- **Style Converter** — Convert between prompt styles across different AI models
- **Saved Board** — Bookmark favorite images for later reference
- **Admin Panel** — Upload images, manage tags, edit metadata, toggle publish/draft status
- **Dark & Light Themes** — Editorial-quality design with grain overlay and serif typography
- **Azure Blob Storage** — Images stored on Azure with PostgreSQL metadata

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS v4, Framer Motion |
| Backend | Express.js, TypeScript, PostgreSQL (Azure) |
| Storage | Azure Blob Storage |
| Fonts | Cormorant Garamond, Inter, DM Mono |

## 📁 Project Structure

```
promptBoard/
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Gallery, ImageModal, ImageTrail, etc.
│   │   ├── pages/        # Home, GalleryPage, SavedPage, admin/*
│   │   ├── store/        # Zustand stores (gallery, auth)
│   │   ├── data/         # Types and constants
│   │   └── lib/          # Utility functions
│   └── vite.config.ts
├── server/               # Express API server
│   ├── src/
│   │   ├── routes/       # images, tags, admin, auth
│   │   ├── middleware/   # Rate limiting, auth
│   │   └── db.ts         # PostgreSQL connection pool
│   └── .env
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Azure)
- Azure Blob Storage account (for image uploads)

### 1. Clone & Install

```bash
git clone <repo-url>
cd promptBoard

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
# Gemini AI
GEMINI_API_KEY=your_key

# App
APP_URL=http://localhost:3000
ALLOWED_ORIGIN=http://localhost:3000

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/promptboard?sslmode=require

# Admin Auth
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER_NAME=images
```

### 3. Setup Database

```bash
cd server
npm run migrate   # Create tables
npm run seed      # Load seed data
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (port 4000)
cd server && npm run dev

# Terminal 2 — Frontend (port 3000)
cd client && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin Panel

Type `adminpanel` in the search bar on the home page, or navigate to `/admin` directly. Log in with your configured `ADMIN_PASSWORD`.

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/images` | Paginated, filterable image list |
| GET | `/api/images/:id` | Single image detail |
| GET | `/api/images/:id/similar` | Similar images by shared tags |
| POST | `/api/images/:id/like` | Like an image (fingerprint dedup) |
| POST | `/api/images/:id/copy` | Track prompt copy |
| GET | `/api/tags` | All available tags |
| POST | `/api/auth/login` | Admin login |
| GET | `/api/admin/images` | Admin image list |
| PATCH | `/api/admin/images/:id` | Update image metadata |
| DELETE | `/api/admin/images/:id` | Delete an image |
| POST | `/api/admin/upload` | Upload new image |

## 📄 License

Private project.
