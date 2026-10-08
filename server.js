import "dotenv/config";
import app from "./src/app.js";
import { prisma } from "./src/config/prisma.js";
import os from "os";

const port = Number(process.env.PORT || 3000);

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const nets of Object.values(interfaces)) {
    for (const net of nets) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
};

const server = app.listen(port, () => {
  const ip = getLocalIP();
  console.log(`  Local:   http://localhost:${port}`);
  console.log(`  Network: http://${ip}:${port}`);
});

async function shutdown(signal) {
  console.info(`${signal} received; shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
