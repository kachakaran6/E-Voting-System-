const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const { env } = require("./config/env");
const { connectDb } = require("./config/db");
const { registerSocketHandlers } = require("./config/socket");
const { sanitizeRequest } = require("./middleware/sanitize");
const { notFound, errorHandler } = require("./middleware/error");
const { seedPredefinedUsers } = require("./services/seed");

const { authRoutes } = require("./routes/authRoutes");
const { adminRoutes } = require("./routes/adminRoutes");
const { electionRoutes } = require("./routes/electionRoutes");
const { candidateRoutes } = require("./routes/candidateRoutes");
const { voteRoutes } = require("./routes/voteRoutes");
const { notificationRoutes } = require("./routes/notificationRoutes");
const { monitoringRoutes } = require("./routes/monitoringRoutes");

async function main() {
  await connectDb(env.MONGO_URI);
  await seedPredefinedUsers();

  const app = express();
  app.set("trust proxy", 1);
  const server = http.createServer(app);
  const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((o) => o.trim());

  const io = new Server(server, {
    cors: { 
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true 
    },
  });

  app.set("io", io);

  app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin images (Base64 is fine but help static)
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(compression());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(sanitizeRequest);

  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/admins", adminRoutes);
  app.use("/api/elections", electionRoutes);
  app.use("/api/candidates", candidateRoutes);
  app.use("/api/votes", voteRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/monitoring", monitoringRoutes);

  app.use(notFound);
  app.use(errorHandler);

  registerSocketHandlers(io);

  server.listen(env.PORT, () => {
    console.log(`API listening hi on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
