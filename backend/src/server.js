const express = require("express");
const cors = require("cors");

require("dotenv").config();

console.log("1) Starting server bootstrap - requires next...");

let sequelize;
try {
  console.log("2) Requiring ./config/database...");
  sequelize = require("./config/database");
  console.log("   -> ./config/database required OK");
} catch (e) {
  console.error("   -> ERROR requiring ./config/database:", e && e.message ? e.message : e);
  process.exit(1);
}

let compoundsRoute;
try {
  console.log("3) Requiring ./routes/compounds...");
  compoundsRoute = require("./routes/compounds");
  console.log("   -> ./routes/compounds required OK");
} catch (e) {
  console.error("   -> ERROR requiring ./routes/compounds:", e && e.message ? e.message : e);
  process.exit(1);
}

// ===== NEW: JWT Authentication Setup =====
let authRoute, { authenticate } = {};
try {
  console.log("3a) Requiring ./routes/auth and ./controllers/authController...");
  authRoute = require("./routes/authRoutes");
  ({ authenticate } = require("./controllers/authController"));
  console.log("   -> Auth routes/controllers required OK");
} catch (e) {
  console.error("   -> ERROR requiring auth routes/controllers:", e && e.message ? e.message : e);
  process.exit(1);
}
// =========================================

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ====== PUBLIC ROUTES ======
app.get("/", (req, res) => res.json({ status: "ok", service: "compounds-backend" }));

// JWT Auth routes
app.use("/api/auth", authRoute);

// Existing compounds route
app.use("/api/compounds", compoundsRoute);

// ====== PROTECTED TEST ROUTE ======
app.get("/api/protected", authenticate, (req, res) => {
  res.json({ message: "This is protected data", user: req.user });
});
// ==========================================

const PORT = process.env.PORT || 4000;

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err && err.stack ? err.stack : err);
});
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason && reason.stack ? reason.stack : reason);
});
process.on("exit", (code) => {
  console.log("Process exit event with code:", code);
});

(async () => {
  try {
    console.log("4) Calling sequelize.authenticate()");
    await sequelize.authenticate();
    console.log("   -> ? Database connected");
  } catch (err) {
    console.error("   -> DB authenticate FAILED:", err && err.message ? err.message : err);
    // continue on – we still try to start server to debug
  }

  try {
    console.log("5) Calling sequelize.sync()");
    await sequelize.sync();
    console.log("   -> ? sequelize.sync returned");
  } catch (err) {
    console.error("   -> sequelize.sync FAILED:", err && err.message ? err.message : err);
    // continue to start server for debugging
  }

  try {
    console.log("6) Calling app.listen()");
    app.listen(PORT, () => console.log(`?? Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("   -> app.listen FAILED:", err && err.message ? err.message : err);
    process.exit(1);
  }

  console.log("7) End of bootstrap IIFE (server should stay alive)");
})();
