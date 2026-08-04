const express = require("express");
const multer = require("multer");
const ExifReader = require("exifreader");
const fs = require("fs");
const axios = require("axios");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());

app.get("/", (req, res) => {
  res.redirect(302, "https://metadata-v9yl.onrender.com/metadata");
});

app.post("/metadata", upload.single("file"), async (req, res) => {
  try {
    const { exiftool } = require("exiftool-vendored");

let filePath;

if (req.file) {
  filePath = req.file.path;
} else if (req.body.file) {
  const response = await axios.get(req.body.file, {
    responseType: "arraybuffer"
  });

  filePath = `uploads/${Date.now()}.ext`;
  fs.writeFileSync(filePath, response.data);
} else {
  return res.status(400).json({
    ok: false,
    error: "File url is required!"
  });
}

const metadata = await exiftool.read(filePath);

fs.unlinkSync(filePath);

res.json({
  ok: true,
  metadata
});
  } catch (e) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      ok: false,
      error: e.message
    });
  }
});

app.get("/metadata", (req, res) => {
  const response = await fetch("https://cdn.jsdelivr.net/gh/suvojit20070/metadata@main/index.html");
  const html = response.text();
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
