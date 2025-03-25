import React, { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import "./Chat.css";
import { firestore } from "./components/firebase"; // your firebase config file
import { collection, doc, getDoc, getDocs, setDoc, addDoc, query, onSnapshot, collectionGroup } from "firebase/firestore";

/**
 * @param {PluginProps} props
 */
export default function Plugin(props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const messageEndRef = useRef(null);
  const statsDocRef = doc(firestore, "statistics", "default");
  const [stats, setstats] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0); // New state for "Total Coins for Group!"

  useEffect(() => {
    setMessages(props.getDataHistory());
  }, [props.getDataHistory()]);

  useEffect(() => {
    getDoc(statsDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setstats(docSnap.data().totalTimeStudied);
        } else {
          console.error("No such document!");
        }
      })
      .catch((error) => console.error("Error fetching coins:", error));
  }, []); 
  

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isLeaderboardVisible) {
      handleReceive();  
    }
  }, [isLeaderboardVisible]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collectionGroup(firestore, "chat"), (snapshot) => {
      const allMessages = snapshot.docs
        .map(doc => doc.data())
        .sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());
  
      setMessages(allMessages);
    });
  
    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!input) return;
  
    const messageData = {
      sender: props.getUser(),
      messageID: Date.now().toString(),
      message: input,
      timestamp: new Date()
    };
  
    try {
      await addDoc(collection(firestore, "messages", props.getUser(), "chat"), messageData);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Send on Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };
  const handleReceive = async () => {
    try {
      // Fetch total study time
      const docSnap = await getDoc(statsDocRef);
      if (docSnap.exists()) {
        const currentStats = docSnap.data().totalTimeStudied || 0;
        setstats(currentStats);
      } else {
        console.error("No such document in statistics!");
      }
  
      // Fetch total group coins from "coins/default"
      const coinsDocRef = doc(firestore, "coins", "default");
      const coinsDocSnap = await getDoc(coinsDocRef);
      
      if (coinsDocSnap.exists()) {
        const groupCoins = coinsDocSnap.data().coins || 0; // Get the coins value
        setTotalCoins(groupCoins);
      } else {
        console.error("No such document in coins!");
      }
  
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  return (
    <div className="chat-container enhanced">
      {/* If the leaderboard is visible, show only the leaderboard page */}
      {isLeaderboardVisible ? (
      <div className="leaderboard-page"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center", // ✅ Centers within the black housing
        height: "45vh", // ✅ Stays inside the housing
        width: "100%",
        background: "linear-gradient(135deg, #1ba494 0%, #0e7467 100%)",
        color: "white",
        textAlign: "center",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "10px", textAlign: "center", marginRight: "40px",
}}>
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
          mt: "auto", // ✅ Keeps button pushed down without breaking layout
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          "&:hover": { backgroundColor: "#e68900" },
          marginRight: "40px",
        }}
      >
        Back 🔙
      </Button>
    </div>
    ) : (
        // Otherwise, show the chat UI
      <>
        <h2 className="chat-title">Chat (User {props.getUser()})</h2>
        <div className="chat-box">
          {messages.map((msg, index) => {
            const isMe = String(msg.sender) === String(props.getUser());

            // Robust message parser
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

          {/* Leaderboard toggle button */}
          <Tooltip title="View Leaderboard">
            <IconButton
              sx={{
                backgroundColor: "#e5c185",
                color: "#FFFFFF",
                margin: "0 auto",
                "&:hover": { backgroundColor: "#deae9f" },
              }}
              onClick={() => setIsLeaderboardVisible(true)}
            >
              <LeaderboardIcon />
            </IconButton>
          </Tooltip>

          {/* Send button */}
          <button onClick={handleSend} className="send-button">
            Send
          </button>
        </div>
      </>
      )}
    </div>
  );
}
