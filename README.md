# Leave Management Node + React App

This project now includes:

- **Node.js backend** using `Express`
- **React frontend** powered by `Vite`
- REST API endpoints for leave requests
- Data persistence in `data/leaves.json`

## Run locally

1. Install dependencies from the project root:
   ```bash
   npm install
   ```

2. Start the app in development mode:
   ```bash
   npm run dev
   ```

3. Open the frontend at:
   ```text
   http://localhost:5173
   ```

The backend API runs on `http://localhost:4000`.

## Login credentials

- Admin: `admin` / `admin123`
- Employee: `employee1` / `emp123`
- Employee: `employee2` / `emp456`

## Build for production

```bash
npm run build
npm start
```

The server will serve the built React app from `client/dist`.
