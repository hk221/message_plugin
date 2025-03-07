import React, { useState, useEffect, useRef } from "react";
import "./Chat.css"; // Ensure you update your CSS accordingly

/**
 * @param {PluginProps} props
 */
export default function Plugin(props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);
  const isCurrentUser = props.getUser() === String(props.getSender());

  // Update messages when history changes
  useEffect(() => {
    setMessages(props.getDataHistory());
  }, [props.getDataHistory()]);

  // Scroll to bottom when new message is added
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send text message
  const handleSend = () => {
    if (!input) return; // Nothing to send

    const newMessage = {
      sender: props.getSender(),
      messageID: Date.now().toString(),
      message: input,
    };

    props.sendCreateMessage(newMessage, true);
    setInput("");
  };

  // Handle sending on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat-container enhanced">
      <h2 className="chat-title">Chat (User {props.getUser()})</h2>
      <div className="chat-box">
        {messages.map((msg, index) => {
          const isMe = String(msg.sender) === String(props.getUser());
          // Check if the message is an object, then try to extract text from it
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
        <div ref={messageEndRef} /> {/* Scroll anchor */}
      </div>

      <div className="chat-input-container">
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
      </div>
    </div>
  );
}
