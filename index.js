require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { checkOilPrice, getOilPrice } = require("./utils/main");

const app = express();
app.use(cors());
app.use(express.json());

// API สำหรับตรวจสอบราคาน้ำมัน
const apiRouter = express.Router();
app.use("/api", apiRouter);

apiRouter.get("/", async (req, res) => {
  res.json({ message: "API is running..." });
});

apiRouter.use("/oil-price", async (req, res) => {
  checkOilPrice();
  const prices = await getOilPrice();
  if (prices) {
    return res.status(200).json(prices.data);
  } else {
    return res.status(400).json({ error: "Cannot fetch oil price" });
  }
});

app.listen(process.env.PORT, () => {
  checkOilPrice(); // รันครั้งแรกเมื่อเริ่มเซิร์ฟเวอร์
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
