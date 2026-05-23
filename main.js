// هدرهای مجاز برای عبور پروتکل xhttp
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"];

Deno.serve(async (request) => {
  const url = new URL(request.url);
  
  // خواندن هدر اختصاصی x-host از کانفیگ v2ray
  const targetHost = request.headers.get("x-host");

  // اگر کاربر عادی سایت را باز کرد، فرانت‌آند لود شود
  if (!targetHost) {
    return new Response("<h1>AetherLink Engine Active</h1><p>XHTTP Layer Enabled.</p>", {
      status: 200,
      headers: { "content-type": "text/html; charset=UTF-8" },
    });
  }

  try {
    // ساخت آدرس مقصد نهایی ترافیک (همان آی‌پی پشت x-host)
    const cleanHost = targetHost.trim();
    const destinationUrl = `https://${cleanHost}${url.pathname}${url.search}`;

    // کپی و تمیزکاری هدرهای ورودی از گوشی شما
    const newHeaders = new Headers();
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== "host" && lowerKey !== "x-host" && !lowerKey.startsWith("x-forwarded-")) {
        newHeaders.set(key, value);
      }
    });

    // آماده‌سازی آپشن‌های ارسال ترافیک به اینترنت آزاد
    const fetchOptions = {
      method: request.method,
      headers: newHeaders,
      redirect: "manual",
    };

    if (ALLOWED_METHODS.includes(request.method) && request.body) {
      fetchOptions.body = request.body;
    }

    // شلیک درخواست به مقصد و دریافت پاسخ
    const backendResponse = await fetch(destinationUrl, fetchOptions);

    // کپی هدرهای بازگشتی به گوشی شما
    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        responseHeaders.set(key, value);
      }
    });
    
    // هدرهای ضد فیلترینگ و دور زدن CORS
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });

  } catch (error) {
    return new Response("Edge Gateway Error: " + error.message, { status: 502 });
  }
});
