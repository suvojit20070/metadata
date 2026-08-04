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

app.get("/metadata", (req, res) => {
  res.setHeader("Content-Type", "text/html");

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Metadata API</title>
<style>
body{
  font-family:Arial,sans-serif;
  max-width:800px;
  margin:40px auto;
  padding:20px;
  background:#111;
  color:#fff;
}
pre{
  background:#1e1e1e;
  padding:15px;
  border-radius:8px;
  overflow:auto;
}
code{color:#7ee787;}
</style>
</head>
<body>

<h1>📦 Metadata API</h1>

<p>Extract metadata from an image URL.</p>

<h2>Endpoint</h2>

<pre><code>POST /metadata</code></pre>

<h2>Body</h2>

<pre><code>{
  "image": "https://example.com/image.jpg"
}</code></pre>

<h2>JavaScript Example</h2>

<pre><code>const result = await HTTP.post({
  url: "https://metadata-v9yl.onrender.com/metadata",
  body: {
    image: "https://example.com/image.jpg"
  }
});

console.log(result);</code></pre>

<h2>Direct Image URL</h2>

<p>You can pass any public image URL.</p>

<pre><code>https://example.com/image.jpg</code></pre>

<h2>Response</h2>

<pre><code>{
  "success": true,
  "metadata": {
    ...
  }
}</code></pre>

<p>
  Made with ❤️ by Suvo.
  <a href="https://t.me/nice_osei" target="_blank" style="display:inline-flex;vertical-align:middle">
    <lottie-player src="https://heermes.ct.ws/file_358.tgs.json?i=1" background="transparent" speed="1" style="width:24px;height:24px" loop autoplay></lottie-player>
  </a>
</p>

</body>
</html>`);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
