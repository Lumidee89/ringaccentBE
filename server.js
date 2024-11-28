const express = require("express");
const { json } = require("express");
const cors = require("cors");
const http = require('http');
const connectDB = require("./config/db.js");
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const audioRoutes = require('./routes/audioRoutes');
const WebSocket = require('ws');
const { handleWebSocketConnection } = require('./controllers/audioController');
const app = express();
const dotenv = require("dotenv");
dotenv.config();

connectDB();

app.use(json());

app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


// const allowedOrigins = [
//     "http://localhost:5173",
//     // "http://localhost:5174"
//   ];
  
//   app.use(
//     cors({
//       origin: (origin, callback) => {
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.includes(origin)) {
//           callback(null, true);
//         } else {
//           callback(new Error("Not allowed by CORS"));
//         }
//       },
//       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//       allowedHeaders: ["Content-Type", "Authorization"],
//       credentials: true,
//     })
//   );

app.use('/api/auth', authRoutes);
app.use('/api/audio', audioRoutes);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => { handleWebSocketConnection(ws); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
