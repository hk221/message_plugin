import React, { useState, useEffect, useRef } from "react";
import "./Chat.css"; // Import external styles

/**
 * @param {PluginProps} props
 */
export default function Plugin(props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null); // Reference for scrolling
  const isCurrentUser = props.getUser() === String(props.getSender()); // Check if current user is the sender

  // Update messages when history changes
  useEffect(() => {
    setMessages(props.getDataHistory());
  }, [props.getDataHistory()]);

  // Scroll to bottom when new message is added
  useEffect(() => {
    if (isCurrentUser) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message
  const handleSend = () => {
    if (!input) return;

    const newMessage = {
      sender: props.getSender(),
      message: input,
      messageID: Date.now().toString(),
    };

    props.sendCreateMessage(newMessage, true); // Persist message
    setInput(""); // Clear input
  };

  // Handle sending on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Chat (User {props.getUser()})</h2>
      <div className="chat-box">
        {messages.map((msg, index) => {
          const isMe = String(msg.sender) === String(props.getUser()); // Convert both to string for comparison

          return (
            <div key={index} className={`chat-bubble ${isMe ? "sent" : "received"}`}>
              {!isMe && <strong className="sender">User {msg.sender}</strong>}
              <p className="message">{msg.message?.message || msg.message}</p>
            </div>
          );
        })}
        <div ref={messageEndRef} /> {/* This will be scrolled into view */}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} // Handle Enter key press
          placeholder="Type a message..."
          className="chat-input"
        />
        <button onClick={handleSend} className="send-button">Send</button>
      </div>
    </div>
  );
}