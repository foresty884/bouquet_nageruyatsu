const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.static("public"));

// データベース接続
const db = new sqlite3.Database("database.db", (err) => {
    if (err) console.error(err.message);
    db.run("CREATE TABLE IF NOT EXISTS counts (name TEXT PRIMARY KEY, count INTEGER)");
});

// WebSocket処理
io.on("connection", (socket) => {
    // 初期データ送信
    db.all("SELECT * FROM counts", (err, rows) => {
        if (!err) socket.emit("updateCount", rows);
    });

    socket.on("click", (name) => {
        db.run("INSERT INTO counts (name, count) VALUES (?, 1) ON CONFLICT(name) DO UPDATE SET count = count + 1", [name]);
        updateClients();
    });

    socket.on("resetAll", () => {
        db.run("DELETE FROM counts", () => updateClients());
    });

    socket.on("resetUser", (name) => {
        db.run("DELETE FROM counts WHERE name = ?", [name], () => updateClients());
    });    

    function updateClients() {
        db.all("SELECT * FROM counts", (err, rows) => {
            if (!err) io.emit("updateCount", rows);
        });
    }
});

server.listen(5000, () => console.log("Server running on port 5000"));