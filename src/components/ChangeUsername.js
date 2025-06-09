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

// This component allows users to change their display name in the application.
// It retrieves the current username from Firestore and allows the user to update it.
// The component uses Firebase Firestore to store and retrieve the username.
export default function ChangeUsername() {
  const { user } = useAuth(); // Access the current user from the AuthContext
  const [username, setUsername] = useState(""); // State for the new username input
  const [storedUsername, setStoredUsername] = useState(""); // State for the currently stored username

  // Effect to fetch the current username from Firestore when the component mounts or user changes
  useEffect(() => {
    if (user) {
      // Fetch the user's document from Firestore 
      const userDocRef = doc(firestore, "users", user.uid); // Reference to the user's document
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists() && docSnap.data().username) {
          setStoredUsername(docSnap.data().username);
        }
      });
    }
  }, [user]);

  // Function to handle saving the new username to Firestore
  const handleSave = async () => {
    // Check if the user is authenticated before proceeding
    if (!user) return;
    const userDocRef = doc(firestore, "users", user.uid); // Reference to the user's document
    try {
      await setDoc(userDocRef, { username }, { merge: true });
      setStoredUsername(username);
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };

  // Render the component with a form to change the username
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
          maxWidth: "400",
          maxHeight: "400",
          width: "auto",  
          height: "auto",      
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: "center",
            flexWrap: "wrap",
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
            width: "140px",       
            "& .MuiOutlinedInput-root": {
              fontSize: "0.9rem", 
            },
          }}
        />
        {/* Button to save the new username */}
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