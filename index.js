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
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Metadata API - By Suvo</title>
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --bg-color: #0d1117;
  --card-bg: #161b22;
  --border-color: #30363d;
  --accent-color: #58a6ff;
  --glow-color: rgba(88, 166, 255, 0.4);
  --text-main: #c9d1d9;
  --text-heading: #f0f6fc;
  --code-color: #7ee787;
}

body {
  font-family: 'Poppins', sans-serif;
  max-width: 850px;
  margin: 40px auto;
  padding: 30px;
  background: var(--bg-color);
  color: var(--text-main);
  opacity: 0;
  animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h1 {
  font-size: 2.5rem;
  color: var(--text-heading);
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 0 20px var(--glow-color);
  margin-bottom: 10px;
}

h2 {
  font-size: 1.3rem;
  color: var(--accent-color);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 8px;
  margin-top: 35px;
}

p {
  line-height: 1.6;
}

pre {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 18px;
  border-radius: 12px;
  overflow: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

pre:hover {
  border-color: var(--accent-color);
  box-shadow: 0 0 15px var(--glow-color);
}

code {
  font-family: 'Fira Code', monospace;
  color: var(--code-color);
  font-size: 0.95rem;
}

.endpoint-badge {
  display: inline-block;
  background: rgba(88, 166, 255, 0.15);
  color: var(--accent-color);
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-family: 'Fira Code', monospace;
  border: 1px solid rgba(88, 166, 255, 0.3);
}

.footer {
  margin-top: 50px;
  text-align: center;
  font-size: 0.9rem;
  color: #8b949e;
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}

.footer a {
  color: var(--accent-color);
  transition: opacity 0.2s;
}

.footer a:hover {
  opacity: 0.8;
}
</style>
</head>
<body>

<h1><span>📦</span> Metadata API</h1>

<p>Extract powerful metadata from any image URL instantly with high precision.</p>

<h2>Endpoint</h2>
<p><span class="endpoint-badge">POST /metadata</span></p>

<h2>Body Request</h2>
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
<p>You can also pass public image URLs directly for quick extraction.</p>
<pre><code>https://example.com/image.jpg</code></pre>

<h2>Response Format</h2>
<pre><code>{
  "success": true,
  "metadata": {
    "format": "jpeg",
    "width": 1920,
    "height": 1080,
    "size": "245KB"
  }
}</code></pre>

<div class="footer">
  <p>
    Made with ❤️ by Suvo. 
    <a href="https://t.me/nice_osei" target="_blank" style="display:inline-flex;align-items:center;text-decoration:none;vertical-align:middle;">
      <span id="tg-lottie" style="width:24px;height:24px;display:inline-block;margin-left:6px;"></span>
    </a>
  </p>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<script>
lottie.loadAnimation({
  container: document.getElementById("tg-lottie"),
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "https://heermes.ct.ws/file_358.tgs.json"
});
</script>
</body>
</html>`);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
