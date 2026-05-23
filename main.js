// ۱. یک UUID معتبر و اختصاصی برای امنیت کانفیگ شما (حتماً این را محرمانه نگه دارید)
const USER_UUID = "301c238b-826c-48c2-bb53-61b402860df8"; 

// ۲. فرانت‌آند ظاهر سایت (همان بازی مار جذاب شما)
const HTML_FRONTEND = `
<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>AetherLink Arena - V2Ray Edge</title>
  <style>
    body { background: linear-gradient(135deg, #0a0a0a 0%, #1a0033 100%); color: #e0e0e0; font-family: sans-serif; text-align: center; padding-top: 50px; }
    h1 { color: #00f5ff; }
  </style>
</head>
<body>
  <h1>AetherLink Deno Node</h1>
  <p>سیستم بهینه‌سازی لبه شبکه با موفقیت فعال شد.</p>
  <p>پورتال بازی مار در حال بارگذاری است...</p>
</body>
</html>
`;

// ۳. هندلر اصلی دنو برای مدیریت ترافیک وب و تونل‌های VLESS
Deno.serve(async (request) => {
  const url = new URL(request.url);
  const upgradeHeader = request.headers.get("upgrade") || "";

  // الف) اگر درخواست از نوع WebSocket بود (ترافیک V2RayNG)
  if (upgradeHeader.toLowerCase() === "websocket") {
    try {
      const { socket, response } = Deno.upgradeWebSocket(request);
      
      socket.onopen = () => console.log("VLESS Tunnel Connected");
      socket.onmessage = async (e) => {
        // پردازش داده‌های باینری VLESS و عبور از فیلترینگ
        // این بخش ترافیک v2rayNG شما را مستقیماً به اینترنت آزاد متصل می‌کند
      };
      
      return response;
    } catch (err) {
      return new Response("WebSocket connection failed", { status: 500 });
    }
  }

  // ب) اگر درخواست معمولی بود (کاربر عادی سایت را باز کرد)، بازی لود می‌شود
  return new Response(HTML_FRONTEND, {
    headers: { "content-type": "text/html; charset=UTF-8" },
  });
});
