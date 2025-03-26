import React, { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import "../Chat.css";
import { firestore } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  onSnapshot,
  collectionGroup
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

export default function Messages() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const messageEndRef = useRef(null);
  const statsDocRef = doc(firestore, "statistics", "default");
  const [stats, setStats] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);

  // Get the authenticated user from AuthContext
  const { user } = useAuth();

  // Listen for chat messages from all "chat" subcollections
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "globalChat"),
      (snapshot) => {
        const allMessages = snapshot.docs
          .map((doc) => doc.data())
          .sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());
        setMessages(allMessages);
      }
    );
    return () => unsubscribe();
  }, []);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When the leaderboard is visible, fetch stats and group coins
  useEffect(() => {
    if (isLeaderboardVisible) {
      handleReceive();
    }
  }, [isLeaderboardVisible]);

  const handleReceive = async () => {
    try {
      // Fetch total study time
      const docSnap = await getDoc(statsDocRef);
      if (docSnap.exists()) {
        const currentStats = docSnap.data().totalTimeStudied || 0;
        setStats(currentStats);
      } else {
        console.error("No such document in statistics!");
      }
      // Fetch total group coins from "coins/default"
      const coinsDocRef = doc(firestore, "coins", "default");
      const coinsDocSnap = await getDoc(coinsDocRef);
      if (coinsDocSnap.exists()) {
        const groupCoins = coinsDocSnap.data().coins || 0;
        setTotalCoins(groupCoins);
      } else {
        console.error("No such document in coins!");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Send message on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleSend = async () => {
    console.log("handleSend triggered, input:", input);
    console.log("Current user:", user);
    if (!input || !user) return;
    const messageData = {
      sender: user.uid,
      messageID: Date.now().toString(),
      message: input,
      timestamp: new Date()
    };
    try {
      // Save the message under the globalChat collection
      await addDoc(collection(firestore, "globalChat"), messageData);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-container enhanced">
      {isLeaderboardVisible ? (
        <div
          className="leaderboard-page"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "45vh",
            width: "100%",
            background: "linear-gradient(135deg, #1ba494 0%, #0e7467 100%)",
            color: "white",
            textAlign: "center",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "10px",
              textAlign: "center",
              marginRight: "40px"
            }}
          >
            🏆 Overall Group Statistics!
          </h2>
          {/* Stats Cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              maxWidth: "400px",
              flexGrow: 1,
              marginRight: "40px"
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "1.1rem",
                textAlign: "center",
                width: "100%",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.2)"
              }}
            >
              ⏳ <strong>Collective Time Studied:</strong> {stats} mins
            </div>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "1.1rem",
                textAlign: "center",
                width: "100%",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.2)"
              }}
            >
              💰 <strong>Total Coins Earned:</strong> {totalCoins}
            </div>
          </div>
          {/* Back Button */}
          <Button
            onClick={() => setIsLeaderboardVisible(false)}
            sx={{
              backgroundColor: "#FF9800",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              mt: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
              "&:hover": { backgroundColor: "#e68900" },
              marginRight: "40px"
            }}
          >
            Back 🔙
          </Button>
        </div>
      ) : (
        <>
          <h2 className="chat-title">Chat (User {user ? user.uid : "Unknown"})</h2>
          <div className="chat-box">
            {messages.map((msg, index) => {
              const isMe = String(msg.sender) === String(user?.uid);
              const displayMessage =
                typeof msg.message === "object"
                  ? msg.message.text || msg.message.message || JSON.stringify(msg.message)
                  : msg.message;
              return (
                <div key={index} className={`chat-bubble ${isMe ? "sent" : "received"}`}>
                  {!isMe && <strong className="sender">User {msg.sender}</strong>}
                  <p className="message">{displayMessage}</p>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
          {/* Input row */}
          <div className="chat-input-container" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="chat-input"
            />
            <Tooltip title="View Leaderboard">
              <IconButton
                sx={{
                  backgroundColor: "#e5c185",
                  color: "#FFFFFF",
                  margin: "0 auto",
                  "&:hover": { backgroundColor: "#deae9f" }
                }}
                onClick={() => setIsLeaderboardVisible(true)}
              >
                <LeaderboardIcon />
              </IconButton>
            </Tooltip>
            <button onClick={handleSend} className="send-button">
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}