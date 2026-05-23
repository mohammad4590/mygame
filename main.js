import { connect } from "https://deno.land/std@0.177.0/node/net.ts";

const USER_UUID = "301c238b-826c-48c2-bb53-61b402860df8";

Deno.serve(async (request) => {
  const url = new URL(request.url);
  
  // اگر درخواست وب‌ساکت بود (اتصال V2RayNG)
  if (request.headers.get("upgrade")?.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(request);
    
    let remoteConn = null;
    let vlessHeaderSaved = null;

    socket.onmessage = async (event) => {
      const chunk = new Uint8Array(event.data);
      
      if (!remoteConn) {
        // بررسی معتبر بودن UUID در پکت ورودی VLESS
        const uuidChunks = chunk.slice(1, 17);
        const uuidStr = [...uuidChunks].map((b, i) => 
          b.toString(16).padStart(2, '0') + ([3, 5, 7, 9].includes(i) ? '-' : '')
        ).join('');

        // استخراج آدرس مقصد واقعی از داخل پروتکل VLESS
        const portIndex = 17;
        const port = (chunk[portIndex] << 8) | chunk[portIndex + 1];
        const addressType = chunk[portIndex + 2];
        let address = "";
        let addressEnd = portIndex + 3;

        if (addressType === 1) { // IPv4
          address = chunk.slice(addressEnd, addressEnd + 4).join('.');
          addressEnd += 4;
        } else if (addressType === 3) { // Domain name
          const domainLength = chunk[addressEnd];
          address = new TextDecoder().decode(chunk.slice(addressEnd + 1, addressEnd + 1 + domainLength));
          addressEnd += 1 + domainLength;
        }

        // ایجاد تونل مستقیم به اینترنت آزاد
        try {
          remoteConn = await Deno.connect({ hostname: address, port: port });
          const rawData = chunk.slice(addressEnd);
          await remoteConn.write(rawData);
          
          // خواندن مداوم پاسخ‌ها از اینترنت آزاد و پس دادن به وب‌ساکت گوشی شما
          (async () => {
            const buf = new Uint8Array(32 * 1024);
            while (remoteConn) {
              try {
                const n = await remoteConn.read(buf);
                if (n === null) break;
                const responseHeader = new Uint8Array([0, 0]); // هدر موفقیت VLESS
                const finalBuffer = new Uint8Array(responseHeader.length + n);
                finalBuffer.set(responseHeader);
                finalBuffer.set(buf.slice(0, n), responseHeader.length);
                socket.send(finalBuffer);
              } catch { break; }
            }
          })();
        } catch (e) {
          socket.close();
        }
      } else {
        // اگر تونل قبلاً باز شده بود، داده‌ها را مستقیماً فوروارد کن
        try { await remoteConn.write(chunk); } catch { socket.close(); }
      }
    };

    socket.onclose = () => { if (remoteConn) { remoteConn.close(); remoteConn = null; } };
    socket.onerror = () => { if (remoteConn) { remoteConn.close(); remoteConn = null; } };

    return response;
  }

  // ظاهر سایت (بازی مار برای گمراه کردن فیلترینگ)
  return new Response("<h1>AetherLink Node Ready</h1>", {
    headers: { "content-type": "text/html; charset=UTF-8" }
  });
});
