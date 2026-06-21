
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const isWhatsAppEnabled = process.env.ENABLE_WHATSAPP !== 'false';
const isRender = process.env.RENDER === 'true';
const sessionBaseDir = process.env.WHATSAPP_SESSION_DIR || path.join(__dirname, '.whatsapp_sessions');

process.env.PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';
console.log('Chrome path:', puppeteer.executablePath());

// Helper to recursively locate the chrome binary in a directory
function findChromeExecutable() {

}

const puppeteerExecutablePath = findChromeExecutable();

const botState = {
  bot1: {
    ready: false,
    connected: false,
    qr: null,
    error: null,
    reconnecting: false,
    lastUpdated: null
  },
  bot2: {
    ready: false,
    connected: false,
    qr: null,
    error: null,
    reconnecting: false,
    lastUpdated: null
  }
};

// Store clients
const clients = {
  bot1: null,
  bot2: null
};

// Store ready status
const ready = {
  bot1: false,
  bot2: false
};

function updateBotState(name, updates) {
  botState[name] = {
    ...botState[name],
    ...updates,
    lastUpdated: new Date().toISOString()
  };
}

function getBotStatus(name) {
  return {
    botName: name,
    ready: ready[name] || false,
    connected: ready[name] || false,
    qr: botState[name].qr || null,
    error: botState[name].error || null,
    reconnecting: botState[name].reconnecting || false,
    lastUpdated: botState[name].lastUpdated
  };
}

function getAllBotStatus() {
  return {
    bot1: getBotStatus('bot1'),
    bot2: getBotStatus('bot2')
  };
}

async function reconnectBot(name) {
  if (!clients[name]) {
    throw new Error(`${name} is not initialized`);
  }

  updateBotState(name, {
    reconnecting: true,
    error: null
  });

  try {
    await clients[name].initialize();
    return getBotStatus(name);
  } catch (error) {
    updateBotState(name, {
      reconnecting: false,
      error: error.message || String(error)
    });
    throw error;
  }
}

// Helper: initialize a client
function initClient(name, dataPath) {
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath }),
    puppeteer: {
      headless: true,
      executablePath: puppeteer.executablePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    }
  });

  client.on('qr', (qr) => {
    console.log(`\n📱 [${name}] Scan this QR with WhatsApp:`);
    qrcode.generate(qr, { small: true });
    updateBotState(name, {
      qr,
      error: null,
      reconnecting: false
    });
  });

  client.on('ready', () => {
    console.log(`✅ [${name}] is ready`);
    ready[name] = true;
    updateBotState(name, {
      ready: true,
      connected: true,
      qr: null,
      error: null,
      reconnecting: false
    });
  });

  client.on('auth_failure', (msg) => {
    console.error(`❌ [${name}] Auth failed:`, msg);
    ready[name] = false;
    updateBotState(name, {
      ready: false,
      connected: false,
      error: msg,
      reconnecting: false
    });
  });

  client.on('disconnected', (reason) => {
    console.warn(`⚠️ [${name}] Disconnected:`, reason);
    ready[name] = false;
    updateBotState(name, {
      ready: false,
      connected: false,
      error: reason,
      reconnecting: false
    });
  });

  client.on('error', (error) => {
    console.error(`❌ [${name}] Client error:`, error);
    ready[name] = false;
    updateBotState(name, {
      ready: false,
      connected: false,
      error: error.message || String(error),
      reconnecting: false
    });
  });

  client.initialize().catch((error) => {
    console.error(`❌ [${name}] Failed to initialize WhatsApp client:`, error.message || error);
    ready[name] = false;
    updateBotState(name, {
      ready: false,
      connected: false,
      error: error.message || String(error),
      reconnecting: false
    });
  });

  return client;
}

if (isWhatsAppEnabled) {
  console.log('📱 WhatsApp bots enabled');
  if (puppeteer.executablePath()) {
    console.log(`📍 Using Chrome: ${puppeteer.executablePath()}`);
  }

  const botSessionPaths = {
    bot1: path.join(sessionBaseDir, 'bot1'),
    bot2: path.join(sessionBaseDir, 'bot2')
  };

  Object.entries(botSessionPaths).forEach(([botName, sessionPath]) => {
    fs.mkdirSync(sessionPath, { recursive: true });

    if (process.env.RESET_WHATSAPP_SESSIONS === 'true') {
      try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        fs.mkdirSync(sessionPath, { recursive: true });
        console.log(`🧹 Reset WhatsApp session folder for ${botName}: ${sessionPath}`);
      } catch (cleanupError) {
        console.warn(`⚠️ Failed to reset session folder for ${botName}:`, cleanupError.message);
      }
    }
  });

  // Initialize both bots using clean runtime session folders
  clients.bot1 = initClient('bot1', botSessionPaths.bot1);
  clients.bot2 = initClient('bot2', botSessionPaths.bot2);
} else {
  console.log('📱 WhatsApp bots disabled by ENABLE_WHATSAPP=false');
}

// Function to send a message using a specific bot
async function sendMessage(botName, toPhone, message) {
  const client = clients[botName];
  if (!client || !ready[botName]) {
    throw new Error(`${botName} is not ready`);
  }
  const formattedNumber = `${toPhone}@c.us`;
  await client.sendMessage(formattedNumber, message);
}

// Get which bot to use (you can implement round-robin or based on phone prefix)
function selectBot(phoneNumber) {
  // Simple: always use bot1 for sending OTPs
  // You can change to bot2 if bot1 is busy or for testing
  return 'bot1';
}

module.exports = {
  sendMessage,
  selectBot,
  ready,
  clients,
  getBotStatus,
  getAllBotStatus,
  reconnectBot
};