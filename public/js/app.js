import { onAuthChange, logout } from "./services/authService.js";
import { getUserProfile } from "./services/userService.js";
import { createRoom } from "./services/roomService.js";
import { joinRoom } from "./services/roomService.js";


let currentUser = null;
let currentUserName = null;
let currentRoomId = null;

const userName = document.getElementById("user-name")

onAuthChange(async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    try {
        const profile = await getUserProfile(user.uid);
        currentUser = user;
        currentUserName = profile.name;

        if (profile && profile.name) {
            userName.textContent = `Hi, ${profile.name}`
        }
    } catch (error) {
        console.error(`Error displaying user's name ${error}`)
    }
});

const userTrigger = document.getElementById("user-trigger");
const dropdown = document.getElementById("user-dropdown");
const logoutBtn = document.getElementById("logout-btn");

userTrigger.addEventListener("click", () => {
    dropdown.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
    if (!userTrigger.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
    }
});

logoutBtn.addEventListener("click", async () => {
    try {
        await logout();
        window.location.href = "index.html";
    } catch (err) {
        console.error("Logout failed:", err);
    }
});


const createRoomBtn = document.getElementById("create-room-btn");
const chatRoomBtn = document.getElementById("chat-room-btn")
const roomOverlay = document.getElementById("room-overlay");
const roomTypeModal = document.getElementById("room-type-modal");
const roomCodeModal = document.getElementById("room-code-modal");
const roomCloseBtns = roomOverlay.querySelectorAll(".close-btn");
const joinRoomBtn = document.getElementById("join-room-btn");
const joinRoomModal = document.getElementById("join-room-modal");
const joinRoomForm = document.querySelector("#join-room-modal form");
const roomCodeInput = document.querySelector(".room-code-input");

function hideRoomModals() {
    roomTypeModal.classList.add("hidden");
    roomCodeModal.classList.add("hidden");
    joinRoomModal.classList.add("hidden");
}


function openRoomModal(modal) {
    hideRoomModals();
    roomOverlay.classList.add("active");
    modal.classList.remove("hidden");
}

function closeRoomOverlay() {
    hideRoomModals();
    roomOverlay.classList.remove("active");
}


createRoomBtn.addEventListener("click", () => {
    openRoomModal(roomTypeModal);
});

roomCloseBtns.forEach((btn) => {
    btn.addEventListener("click", closeRoomOverlay);
});

roomOverlay.addEventListener("click", (e) => {
    if (e.target === roomOverlay) {
        closeRoomOverlay();
    }
});

chatRoomBtn.addEventListener("click", async () => {
    try {
        const roomId = await createRoom({
            userId: currentUser.uid,
            userName: currentUserName,
            type: "chat"
        });
        currentRoomId = roomId;

        document.querySelector(".room-code").textContent = roomId;
        openRoomModal(roomCodeModal);

    } catch (err) {
        console.error("Failed to create room:", err);
        alert("Could not create room. Please try again.");
    }
});

const joinRoomError = document.getElementById("join-room-error");

function resetJoinRoomError() {
    joinRoomError.textContent = "";
    joinRoomError.style.display = "none";
}

joinRoomBtn.addEventListener("click", () => {
    openRoomModal(joinRoomModal);
    resetJoinRoomError()
});

const copyRoomCodeBtn = document.getElementById("copy-room-code-btn");

copyRoomCodeBtn.addEventListener("click", async () => {
    const roomCode = document.querySelector(".room-code").textContent;

    try {
        await navigator.clipboard.writeText(roomCode);
        copyRoomCodeBtn.textContent = "Copied!";

        setTimeout(() => {
            copyRoomCodeBtn.textContent = "Copy";
        }, 1500);

    } catch (err) {
        console.error("Failed to copy room code:", err);
        alert("Could not copy code. Please copy manually.");
    }
});

joinRoomForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const roomId = roomCodeInput.value.trim().toUpperCase();
    if (!roomId) return;

    resetJoinRoomError();

    try {
        await joinRoom({
            roomId,
            userId: currentUser.uid,
            userName: currentUserName
        });
        window.location.href = `room.html?room=${roomId}`;

    } catch (err) {
        console.error(err);

        if (
            err.code === "permission-denied" ||
            err.message.toLowerCase().includes("permission")
        ) {
            joinRoomError.textContent =
                "This room is full (maximum 4 members allowed).";
        } else {
            joinRoomError.textContent = err.message || "Failed to join room.";
        }

        joinRoomError.style.display = "block";
    }
});


const goToRoomBtn = document.getElementById("go-to-room-btn");

goToRoomBtn.addEventListener("click", () => {
    if (!currentRoomId) {
        alert("Room not found.");
        return;
    }

    window.location.href = `room.html?room=${currentRoomId}`;
});