"use client";

import { useState } from "react";
import { authApi } from "@/app/lib/api";

export default function TestApiPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult("Testing login...");
    
    try {
      const response = await authApi.login({
        email: "admin@example.com",
        password: "password123"
      });
      setResult(`Success: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${JSON.stringify(error, null, 2)}`);
      console.error("Test login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testInvalidLogin = async () => {
    setLoading(true);
    setResult("Testing invalid login...");
    
    try {
      const response = await authApi.login({
        email: "invalid@example.com",
        password: "wrongpassword"
      });
      setResult(`Unexpected success: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResult(`Expected error: ${JSON.stringify(error, null, 2)}`);
      console.error("Test invalid login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setResult("Testing connection...");
    
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "password123"
        })
      });
      
      const data = await response.json();
      setResult(`Raw fetch result: ${JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      }, null, 2)}`);
    } catch (error) {
      setResult(`Raw fetch error: ${JSON.stringify(error, null, 2)}`);
      console.error("Test connection error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen main-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">API Test Page</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={testConnection}
            disabled={loading}
            className="btn-gold px-4 py-2 rounded mr-4"
          >
            Test Raw Connection
          </button>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="btn-gold px-4 py-2 rounded mr-4"
          >
            Test Valid Login
          </button>
          
          <button
            onClick={testInvalidLogin}
            disabled={loading}
            className="btn-outline px-4 py-2 rounded"
          >
            Test Invalid Login
          </button>
        </div>
        
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Result:</h2>
          <pre className="text-sm text-foreground-muted whitespace-pre-wrap overflow-auto max-h-96">
            {loading ? "Loading..." : result || "No test run yet"}
          </pre>
        </div>
      </div>
    </div>
  );
}