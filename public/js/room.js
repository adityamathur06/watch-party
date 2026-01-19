import {
    doc,
    collection,
    onSnapshot,
    deleteDoc,
    updateDoc,
    getDoc,
    increment,
    addDoc,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { auth } from "./config/firebase.js";
import { db } from "./config/firebase.js";

let currentUser = null;
let currentUserName = "User";
let roomHostId = null;
let isInRoom = true;
let membersListening = false;

const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

if (!roomId) {
    alert("Invalid room");
    window.location.href = "app.html";
}

const membersList = document.getElementById("members-list");
const roomLayout = document.querySelector(".room-layout");
const toggleMembersBtn = document.getElementById("toggleMembers");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = chatInput.value.trim();
    if (!text || !currentUser) return;

    await addDoc(
        collection(db, "rooms", roomId, "messages"),
        {
            text,
            senderId: currentUser.uid,
            senderName: currentUserName,
            createdAt: serverTimestamp(),
        }
    );

    chatInput.value = "";
});

function listenToMessages() {
    const messagesRef = collection(db, "rooms", roomId, "messages");
    const q = query(messagesRef, orderBy("createdAt"));

    onSnapshot(q, (snapshot) => {
        chatMessages.innerHTML = "";

        snapshot.forEach((docSnap) => {
            const msg = docSnap.data();
            if (!msg.text) return;

            const div = document.createElement("div");
            div.classList.add("chat-message");

            if (msg.senderId === currentUser.uid) {
                div.classList.add("own");
            }

            div.innerHTML = `
            <div class="message-content">
                <span class="sender">${msg.senderName}</span>
                <div class="bubble">${msg.text}</div>
            </div>
            `;

            chatMessages.appendChild(div);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}


onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    currentUser = user;
    initializeRoom();
});


function initializeRoom() {
    const roomRef = doc(db, "rooms", roomId);

    onSnapshot(roomRef, (snapshot) => {
        if (!snapshot.exists()) {
            if (isInRoom) {
                alert("Host has left the room. Room closed.");
                isInRoom = false;
                window.location.href = "app.html";
            }
            return;
        }

        const roomData = snapshot.data();
        roomHostId = roomData.hostId;

        if (!membersListening) {
            listenToMembers();
            membersListening = true;
        }
    });

    listenToMessages();
}

function listenToMembers() {
    const membersRef = collection(db, "rooms", roomId, "members");

    onSnapshot(membersRef, (snapshot) => {
        membersList.innerHTML = "";

        snapshot.forEach((docSnap) => {
            const member = docSnap.data();
            if (!member || !member.userId || !member.name) return;

            if (member.userId === currentUser.uid) {
                currentUserName = member.name;
            }

            const li = document.createElement("li");

            if (member.userId === roomHostId) {
                li.textContent = `${member.name} (Host)`;
                li.classList.add("host");
            } else {
                li.textContent = member.name;
            }

            membersList.appendChild(li);
        });
    });
}

if (toggleMembersBtn && roomLayout) {
    toggleMembersBtn.addEventListener("click", () => {
        roomLayout.classList.toggle("sidebar-collapsed");
    });
}

async function leaveRoom() {
    if (!currentUser || !roomId || !isInRoom) return;

    isInRoom = false;

    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        window.location.href = "app.html";
        return;
    }

    const roomData = roomSnap.data();

    if (roomData.hostId === currentUser.uid) {
        await deleteDoc(roomRef);
        window.location.href = "app.html";
        return;
    }

    const memberRef = doc(db, "rooms", roomId, "members", currentUser.uid);
    await deleteDoc(memberRef);

    await updateDoc(roomRef, {
        memberCount: increment(-1),
    });

    window.location.href = "app.html";
}


if (leaveRoomBtn) {
    leaveRoomBtn.addEventListener("click", leaveRoom);
}