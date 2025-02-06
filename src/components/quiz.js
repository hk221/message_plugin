import React, { useState, useEffect } from "react";

/**
 * @param {PluginProps} props
 */
export default function Message(props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  // Fetch messages on component mount
  useEffect(() => {
    handleReceive();
  }, []);

  // Send message
  const handleSend = () => {
    if (!input) return;
    const newMessage = { text: input };

    props.sendCreateMessage(newMessage, true); // Persist message
    setMessages((prev) => [
      ...prev,
      { Sender: props.getSender(), Message: newMessage, MessageID: Date.now().toString(), toggle: true },
    ]);
    setInput(""); // Clear input after sending
  };

  // Receive messages
  const handleReceive = () => {
    const history = props.getDataHistory(); // Assume this returns an array of PluginMessage objects
    if (history) {
      setMessages(history);
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <div style={{ border: "1px solid black", padding: "10px", height: "200px", overflowY: "scroll" }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.Sender}:</strong> {JSON.stringify(msg.Message)}
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