const express = require("express");
const router = express.Router();

const {
  getAllBotStatus,
  getBotStatus,
  reconnectBot
} = require("../whatsappClients");

const botNames = ["bot1", "bot2"];

const validateBotName = (botName) => botNames.includes(botName);

router.get("/status", async (req, res) => {
  try {
    return res.json({
      success: true,
      data: getAllBotStatus()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get WhatsApp bot status"
    });
  }
});

router.get("/status/:botName", async (req, res) => {
  const { botName } = req.params;

  if (!validateBotName(botName)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bot name"
    });
  }

  try {
    return res.json({
      success: true,
      data: getBotStatus(botName)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get bot details"
    });
  }
});

router.get("/qr/:botName", async (req, res) => {
  const { botName } = req.params;

  if (!validateBotName(botName)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bot name"
    });
  }

  try {
    const status = getBotStatus(botName);
    return res.json({
      success: true,
      data: {
        botName,
        qr: status.qr || null
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get QR code"
    });
  }
});

router.post("/reconnect/:botName", async (req, res) => {
  const { botName } = req.params;

  if (!validateBotName(botName)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bot name"
    });
  }

  try {
    const status = await reconnectBot(botName);
    return res.json({
      success: true,
      data: status
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reconnect bot"
    });
  }
});

module.exports = router;
