import app from "./src/app.js";
import os from "os";

const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  const ip = getLocalIP();

  if (process.env.NODE_ENV === "production") {
    console.log(`Server running at https://yourdomain.com`);
  } else {
    console.log(`  Local:   http://localhost:${PORT}`);
    console.log(`  Network: http://${ip}:${PORT}`);
  }
});
