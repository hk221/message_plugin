import React, { useState, useEffect } from "react";
import { firestore } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box
} from "@mui/material";

export default function ChangeUsername() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [storedUsername, setStoredUsername] = useState("");

  useEffect(() => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists() && docSnap.data().username) {
          setStoredUsername(docSnap.data().username);
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const userDocRef = doc(firestore, "users", user.uid);
    try {
      await setDoc(userDocRef, { username }, { merge: true });
      setStoredUsername(username);
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        px: 2,
        py: 1,
        mb: 2,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #e5c185 0%, #deae9f 100%)",
        color: "#fff",
        maxWidth: "400px",        // Adjust as needed
        margin: "0 auto",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "center", // Center everything horizontally
          flexWrap: "wrap",         // Allows wrapping on small screens
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
        >
          Change Display Name:
        </Typography>

        <TextField
          variant="outlined"
          placeholder="New username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "4px",
            width: "140px",       // Adjust as needed
            "& .MuiOutlinedInput-root": {
              fontSize: "0.9rem", // Slightly smaller font
            },
          }}
        />

        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: "#0e7467",
            "&:hover": { backgroundColor: "#1ba494" },
            color: "#fff",
            fontWeight: 600,
            borderRadius: "50px",
            boxShadow: "0px 3px 6px rgba(0,0,0,0.2)",
            textTransform: "none",
            fontSize: "0.9rem",
            py: 0.6,
            px: 2,
          }}
        >
          Save
        </Button>

        {/* Show the current username inline */}
        {storedUsername && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              px: 1,
              py: 0.5,
            }}
          >
            Current username: <strong>{storedUsername}</strong>
          </Typography>
        )}
      </Box>
    </Paper>
  );
}