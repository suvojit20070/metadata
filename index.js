const express = require("express");
const multer = require("multer");
const ExifReader = require("exifreader");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Metadata API is running"
  });
});

app.get("/metadata", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: "No image uploaded"
      });
    }

    const buffer = fs.readFileSync(req.file.path);
    const metadata = ExifReader.load(buffer);

    fs.unlinkSync(req.file.path);

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
