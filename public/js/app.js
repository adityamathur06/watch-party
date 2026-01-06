import { onAuthChange, logout } from "./services/authService.js";
import { getUserProfile } from "./services/userService.js";

const userName = document.getElementById("user-name")

onAuthChange(async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    try {
        const profile = await getUserProfile(user.uid);

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

chatRoomBtn.addEventListener("click", () => {
    openRoomModal(roomCodeModal);
});

joinRoomBtn.addEventListener("click", () => {
    openRoomModal(joinRoomModal);
});