const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { exec } = require('child_process');
const os = require('os');

const dev = false; // Production mode
const hostname = '0.0.0.0'; // Listen on all network interfaces
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Open browser after server starts
function openBrowser(url) {
  const start = process.platform === 'darwin' ? 'open' : 
                process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${start} ${url}`);
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    
    const localIP = getLocalIP();
    
    console.log('\n🍽️  Restaurant POS System Started Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 Access on this computer:');
    console.log(`   http://localhost:${port}`);
    console.log('\n📱 Access from other devices (tablets/phones):');
    console.log(`   http://${localIP}:${port}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✨ Server is ready! Browser will open automatically...\n');
    console.log('⚠️  Keep this window open while using the POS system');
    console.log('   To stop: Press Ctrl+C\n');
    
    // Open browser after 2 seconds
    setTimeout(() => {
      openBrowser(`http://localhost:${port}`);
    }, 2000);
  });
});
