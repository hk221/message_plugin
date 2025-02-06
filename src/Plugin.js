import React, { useState, useEffect } from "react";
import "./Chat.css"; // Import external styles

/**
 * @param {PluginProps} props
 */
export default function Plugin(props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  // Update messages when history changes
  useEffect(() => {
    setMessages(props.getDataHistory());
  }, [props.getDataHistory()]);

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
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button onClick={handleSend} className="send-button">Send</button>
      </div>
    </div>
  );
}