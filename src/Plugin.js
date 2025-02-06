import React, { useState, useEffect } from "react";

/**
 * @param {PluginProps} props
 */
export default function Plugin(props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  // Update messages when history changes
  useEffect(() => {
    setMessages(props.getDataHistory());
  }, [props.getDataHistory]); // Depend on history to trigger updates

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
    <div>
      <h2>Chat (User {props.getUser()})</h2>
      <div
        style={{
          border: "1px solid black",
          padding: "10px",
          height: "200px",
          overflowY: "scroll",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}:</strong>{" "}
            {typeof msg.message === "object"
              ? JSON.stringify(msg.message)
              : msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
