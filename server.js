const express = require("express");
const session = require("express-session");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "site.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!process.env.ADMIN_PASSWORD) {
  console.warn("WARNING: ADMIN_PASSWORD is not set. Set it before deployment.");
}
if (!process.env.SESSION_SECRET) {
  console.warn("WARNING: SESSION_SECRET is not set. Set it before deployment.");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "change-me",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 8 * 60 * 60 * 1000 }
}));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/png", "image/jpeg", "image/webp",
      "application/pdf"
    ];
    cb(null, allowed.includes(file.mimetype));
  }
});

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
function adminOnly(req, res, next) {
  if (!req.session.isAdmin) return res.status(401).json({ error: "Admin authentication required." });
  next();
}

app.get("/api/site", (_req, res) => res.json(readData()));

app.post("/api/admin/login", async (req, res) => {
  const password = String(req.body.password || "");
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !(await bcrypt.compare(password, await bcrypt.hash(expected, 10)))) {
    return res.status(401).json({ error: "Invalid password." });
  }
  req.session.isAdmin = true;
  res.json({ ok: true });
});

app.post("/api/admin/logout", adminOnly, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/admin/me", (req, res) => res.json({ isAdmin: !!req.session.isAdmin }));

app.put("/api/admin/site", adminOnly, (req, res) => {
  const current = readData();
  const allowed = [
    "patientName", "disease", "hospital", "hepatologist", "oncologist",
    "treatment", "protocol", "injections", "tremelimumabCost",
    "durvalumabCost", "duration", "bankDetails"
  ];
  for (const key of allowed) if (req.body[key] !== undefined) current[key] = req.body[key];
  writeData(current);
  res.json(current);
});

app.post("/api/admin/qr", adminOnly, upload.single("qr"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Please upload a PNG/JPG/WEBP QR image." });
  const current = readData();
  current.qrImage = `/uploads/${req.file.filename}`;
  writeData(current);
  res.json({ qrImage: current.qrImage });
});

app.post("/api/admin/documents", adminOnly, upload.single("document"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Please upload a PDF or image." });
  const current = readData();
  const item = {
    id: Date.now().toString(),
    name: req.file.originalname,
    url: `/uploads/${req.file.filename}`
  };
  current.documents.push(item);
  writeData(current);
  res.json(item);
});

app.delete("/api/admin/documents/:id", adminOnly, (req, res) => {
  const current = readData();
  const item = current.documents.find(d => d.id === req.params.id);
  current.documents = current.documents.filter(d => d.id !== req.params.id);
  if (item) {
    const filename = path.basename(item.url);
    const full = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  }
  writeData(current);
  res.json({ ok: true });
});

app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Fundraising website running at http://localhost:${PORT}`);
});