import React, { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PersonIcon from "@mui/icons-material/Person";
import "../Chat.css";
import { firestore } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  onSnapshot,
  collectionGroup
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import ChangeUsername from "./changeUsername";

export default function Messages() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const [isChangeUsernameVisible, setIsChangeUsernameVisible] = useState(false);
  const messageEndRef = useRef(null);
  const statsDocRef = doc(firestore, "statistics", "default");
  const [stats, setStats] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const { user } = useAuth();

  // Listen to changes in the user's document to update the display name in real-time.
  const [displayName, setDisplayName] = useState("");
  useEffect(() => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().username) {
          setDisplayName(docSnap.data().username);
        } else {
          setDisplayName(user.uid);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Listen for chat messages from the globalChat collection
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
      const docSnap = await getDoc(statsDocRef);
      if (docSnap.exists()) {
        setStats(docSnap.data().totalTimeStudied || 0);
      } else {
        console.error("No such document in statistics!");
      }
      const coinsDocRef = doc(firestore, "coins", "default");
      const coinsDocSnap = await getDoc(coinsDocRef);
      if (coinsDocSnap.exists()) {
        setTotalCoins(coinsDocSnap.data().coins || 0);
      } else {
        console.error("No such document in coins!");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleSend = async () => {
    console.log("handleSend triggered, input:", input);
    if (!input || !user) return;
    const messageData = {
      sender: user.uid,
      username: displayName, // include the custom display name
      messageID: Date.now().toString(),
      message: input,
      timestamp: new Date()
    };
    try {
      await addDoc(collection(firestore, "globalChat"), messageData);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Conditional rendering for leaderboard and change username screens
  if (isLeaderboardVisible) {
    return (
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
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        width: "100%",
        maxWidth: "400px",
        flexGrow: 1, // ✅ Allows content to adjust dynamically within the 50vh space
        //move to the left
        marginRight: "40px",
      }}>
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          borderRadius: "12px",
          padding: "12px",
          fontSize: "1.1rem",
          textAlign: "center",
          width: "100%",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.2)"
        }}>
          ⏳ <strong>Collective Time Studied:</strong> {stats} mins
        </div>
    
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          borderRadius: "12px",
          padding: "12px",
          fontSize: "1.1rem",
          textAlign: "center",
          width: "100%",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.2)"
        }}>
          💰 <strong>Total Coins Earned:</strong> {totalCoins}
        </div>
      </div>
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
    );
  }

  if (isChangeUsernameVisible) {
    return (
      <div
        className="change-username-page"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "45vh",
          width: "100%",
          background: "linear-gradient(135deg, #e5c185 0%, #deae9f 100%)",
          color: "white",
          textAlign: "center",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"
        }}
      >
        <ChangeUsername />
        <Button
          onClick={() => setIsChangeUsernameVisible(false)}
          sx={{
            backgroundColor: "#0e7467",
            color: "#ffffff",
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: "50px",
            px: 4,
            py: 1.5,
            mt: 2,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            "&:hover": { backgroundColor: "#1ba494" }
          }}
        >
          Back 🔙
        </Button>
      </div>
    );
  }

  return (
    <div className="chat-container enhanced">
      <h2 className="chat-title">{displayName || "Unknown"}'s Chat</h2>
      <div className="chat-box">
        {messages.map((msg, index) => {
          const isMe = String(msg.sender) === String(user?.uid);
          const nameToDisplay = msg.username ? msg.username : msg.sender;
          return (
            <div
              key={index}
              className={`chat-bubble ${isMe ? "sent" : "received"}`}
            >
              {!isMe && <strong className="sender"> {nameToDisplay}</strong>}
              <p className="message">{msg.message}</p>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <div
        className="chat-input-container"
        style={{ display: "flex", alignItems: "center", gap: "1rem" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button onClick={handleSend} className="send-button">
          Send
        </button>
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
        <Tooltip title="Change Display Name">
          <IconButton
            sx={{
              backgroundColor: "#e5c185",
              color: "#FFFFFF",
              margin: "0 auto",
              "&:hover": { backgroundColor: "#deae9f" }
            }}
            onClick={() => setIsChangeUsernameVisible(true)}
          >
            <PersonIcon />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}