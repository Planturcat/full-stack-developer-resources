// Simple Node.js application for Docker demonstration
const http = require('http');
const os = require('os');

const port = process.env.PORT || 3000;
const hostname = os.hostname();

const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: timestamp,
      hostname: hostname,
      uptime: process.uptime()
    }));
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hello Docker!</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px; 
          background-color: #f0f0f0; 
        }
        .container { 
          background: white; 
          padding: 20px; 
          border-radius: 8px; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .info { 
          background: #e3f2fd; 
          padding: 10px; 
          border-radius: 4px; 
          margin: 10px 0; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🐳 Hello from Docker!</h1>
        <p>This is a simple Node.js application running in a Docker container.</p>
        
        <div class="info">
          <h3>Container Information:</h3>
          <ul>
            <li><strong>Hostname:</strong> ${hostname}</li>
            <li><strong>Timestamp:</strong> ${timestamp}</li>
            <li><strong>Node.js Version:</strong> ${process.version}</li>
            <li><strong>Platform:</strong> ${process.platform}</li>
            <li><strong>Architecture:</strong> ${process.arch}</li>
            <li><strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds</li>
          </ul>
        </div>
        
        <div class="info">
          <h3>Environment Variables:</h3>
          <ul>
            <li><strong>NODE_ENV:</strong> ${process.env.NODE_ENV || 'not set'}</li>
            <li><strong>PORT:</strong> ${port}</li>
          </ul>
        </div>
        
        <p>
          <a href="/health">Health Check Endpoint</a>
        </p>
      </div>
    </body>
    </html>
  `);
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log(`Container hostname: ${hostname}`);
  console.log(`Node.js version: ${process.version}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
