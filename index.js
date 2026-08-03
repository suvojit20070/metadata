const express = require("express");
const multer = require("multer");
const ExifReader = require("exifreader");
const fs = require("fs");
const axios = require("axios");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Metadata API is running"
  });
});

app.post("/metadata", upload.single("image"), async (req, res) => {
  try {
    const { exiftool } = require("exiftool-vendored");

let filePath;

if (req.file) {
  filePath = req.file.path;
} else if (req.body.image) {
  const response = await axios.get(req.body.image, {
    responseType: "arraybuffer"
  });

  filePath = `uploads/${Date.now()}.jpg`;
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
