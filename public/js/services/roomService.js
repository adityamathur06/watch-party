import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


import { db } from "../config/firebase.js";

function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
}

export async function createRoom({ userId, userName, type }) {
    const roomId = generateRoomCode();

    const roomRef = doc(db, "rooms", roomId);

    await setDoc(roomRef, {
        roomId,
        type,
        hostId: userId,
        createdAt: serverTimestamp(),
        isActive: true,
        memberCount: 1
    });

    const memberRef = doc(db, "rooms", roomId, "members", userId);

    await setDoc(memberRef, {
        userId,
        name: userName,
        role: "host",
        joinedAt: serverTimestamp()
    });

    return roomId;
}

export async function joinRoom({ roomId, userId, userName }) {
    const roomRef = doc(db, "rooms", roomId);

    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
        throw new Error("Room does not exist");
    }

    const roomData = roomSnap.data();
    if (!roomData.isActive) {
        throw new Error("Room is closed");
    }

    const memberRef = doc(db, "rooms", roomId, "members", userId);
    await setDoc(memberRef, {
        userId,
        name: userName,
        role: "member",
        joinedAt: serverTimestamp()
    });

    await updateDoc(roomRef, {
        memberCount: increment(1)
    });

    return true;
}


export async function activateRoom(roomId) {
  const roomRef = doc(db, "rooms", roomId);

  await updateDoc(roomRef, {
    status: "active"
  });
}
