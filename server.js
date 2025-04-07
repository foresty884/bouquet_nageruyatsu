const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Count = require("./models/Count");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.static("public"));

// MongoDB接続
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// WebSocket処理
io.on("connection", (socket) => {
    // 初期データ送信
    Count.find().then((counts) => {
        socket.emit("updateCount", counts);
    });

    socket.on("click", async (name) => {
        await Count.findOneAndUpdate(
            { name },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );
        updateClients();
    });

    socket.on("resetAll", async () => {
        await Count.deleteMany({});
        updateClients();
        
    });
    socket.on("resetUser", async (name) => {
        await Count.deleteOne({ name });
        updateClients();
    });
    async function updateClients() {
        const counts = await Count.find();
        io.emit("updateCount", counts);
    }
});

server.listen(5000, () => console.log("Server running on port 5000"));