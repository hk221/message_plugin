import React, { useState, useEffect, useRef } from "react";
import "./Chat.css"; // Ensure you update your CSS accordingly

/**
 * @param {PluginProps} props
 */
export default function Plugin(props) {
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
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

  // Send message with text and/or image
  const handleSend = () => {
    if (!input && !imageFile) return; // Nothing to send

    const newMessage = {
      sender: props.getSender(),
      messageID: Date.now().toString(),
    };

    // If an image is selected, read it as Base64
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newMessage.message = {
          text: input, // optional caption
          image: reader.result,
        };
        props.sendCreateMessage(newMessage, true);
        setInput("");
        setImageFile(null);
      };
      reader.readAsDataURL(imageFile);
    } else {
      newMessage.message = input;
      props.sendCreateMessage(newMessage, true);
      setInput("");
    }
  };

  // Handle sending on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Handle image file selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  return (
    <div className="chat-container enhanced">
      <h2 className="chat-title">Chat (User {props.getUser()})</h2>
      <div className="chat-box">
        {messages.map((msg, index) => {
          const isMe = String(msg.sender) === String(props.getUser());

          return (
            <div key={index} className={`chat-bubble ${isMe ? "sent" : "received"}`}>
              {!isMe && <strong className="sender">User {msg.sender}</strong>}
              {msg.message && msg.message.image ? (
                <>
                  {msg.message.text && <p className="message">{msg.message.text}</p>}
                  <img src={msg.message.image} alt="Shared content" className="shared-image" />
                </>
              ) : (
                <p className="message">{msg.message?.message || msg.message}</p>
              )}
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
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="image-upload-input"
        />
        <button onClick={handleSend} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
}
