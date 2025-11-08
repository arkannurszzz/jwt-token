const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const path = require("path");

const app = express();
const PORT = 3000;
const SECRET_KEY = "MySecretKey"; // rahasia untuk JWT

app.use(bodyParser.json());

// ------------------------------
// Middleware Logger
// ------------------------------
function logger(req, res, next) {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
}
app.use(logger);

// ------------------------------
// Route: Login
// ------------------------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // validasi sederhana (tanpa database)
  if (username === "ana" && password === "1234") {
    // buat token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login berhasil", token });
  } else {
    res.status(401).json({ message: "Login gagal, username/password salah" });
  }
});

// ------------------------------
// Middleware: Verify Token
// ------------------------------
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // format: Bearer <token>

  if (!token) {
    return res.status(403).json({ message: "Token tidak ditemukan" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Token tidak valid" });
    }
    req.user = user; // simpan data user di request
    next();
  });
}

// ------------------------------
// Route: Profile (terlindungi)
// ------------------------------
app.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: `Selamat datang, ${req.user.username}!`,
    info: "Ini adalah halaman profil yang dilindungi token JWT.",
  });
});

// ------------------------------
// Route: Serve UI
// ------------------------------
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
