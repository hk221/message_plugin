import React, { useState, useEffect, useRef } from "react";
import Messages from "./components/message";
import AuthForm from "./components/LoginForm";
import { AuthProvider, useAuth } from "./components/AuthContext";

function PluginContent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <AuthForm onLogin={() => console.log("User logged in")} />;

  return <Messages />;
}

export default function Plugin() {
  return (
    <AuthProvider>
      <PluginContent />
    </AuthProvider>
  );
}
