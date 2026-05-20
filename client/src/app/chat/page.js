"use client";

import { useEffect } from "react";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";

let socket;

export default function ChatPage() {

  useEffect(() => {

    socket = io(ENDPOINT);

    // Listen FIRST
    socket.on("connected", () => {
      console.log("Socket Connected");
    });

    // Then emit
    socket.emit("setup", {
      _id: "6a0da833772ffadc2ad0db90",
    });

  }, []);

  return (
    <div>
      Chat Page
    </div>
  );
}