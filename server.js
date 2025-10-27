// server.js
import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// ==== BU JOYNI O'ZGARTIRING ====
const GMAIL_USER = "ozodabahodirova509@gmail.com"; // sizning Gmail
const GMAIL_APP_PASS = "qbli hyam pkni yylb"; // Google app password
// ===============================

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // contact.html shu yerdan yuklanadi

// Nodemailer sozlamalari
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS },
});

// Test email yuborish (faqat server ishga tushganda)
(async () => {
  try {
    const info = await transporter.sendMail({
      from: `"Healvia Server" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject: "✅ Healvia Server ishga tushdi!",
      text: "Server muvaffaqiyatli ishga tushdi.",
    });
    console.log("✅ Test xabar yuborildi:", info.response);
  } catch (err) {
    console.error("❌ Test email yuborishda xatolik:", err.message);
  }
})();

// === Contact form endpoint ===
app.post("/send-message", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Barcha maydonlarni to'ldiring." });
    }

    // 💌 Sizga keladigan email (adminga)
    await transporter.sendMail({
      from: `"Healvia Contact" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject: `📩 Yangi xabar: ${name}`,
      html: `
        <h2>Yangi xabar</h2>
        <p><b>Ism:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Xabar:</b><br>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // 💬 Javob sifatida foydalanuvchiga tasdiq emaili
    await transporter.sendMail({
      from: `"Healvia" <${GMAIL_USER}>`,
      to: email,
      subject: `Xabaringiz uchun rahmat!`,
      text: `Salom ${name},\nSizning xabaringizni oldik. Tez orada siz bilan bog'lanamiz.\n\n— Healvia jamoasi`,
    });

    console.log(`📨 Yangi xabar yuborildi: ${name} (${email})`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ send-message xato:", err.message);
    res.status(500).json({ success: false, error: "Email yuborishda xatolik yuz berdi." });
  }
});

app.listen(PORT, () => console.log(`✅ Healvia AI server ${PORT}-portda ishlayapti`));
