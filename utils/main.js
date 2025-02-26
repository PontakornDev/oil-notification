require("dotenv").config();
const oilType = require("../oil-type.json");
const axios = require("axios");
const nodemailer = require("nodemailer");

let lastPrice = {}; // เก็บราคาน้ำมันล่าสุดที่เคยแจ้งเตือน

// ดึงข้อมูลราคาน้ำมัน
async function getOilPrice() {
  try {
    const response = await axios.get(process.env.OIL_API_URL);
    return response;
  } catch (error) {
    console.error("❌ Error fetching oil price:", error);
    return null;
  }
}

// ส่ง Email แจ้งเตือน
async function sendEmail(subject, body) {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: `"Oil Price Notifier" <${process.env.EMAIL_SENDER}>`,
    to: process.env.EMAIL_RECIPIENT,
    subject: subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

// ตรวจสอบราคาน้ำมัน และส่งแจ้งเตือนเมื่อมีการเปลี่ยนแปลง
async function checkOilPrice() {
  console.log("🔍 Checking oil price...");

  const prices = await getOilPrice();
  if (!prices) return;

  let message = "📢 ราคาน้ำมันไทยล่าสุด:\n";
  let hasChange = false;
  let pttData = prices.data.response.stations.ptt;

  oilType.map((type, i) => {
    let newPrice = pttData[type].price;
    let oldPrice = lastPrice[type] || 0;
    if (+newPrice !== +oldPrice) {
      hasChange = true;
      let trend = newPrice > oldPrice ? "🔺 ขึ้น" : "🟢 ลง";
      message += `${i + 1}. ${
        pttData[type].name
      }: ${newPrice} บาท/ลิตร (${trend})\n`;
    }

    lastPrice[type] = newPrice; // อัปเดตราคาล่าสุด
  });

  if (hasChange) {
    await sendEmail("📢 แจ้งเตือนราคาน้ำมันเปลี่ยนแปลง", message);
  } else {
    console.log("✅ ราคาน้ำมันไม่มีการเปลี่ยนแปลง");
  }
}

module.exports = {
  getOilPrice,
  sendEmail,
  checkOilPrice,
};
