// ۱. فرانت‌آند یکپارچه: بازی نئونی و جذاب Snake (مار) به عنوان پوشش سایت
const HTML_FRONTEND = `
<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AetherLink Arena - Deno Edge Engine</title>
  <style>
    :root {
      --primary: #00f5ff;
      --accent: #a855f7;
      --bg-gradient: linear-gradient(135deg, #0a0a0a 0%, #1a0033 100%);
      --card-bg: rgba(255, 255, 255, 0.03);
      --border-color: rgba(0, 245, 255, 0.15);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; }
    body {
      background: var(--bg-gradient);
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      overflow-x: hidden;
    }
    header {
      width: 100%;
      max-width: 1100px;
      padding: 1.5rem 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
    }
    .logo {
      font-size: 1.6rem;
      font-weight: 800;
      background: linear-gradient(90deg, #00f5ff, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .game-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      width: 100%;
      max-width: 440px;
    }
    .score-board {
      display: flex;
      justify-content: space-between;
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      padding: 10px 20px;
      border-radius: 50px;
      margin-bottom: 15px;
      font-weight: bold;
      font-size: 1.1rem;
    }
    #score { color: var(--primary); }
    #high-score { color: var(--accent); }
    canvas {
      background: #000;
      border: 2px solid var(--border-color);
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0, 245, 255, 0.1);
      display: block;
    }
    .controls {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 20px;
      width: 100%;
      max-width: 200px;
    }
    .btn {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      color: #fff;
      padding: 15px;
      border-radius: 12px;
      font-size: 1.2rem;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      text-align: center;
      transition: all 0.2s;
    }
    .btn:active {
      background: var(--primary);
      color: #000;
      box-shadow: 0 0 15px var(--primary);
    }
    .btn-up { grid-column: 2; }
    .btn-left { grid-column: 1; }
    .btn-right { grid-column: 3; }
    .btn-down { grid-column: 2; }
    footer {
      text-align: center;
      padding: 1.5rem 0;
      opacity: 0.6;
      font-size: 0.85rem;
      width: 100%;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">AetherLink Deno</div>
    <div style="font-size: 0.85rem; color: var(--primary);">قدرت گرفته از دنو دپلوُی</div>
  </header>
  <div class="game-wrapper">
    <div class="score-board">
      <div>امتیاز: <span id="score">0</span></div>
      <div>بالاترین رکورد: <span id="high-score">0</span></div>
    </div>
    <canvas id="gameCanvas" width="360" height="360"></canvas>
    <div class="controls">
      <div class="btn btn-up" onclick="changeDirection('up')">▲</div>
      <div class="btn btn-left" onclick="changeDirection('left')">◀</div>
      <div class="btn btn-right" onclick="changeDirection('right')">▶</div>
      <div class="btn btn-down" onclick="changeDirection('down')">▼</div>
    </div>
  </div>
  <footer>
    استفاده از کیبورد یا دکمه‌های لمسی برای بازی کردن
  </footer>
  <script>
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const gridSize = 18;
    const tileCount = canvas.width / gridSize;
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 5, y: 5 };
    let dx = 1; let dy = 0; let score = 0;
    let highScore = localStorage.getItem("snakeHighScore") || 0;
    document.getElementById("high-score").innerText = highScore;
    function gameLoop() {
      updateSnake();
      if (checkGameOver()) { resetGame(); return; }
      clearCanvas(); drawFood(); drawSnake();
    }
    function clearCanvas() { ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    function drawSnake() {
      snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#00f5ff" : "#a855f7";
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
      });
    }
    function updateSnake() {
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++; document.getElementById("score").innerText = score;
        if (score > highScore) { highScore = score; localStorage.setItem("snakeHighScore", highScore); document.getElementById("high-score").innerText = highScore; }
        generateFood();
      } else { snake.pop(); }
    }
    function generateFood() {
      food.x = Math.floor(Math.random() * tileCount);
      food.y = Math.floor(Math.random() * tileCount);
    }
    function drawFood() {
      ctx.fillStyle = "#ff007f";
      ctx.beginPath();
      const radius = (gridSize - 2) / 2;
      ctx.arc(food.x * gridSize + radius, food.y * gridSize + radius, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
    function checkGameOver() {
      const head = snake[0];
      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
      for (let i = 1; i < snake.length; i++) { if (snake[i].x === head.x && snake[i].y === head.y) return true; }
      return false;
    }
    function resetGame() {
      alert("بازی تمام شد! امتیاز شما: " + score);
      snake = [{ x: 10, y: 10 }]; dx = 1; dy = 0; score = 0;
      document.getElementById("score").innerText = score; generateFood();
    }
    document.addEventListener("keydown", e => {
      if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -1; }
      if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 1; }
      if (e.key === "ArrowLeft" && dx === 0) { dx = -1; dy = 0; }
      if (e.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
    });
    function changeDirection(dir) {
      if (dir === 'up' && dy === 0) { dx = 0; dy = -1; }
      if (dir === 'down' && dy === 0) { dx = 0; dy = 1; }
      if (dir === 'left' && dx === 0) { dx = -1; dy = 0; }
      if (dir === 'right' && dx === 0) { dx = 1; dy = 0; }
    }
    generateFood();
    setInterval(gameLoop, 130);
  </script>
</body>
</html>
`;

