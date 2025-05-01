# 🏠 HomeCloud Backend

HomeCloud is a self-hosted, personal cloud storage solution designed for home networks. This backend handles local file system access, uploads, directory listing, and preview generation. It is designed to run inside a Docker container with simple setup and minimal user management.

---

## 📁 Project Structure

```
homecloud-backend/
├── src/                   # Main application source code
│   ├── config/            # Environment variable handling
│   ├── routes/            # Express route handlers
│   └── index.js           # Entry point
├── deployment/            # Docker-related files
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env                   # Environment variables (NOT committed)
├── .env-example           # Sample environment variables (safe for Git)
├── .gitignore
└── package.json
```

---

## ⚙️ Environment Configuration

Use the `.env-example` file to set your environment variables:

### Step 1: Copy the example file

```bash
cp .env-example .env
```

### Step 2: Update values as needed

```env
PORT=3000
BASE_DIRECTORY=/app/data
```

- `PORT`: Port on which the backend server will run.
- `BASE_DIRECTORY`: Absolute path to the base directory for storing and reading files (inside Docker container).

---

## 🚀 Local Development

### Install dependencies

```bash
npm install
```

### Start the server locally

```bash
npm start
```

Then test:

```bash
curl http://localhost:3000/api/health
```

#### Configuration Notes

- The `start` script is for running the backend directly using `node`.
- The `dev` script is for development, which auto-restarts the app using `nodemon`.
- PM2-related scripts help with process management in production.

---

## 🐳 Dockerized Setup

### Step 1: Navigate to deployment folder

```bash
cd deployment
```

### Step 2: Build and run using Docker Compose

```bash
docker-compose up --build
```

### Step 3: Access on local network

```bash
http://<your-local-ip>:3000/api/health
```

Ensure that the `../data` directory exists on the host for file storage.

---

## 📦 Mounted Volumes

- `../data` → `/app/data` inside container: Used for storing uploaded files.
- `../.env` → `/app/.env` inside container: Environment configuration.

---

## 🧪 Health Check

To verify the server is running:

```
GET /api/health
```

**Response:**

```json
{
  "status": "ok",
  "message": "HomeCloud backend is healthy!",
  "timestamp": "2025-05-01T18:25:43.511Z"
}
```

---

## 🛑 Notes

- This backend is designed for **local/home use only**.
- No authentication is implemented (yet).
- No deletion is supported by design.
- File handling is entirely OS-level (no cloud blob storage).

---

## 📌 Roadmap (Coming Soon)

- [ ] Upload files
- [ ] Create folder previews
- [ ] Browse subfolders
- [ ] Connect to Angular/Flutter frontend
- [ ] Optional: mDNS/local domain support

---

## Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request. Make sure to follow the project's code style and include tests if you're adding new features or bug fixes.

---

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🧑‍💻 Author

Built with ❤️ by [Shrey Jain](https://github.com/er-shrey)
