const express = require('express');
const cors = require("cors");
const connectDB = require("./config/db");
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');

const app = express();

connectDB();

app.use(express.json());

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174"
  ];
  
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
