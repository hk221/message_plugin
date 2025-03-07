import React, { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import "./Chat.css";

/**
 * @param {PluginProps} props
 */
export default function Plugin(props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    setMessages(props.getDataHistory());
  }, [props.getDataHistory()]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message
  const handleSend = () => {
    if (!input) return;
    const newMessage = {
      sender: props.getSender(),
      messageID: Date.now().toString(),
      message: input,
    };
    props.sendCreateMessage(newMessage, true);
    setInput("");
  };

  // Send on Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat-container enhanced">
      {/* If the leaderboard is visible, show only the leaderboard page */}
      {isLeaderboardVisible ? (
        <div className="leaderboard-page">
          <h2>Leaderboard</h2>
          {/* Replace with your real leaderboard content here */}
          <p>Sample leaderboard data...</p>

          {/* Back button, styled as requested */}
          <Button
            onClick={() => setIsLeaderboardVisible(false)}
            sx={{
              backgroundColor: "#1ba494",
              color: "#ffffff",
              mt: 3,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              display: "block",
              margin: "0 auto", 
              "&:hover": {
                backgroundColor: "#005f56",
              },
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
              // Handle object messages vs. string
              const displayMessage =
                typeof msg.message === "object"
                  ? msg.message.text ||
                    msg.message.message ||
                    JSON.stringify(msg.message)
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
