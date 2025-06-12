import React, { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Switch from "@mui/material/Switch";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  increment
} from "firebase/firestore";
import { firestore } from "./firebase";
import { useAuth } from "./AuthContext";
import ChangeUsername from "./ChangeUsername";
import "../Chat.css";

// This component handles the global chat functionality, including sending messages,
// displaying messages, managing user stats, and providing a leaderboard view.
export default function Messages() {
  // Chat and UI state
  const [input, setInput] = useState(""); // Input for new messages
  const [messages, setMessages] = useState([]); // Array to hold chat messages
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false); // Toggle for leaderboard visibility
  const [isChangeUsernameVisible, setIsChangeUsernameVisible] = useState(false); // Toggle for change username visibility
  const [isSettingsVisible, setIsSettingsVisible] = useState(false); // Toggle for settings visibility
  const messageEndRef = useRef(null); // Ref for auto-scrolling to the latest message
  const { user } = useAuth(); // Get the current authenticated user

  // User info
  const [displayName, setDisplayName] = useState("");
  // Stats state
  const [totalCoins, setTotalCoins] = useState(0);
  const [groupTotalTime, setGroupTotalTime] = useState(0);
  const [individualStats, setIndividualStats] = useState([]);
  const filteredStats = individualStats.filter(u => u.uid !== "default");

  // Group‐wide toggles
  const [groupSettings, setGroupSettings] = useState({
    enableGroupStats: true,
    enableLeaderboard: true,
    enableSharedCoins: false,
    showTrophies: true
  });

  // Trophy items
  const trophyItems = [
    { id: "goldDuck", name: "Golden Duck Trophy", emoji: "🦆✨" },
    { id: "motivator", name: "Motivator Badge", emoji: "🚀" },
    { id: "zenMaster", name: "Zen Master", emoji: "🧘‍♂️🌸" },
    { id: "taskWizard", name: "Task Wizard", emoji: "🧙‍♂️📘" }
  ];

  // Listen for group settings changes
  useEffect(() => {
    const unsub = onSnapshot(doc(firestore, "groups", "globalChat"), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setGroupSettings({
          enableGroupStats: !!data.enableGroupStats,
          enableLeaderboard: !!data.enableLeaderboard,
          enableSharedCoins: !!data.enableSharedCoins,
          showTrophies: !!data.showTrophies
        });
      }
    });
    return unsub;
  }, []);

  // Listen for user displayName
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(firestore, "users", user.uid), snap => {
      if (snap.exists() && snap.data().username) {
        setDisplayName(snap.data().username);
      } else {
        setDisplayName(user.uid);
      }
    });
    return unsub;
  }, [user]);

  // Listen for chat messages
  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "globalChat"), snapshot => {
      const all = snapshot.docs
        .map(d => d.data())
        .sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());
      setMessages(all);
    });
    return unsub;
  }, []);

  // Auto‐scroll on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch coins + group total time when leaderboard opens
  const handleReceive = async () => {
    try {
      // Total coins
      const coinsSnap = await getDoc(doc(firestore, "coins", "default"));
      setTotalCoins(coinsSnap.exists() ? coinsSnap.data().coins || 0 : 0);

      // Group total time studied
      const groupSnap = await getDoc(doc(firestore, "statistics", "default"));
      setGroupTotalTime(
        groupSnap.exists() ? groupSnap.data().totalTimeStudied || 0 : 0
      );
    } catch (e) {
      console.error("Error fetching group stats:", e);
    }
  };

  // Send a “like”
  const sendLike = async targetUid => {
    try {
      await updateDoc(doc(firestore, "statistics", targetUid), {
        likes: increment(1)
      });
    } catch (e) {
      console.error("Error sending like:", e);
    }
  };

  // Send a “nudge”
  const sendNudge = async targetUid => {
    try {
      await updateDoc(doc(firestore, "statistics", targetUid), {
        nudges: increment(1)
      });
    } catch (e) {
      console.error("Error sending nudge:", e);
    }
  };

  // helper functions to format time in minutes for sorting
  function formatTime(minutes) {
    const totalSeconds = Math.floor(minutes * 60);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  function parseTimeStringToMinutes(timeStr) {
    const [hrs, mins, secs] = timeStr.split(":").map(Number);
    return hrs * 60 + mins + secs / 60;
  }

  // Listen for per‐user stats when leaderboard open
  useEffect(() => {
    if (!isLeaderboardVisible) return;
  
    handleReceive();
  
    // Listen for changes in the statistics collection
    // and enrich each entry with username and trophies
    const unsub = onSnapshot(collection(firestore, "statistics"), async snap => {
      let statsArr = snap.docs.map(d => ({
        uid: d.id,
        time: d.data().totalTimeStudied ? parseTimeStringToMinutes(d.data().totalTimeStudied) : 0,
        likes: d.data().likes || 0,
        nudges: d.data().nudges || 0
      }));
  
      // Enrich each entry with username + trophies
      statsArr = await Promise.all(
        statsArr.map(async entry => {
          const [userSnap, trophySnap] = await Promise.all([
            getDoc(doc(firestore, "users", entry.uid)),
            getDoc(doc(firestore, "trophies", entry.uid))
          ]);
          
          // Get username from user document, or fallback to uid
          const username =
            userSnap.exists() && userSnap.data().username
              ? userSnap.data().username
              : entry.uid;
          
          // Get trophies from trophy document, or fallback to empty array
          const trophyList = trophySnap.exists() ? trophySnap.data().items || [] : [];
          const emojiList = trophyList
            .map(id => {
              const item = trophyItems.find(i => i.id === id);
              return item?.emoji;
            })
            .filter(Boolean);
  
          return {
            ...entry,
            username,
            trophies: emojiList
          };
        })
      );
  
      // Sort after enrichment
      statsArr.sort((a, b) => b.time - a.time);
  
      setIndividualStats(statsArr);
    });
  
    return unsub;
  }, [isLeaderboardVisible]);

  // Send a new chat message
  const handleSend = async () => {
    if (!input.trim() || !user) return;
    // Ensure user has a display name
    const messageData = {
      sender: user.uid,
      username: displayName,
      messageID: Date.now().toString(),
      message: input,
      timestamp: new Date()
    };
    try {
      await addDoc(collection(firestore, "globalChat"), messageData);
      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Update any one of the three group settings
  const updateGroupSetting = async (key, value) => {
    try {
      await setDoc(
        doc(firestore, "groups", "globalChat"),
        { [key]: value },
        { merge: true }
      );
    } catch (err) {
      console.error("Error updating group setting:", err);
    }
  };

  // Handle Enter key to send message
  const handleKeyDown = e => e.key === "Enter" && handleSend();

  // --- Leaderboard View ---
  if (isLeaderboardVisible) {
    return (
      <div
        className="leaderboard-page"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 20,
          background: "linear-gradient(135deg, #1ba494, #0e7467)",
          borderRadius: 16,
          color: "white",
          height: "80%", 
          width: "100%",           
          overflowY: "auto"
        }}
      >
        <h2 style={{ fontSize: "2rem", marginBottom: 10 }}>
          🏆 Overall Group Statistics!
        </h2>
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 30
          }}
        >
          {groupSettings.enableGroupStats && (
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: 12
              }}
            >
              ⏱️ <strong>Total Time Studied:</strong> {groupTotalTime}
            </div>
          )}
          {groupSettings.enableSharedCoins && (
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: 12
              }}
            >
              💰 <strong>Total Coins:</strong> {totalCoins}
            </div>
          )}
          {groupSettings.enableLeaderboard && (
            <>
               <h2 style={{ fontSize: "2rem", marginBottom: 10 }}>
                🥇 Leaderboard
              </h2>
              {filteredStats.map((u, idx) => (
              <div
                key={u.uid}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                <strong>{idx + 1}. {u.username}</strong>
                  <span style={{ marginLeft: 8 }}>{formatTime(u.time)}</span>
                  {groupSettings.showTrophies && u.trophies?.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: "1.2rem" }}>
                      {u.trophies.join(" ")}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <IconButton
                    size="small"
                    disabled={u.uid === user?.uid}
                    onClick={() => sendLike(u.uid)}
                    sx={{ color: "white" }}
                  >
                    <ThumbUpIcon fontSize="small" />
                  </IconButton>
                  <span>{u.likes}</span>
                  <IconButton
                    size="small"
                    disabled={u.uid === user?.uid}
                    onClick={() => sendNudge(u.uid)}
                    sx={{ color: "white" }}
                  >
                    <NotificationsActiveIcon fontSize="small" />
                  </IconButton>
                  <span>{u.nudges}</span>
                </div>
              </div>
            ))}
            </>
          )}
        </div>
        <Button
          onClick={() => setIsLeaderboardVisible(false)}
          sx={{
            backgroundColor: "#FF9800",
            color: "#fff",
            borderRadius: 50,
            px: 4,
            py: 1.5,
            "&:hover": { backgroundColor: "#e68900" }
          }}
        >
          Back 🔙
        </Button>
      </div>
    );
  }

  // --- Change Username View ---
  if (isChangeUsernameVisible) {
    return (
      <div
        className="change-username-page"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          background: "linear-gradient(135deg, #e5c185, #deae9f)",
          borderRadius: 10,
          padding: 15,
          color: "white"
        }}
      >
        <ChangeUsername />
        <Button
          onClick={() => setIsChangeUsernameVisible(false)}
          sx={{
            mt: 2,
            backgroundColor: "#0e7467",
            color: "#fff",
            borderRadius: 50,
            px: 4,
            py: 1.5,
            "&:hover": { backgroundColor: "#1ba494" }
          }}
        >
          Back 🔙
        </Button>
      </div>
    );
  }

  // --- Settings View ---
  if (isSettingsVisible) {
    return (
      <div
        className="settings-page"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 20,
          background: "linear-gradient(135deg, #1ba494, #0e7467)",
          borderRadius: 16,
          color: "white",
          minHeight: "20vh",
          boxSizing: "border-box"
        }}
      >
        <h2 style={{ fontSize: "2rem", marginBottom: 20 }}>🔧 Group Settings</h2>

        <Card
          sx={{
            width: "100%",
            maxWidth: 400,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}
        >
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControlLabel
              control={
                <Switch
                  checked={groupSettings.showTrophies}
                  onChange={e =>
                    updateGroupSetting("showTrophies", e.target.checked)
                  }
                  sx={{ "& .MuiSwitch-thumb": { backgroundColor: "#fff" } }}
                />
              }
              label="Show Trophies in Leaderboard"
              sx={{ color: "white", fontSize: "1rem" }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={groupSettings.enableGroupStats}
                  onChange={e =>
                    updateGroupSetting("enableGroupStats", e.target.checked)
                  }
                  sx={{ "& .MuiSwitch-thumb": { backgroundColor: "#fff" } }}
                />
              }
              label="Enable Group Stats"
              sx={{ color: "white", fontSize: "1rem" }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={groupSettings.enableLeaderboard}
                  onChange={e =>
                    updateGroupSetting("enableLeaderboard", e.target.checked)
                  }
                  sx={{ "& .MuiSwitch-thumb": { backgroundColor: "#fff" } }}
                />
              }
              label="Enable Leaderboard"
              sx={{ color: "white", fontSize: "1rem" }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={groupSettings.enableSharedCoins}
                  onChange={e =>
                    updateGroupSetting("enableSharedCoins", e.target.checked)
                  }
                  sx={{ "& .MuiSwitch-thumb": { backgroundColor: "#fff" } }}
                />
              }
              label="Enable Shared Coins"
              sx={{ color: "white", fontSize: "1rem" }}
            />
          </CardContent>
        </Card>

        <Button
          onClick={() => setIsSettingsVisible(false)}
          sx={{
            mt: 4,
            backgroundColor: "#FF9800",
            color: "#fff",
            borderRadius: 50,
            px: 4,
            py: 1.5,
            "&:hover": { backgroundColor: "#e68900" }
          }}
        >
          Back 🔙
        </Button>
      </div>
    );
  }

  // --- Main Chat View ---
  return (
    <div className="chat-container enhanced">
      <h2 className="chat-title">{displayName || "Unknown"}'s Chat</h2>
      <div
          className="chat-box"
          style={{ height: "300px", overflowY: "auto" }}
        >
        {messages.map((msg, i) => {
          const isMe = String(msg.sender) === String(user?.uid);
          return (
            <div key={i} className={`chat-bubble ${isMe ? "sent" : "received"}`}>
              {!isMe && (
                <strong className="sender">{msg.username || msg.sender}</strong>
              )}
              <p className="message">{msg.message}</p>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>
      <div style={{ display: "flex", alignItems: "center", minHeight: "60px", gap: 8, marginTop: 10 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button onClick={handleSend} className="send-button">
          Send
        </button>

        {/* Show the stats icon if any feature is on */}
        {(groupSettings.enableGroupStats ||
          groupSettings.enableLeaderboard ||
          groupSettings.enableSharedCoins) && (
          <Tooltip title="View Leaderboard / Coins">
            <IconButton
              sx={{ backgroundColor: "#e5c185", color: "#fff", "&:hover": { backgroundColor: "#deae9f" } }}
              onClick={() => setIsLeaderboardVisible(true)}
            >
              <LeaderboardIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Change Display Name">
          <IconButton
            sx={{ backgroundColor: "#e5c185", color: "#fff", "&:hover": { backgroundColor: "#deae9f" } }}
            onClick={() => setIsChangeUsernameVisible(true)}
          >
            <PersonIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton
            sx={{ backgroundColor: "#e5c185", color: "#fff", "&:hover": { backgroundColor: "#deae9f" } }}
            onClick={() => setIsSettingsVisible(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}