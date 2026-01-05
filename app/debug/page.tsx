"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function DebugPage() {
  const { data: session } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkPasswords = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug/passwords");
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error("Error checking passwords:", error);
    }
    setLoading(false);
  };

  const migratePasswords = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/migrate/passwords", {
        method: "POST",
      });
      const data = await response.json();
      setMigrationResult(data);
    } catch (error) {
      console.error("Error migrating passwords:", error);
    }
    setLoading(false);
  };

  if (!session?.user) {
    return <div className="p-8">Please log in to access debug tools.</div>;
  }

  if (session.user.role !== "admin") {
    return <div className="p-8">Only admins can access debug tools.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Password Debug Tools</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Check Password Formats</h2>
          <button
            onClick={checkPasswords}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Checking..." : "Check Passwords"}
          </button>
          
          {debugInfo && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Migrate Passwords</h2>
          <p className="text-gray-600 mb-4">
            This will convert all bcrypt passwords to encrypted format with default password "password123"
          </p>
          <button
            onClick={migratePasswords}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Migrating..." : "Migrate Passwords"}
          </button>
          
          {migrationResult && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Migration Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(migrationResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}