"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "../../components/atoms";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("verify your email")) {
          setError("Please verify your email address before signing in. Check your inbox for a verification link.");
        } else {
          setError("Invalid email or password");
        }
      } else {
        router.push("/chat");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Home
          </Link>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome back</h1>
        <p className="text-gray-600 mb-10">Sign in to continue to your chats</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          {error && (
            <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg text-sm border border-gray-300">
              {error}
              {error.includes("verify your email") && (
                <div className="mt-2">
                  <Link 
                    href="/auth/verify-email" 
                    className="text-gray-900 font-medium hover:underline cursor-pointer"
                  >
                    Resend verification email →
                  </Link>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
          >
            Sign in
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-gray-600 hover:text-gray-900 font-medium text-sm cursor-pointer"
          >
            Forgot your password?
          </Link>
        </div>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-gray-900 font-medium hover:underline cursor-pointer">
            Sign up
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
