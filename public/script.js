const socket = io();

function enterRoom() {
    const name = document.getElementById("nameInput").value.trim();
    if (!name) return;

    document.getElementById("login").classList.add("hidden");

    if (name === "管理人") {
        document.getElementById("adminMenu").classList.remove("hidden");
    } else {
        document.getElementById("room").classList.remove("hidden");
        document.getElementById("userName").innerText = name;
    }
}

function incrementCount() {
    let name = document.getElementById("userName").innerText;
    socket.emit("click", name);
}

socket.on("updateCount", (data) => {
    let total = data.reduce((sum, row) => sum + row.count, 0);
    document.getElementById("countDisplay").innerText = "合計回数: " + total;

    let userList = document.getElementById("userCounts");
    userList.innerHTML = "";
    data.forEach((row) => {
        let li = document.createElement("li");
        li.innerText = `${row.name}: ${row.count}回`;
        userList.appendChild(li);
    });
});

function resetAll() {
    socket.emit("resetAll");
}

function resetUser() {
    const selectedName = document.getElementById("userSelect").value;
    if (selectedName) {
        socket.emit("resetUser", selectedName);
    }
}

// ユーザー一覧の更新時に、セレクトボックスも更新
socket.on("updateCount", (data) => {
    // ... 既存の更新処理 ...

    // セレクトボックス更新
    const userSelect = document.getElementById("userSelect");
    userSelect.innerHTML = "";
    data.forEach((row) => {
        let option = document.createElement("option");
        option.value = row.name;
        option.text = row.name;
        userSelect.appendChild(option);
    });
});