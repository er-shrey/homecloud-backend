# 🏠 HomeCloud Backend

HomeCloud is a self-hosted, personal cloud storage solution designed for home networks. This backend handles local file system access, file uploads, user authentication, directory listing, preview generation, and basic admin controls. It is Dockerized for easy deployment and comes with a simple SQLite-based authentication system.

---

## 📁 Project Structure

```
homecloud-backend/
├── src/
│   ├── config/             # Environment variable handling
│   ├── routes/             # Express route handlers (auth, user, file, etc.)
│   ├── middleware/         # Authentication middleware
│   ├── utils/              # Utility functions (hashing, token, DB connection etc.)
│   └── index.js            # Entry point
├── scripts/
│   ├── create-admin.js     # Creation of first admin user
│   └── init-db.js          # DB initialization & admin user setup
├── deployment/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env                    # Environment variables (NOT committed)
├── .env-example            # Sample environment file
├── .gitignore
├── LICENSE                 # LICENSE file
├── README.md
└── package.json
```

---

## ⚙️ Environment Configuration

### Step 1: Copy the example file

```bash
cp .env-example .env
```

### Step 2: Update values as needed

```env
PORT=3000
BASE_DIRECTORY=/app/data
JWT_SECRET=your_secret_key
SQLITE_DB_PATH=/app/data/auth.db
```

- `PORT`: API server port
- `BASE_DIRECTORY`: File system root directory for user files
- `JWT_SECRET`: Secret used to sign JWTs
- `SQLITE_DB_PATH`: Absolute path to SQLite DB file

---

## 🚀 Local Development

### Install dependencies

```bash
npm install
```

### Initialize DB (run once)

```bash
npm run install
```

This creates the DB, tables, and prompts you to set up the default admin user.

### Start the server

```bash
npm start
```

---

## 🐳 Dockerized Setup

### Step 1: Go to deployment folder

```bash
cd deployment
```

### Step 2: Build and run with Docker Compose

```bash
docker-compose up --build
```

---

## 📦 Mounted Volumes

- `../data` → `/app/data` Files + SQLite DB storage
- `../.env` → `/app/.env`: Environment config

---

## 🔐 Authentication & Authorization

- Auth system based on JWT (no refresh token mechanism for simplicity)
- Tokens must be passed as `Authorization: Bearer <token>`
- Admin-only endpoints are protected using middleware
- Logout API supports JWT blacklisting (stored in DB)

### Authentication Routes

- `POST /api/auth/login`: Login with username & password
- `POST /api/auth/logout`: Logout and blacklist token
- `POST /api/auth/reset-password`: Reset password (self or admin-based)

---

## 👥 User Management APIs

Accessible only by admin users:

- `POST /api/users/add`: Add a new user
- `DELETE /api/users/:username`: Delete a user
- `GET /api/users`: List all usernames

---

## 🧪 Health Check

```
GET /api/health
```

```json
{
  "status": "ok",
  "message": "HomeCloud backend is healthy!",
  "timestamp": "2025-05-02T12:34:56.789Z"
}
```

---

## 🛑 Notes

- No third-party cloud or storage service used
- Token blacklisting handled via DB table (`jwt_blacklist`)
- Ideal for local/LAN setups — no refresh tokens or MFA yet

---

## 📌 Roadmap

- [x] JWT-based login/logout
- [x] Admin-only user management
- [x] SQLite DB with CLI setup
- [x] Token blacklist mechanism
- [x] File/folder previews
- [ ] Recursive thumbnail generation
- [ ] Frontend (Angular/Flutter)

---

## 🧑‍💻 Author

Built with ❤️ by [Shrey Jain](https://github.com/er-shrey)

## Known Bugs:

- [] Uploading files with same name and extension, replaces the older one