// ۲. هدرهای محدود شده برای فیلتر و حذف فینگرپرینت
const RESTRICTED_HEADERS = new Set([
  "host", "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding", "upgrade", "forwarded",
  "x-forwarded-host", "x-forwarded-proto", "x-forwarded-port"
]);

// ۳. تابع ساخت آدرس هدف پروکسی
const buildTargetUrl = (targetDomain, requestPath, queryString) => {
  if (targetDomain.startsWith('http://') || targetDomain.startsWith('https://')) {
    return `${targetDomain}${requestPath}${queryString}`;
  }
  const useHttps = !targetDomain.includes(':') || targetDomain.includes(':443') || /^s\d+\./.test(targetDomain);
  return `${useHttps ? 'https://' : 'http://'}${targetDomain}${requestPath}${queryString}`;
};

// ۴. تابع پاک‌سازی هدرهای ورودی
const sanitizeHeaders = (incomingHeaders) => {
  const cleanHeaders = new Headers();
  let realClientIp = null;

  incomingHeaders.forEach((value, key) => {
    const lowerKey = key.toLowerCase();

    if (RESTRICTED_HEADERS.has(lowerKey) || 
        lowerKey.startsWith("x-nf-") || 
        lowerKey.startsWith("x-netlify-") || 
        lowerKey === "x-host") {
      return;
    }

    if (lowerKey === "x-real-ip" || (lowerKey === "x-forwarded-for" && !realClientIp)) {
      realClientIp = value;
      return;
    }

    cleanHeaders.set(lowerKey, value);
  });

  if (realClientIp) {
    cleanHeaders.set("x-forwarded-for", realClientIp);
  }

  return { cleanHeaders };
};

// ۵. هندلر اصلی Deno Deploy بدون وابستگی خارجی
Deno.serve(async (request) => {
  try {
    const url = new URL(request.url);
    const targetHost = request.headers.get("x-host");

    // اگر کاربر مستقیم وارد سایت شد یا هدر مقصد ست نشده بود، بازی مار لود می‌شود
    if (!targetHost || ((url.pathname === "/" || url.pathname === "/index.html") && !targetHost)) {
      const upgradeHeader = (request.headers.get("upgrade") || "").toLowerCase();
      if (upgradeHeader !== "websocket") {
        return new Response(HTML_FRONTEND, {
          status: 200,
          headers: { 
            "content-type": "text/html; charset=UTF-8",
            "X-Powered-By": "AetherLink-Deno-Edge-Arcade/2.0"
          },
        });
      }
    }

    // ساخت آدرس مقصد و تمیزکاری هدرها
    const destinationUrl = buildTargetUrl(targetHost, url.pathname, url.search);
    const { cleanHeaders } = sanitizeHeaders(request.headers);

    const fetchOptions = {
      method: request.method,
      headers: cleanHeaders,
      redirect: "manual",
      body: (request.method === "GET" || request.method === "HEAD") ? undefined : request.body,
    };

    // فوروارد کردن درخواست به مقصد
    const backendResponse = await fetch(destinationUrl, fetchOptions);
    
    // کپی کردن هدرهای پاسخ مقصد
    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        responseHeaders.set(key, value);
      }
    });

    responseHeaders.set("X-Powered-By", "AetherLink Deno Edge Proxy");
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });

  } catch (error) {
    // در صورت بروز هرگونه خطای داخلی، مجدداً بازی برای کاربر لود می‌شود تا خطای کد افشا نشود
    return new Response(HTML_FRONTEND, {
      status: 200,
      headers: { "content-type": "text/html; charset=UTF-8" }
    });
  }
});
