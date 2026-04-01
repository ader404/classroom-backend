import "dotenv/config";

import('apminsight')
  .then(({ default: AgentAPI }) => AgentAPI.config())
  .catch(() => console.log('APM not available in this environment'));

import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";

import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";
import classesRouter from "./routes/classes.js";
import departmentsRouter from "./routes/departments.js";
import statsRouter from "./routes/stats.js";
import enrollmentsRouter from "./routes/enrollments.js";
import { attachCurrentUser, requireAuth, requireRole } from "./middleware/auth.js";

import securityMiddleware from "./middleware/security.js";
import { auth } from "./lib/auth.js";

const app = express();
const PORT = 8000;
const DEFAULT_FRONTEND_ORIGIN = "http://localhost:5173";
const frontendOrigin = process.env.FRONTEND_URL ?? DEFAULT_FRONTEND_ORIGIN;
const allowedOrigins = new Set([frontendOrigin, DEFAULT_FRONTEND_ORIGIN]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // allow cookies
  })
);

app.all("/auth/*splat", toNodeHandler(auth));
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(attachCurrentUser);
app.use(securityMiddleware);

app.use("/api/subjects", requireAuth, subjectsRouter);
app.use("/api/users", requireAuth, usersRouter);
app.use("/api/classes", requireAuth, classesRouter);
app.use("/api/departments", requireAuth, departmentsRouter);
app.use("/api/stats", requireAuth, requireRole("admin", "teacher"), statsRouter);
app.use("/api/enrollments", requireAuth, enrollmentsRouter);

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
