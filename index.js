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

  filePath = `uploads/${Date.now()}.me`;
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
<title>File Metadata API - By Suvo</title>

<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">

<style>
:root{
  --bg:#0d1117;
  --card:#161b22;
  --border:#30363d;
  --accent:#58a6ff;
  --glow:rgba(88,166,255,.35);
  --text:#c9d1d9;
  --heading:#f0f6fc;
  --code:#7ee787;
}

*{
  box-sizing:border-box;
}

body{
  margin:40px auto;
  padding:30px;
  max-width:850px;
  background:var(--bg);
  color:var(--text);
  font-family:Poppins,sans-serif;
  opacity:0;
  animation:fade .8s ease forwards;
}

@keyframes fade{
  from{
    opacity:0;
    transform:translateY(20px);
  }
  to{
    opacity:1;
    transform:none;
  }
}

h1{
  color:var(--heading);
  display:flex;
  align-items:center;
  gap:10px;
  font-size:2.4rem;
  margin-bottom:8px;
  text-shadow:0 0 18px var(--glow);
}

h2{
  margin-top:35px;
  color:var(--accent);
  border-bottom:1px solid var(--border);
  padding-bottom:8px;
}

p{
  line-height:1.7;
}

pre{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:12px;
  padding:18px;
  overflow:auto;
  transition:.25s;
}

pre:hover{
  border-color:var(--accent);
  box-shadow:0 0 18px var(--glow);
}

code{
  color:var(--code);
  font-family:"Fira Code",monospace;
}

.badge{
  display:inline-block;
  padding:6px 12px;
  border-radius:6px;
  background:#58a6ff20;
  border:1px solid #58a6ff55;
  color:var(--accent);
  font-family:"Fira Code",monospace;
  font-weight:600;
}

.footer{
  margin-top:50px;
  padding-top:20px;
  border-top:1px solid var(--border);
  text-align:center;
  color:#8b949e;
}

.footer a{
  color:inherit;
  text-decoration:none;
}
</style>
</head>
<body>

<h1>📦 File Metadata API</h1>

<p>
Extract detailed metadata from any publicly accessible file URL including
images, videos, audio, documents, archives and more.
</p>

<h2>Endpoint</h2>

<p><span class="badge">POST /metadata</span></p>

<h2>Request Body</h2>

<pre><code>{
  "file": "https://example.com/file.ext"
}</code></pre>

<h2>JavaScript Example</h2>

<pre><code>const result = await HTTP.post({
  url: "https://metadata-v9yl.onrender.com/metadata",
  body: {
    file: "https://example.com/file.ext"
  }
});

console.log(result);</code></pre>

<h2>Supported Files</h2>

<p>
Images • Videos • Audio • Documents • Archives • Stickers • Any public file URL
</p>

<pre><code>https://example.com/file.ext</code></pre>

<h2>Response</h2>

<pre><code>{
  "success": true,
  "metadata": {
    ...
  }
}</code></pre>

<div class="footer">
  <p>
    Made with ❤️ by Suvo.
    <a href="https://t.me/nice_osei" target="_blank">
      <span id="tg-lottie"
      style="display:inline-block;width:24px;height:24px;vertical-align:middle;margin-left:6px;"></span>
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
