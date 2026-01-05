"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    verifyEmail(token);
  }, [token]);

  // Countdown timer effect
  useEffect(() => {
    if (isRateLimited && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isRateLimited, timeRemaining]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Email verified successfully! Signing you in...");
        
        // Automatically sign in the user with the auto-login token
        if (data.autoLoginToken) {
          try {
            const result = await signIn("auto-login", {
              token: data.autoLoginToken,
              redirect: false,
            });

            if (result?.error) {
              setMessage("Email verified but auto-login failed. Please sign in manually.");
              setTimeout(() => {
                router.push("/auth/signin");
              }, 3000);
            } else {
              setMessage("Email verified and signed in successfully! Redirecting...");
              setTimeout(() => {
                router.push("/chat");
              }, 2000);
            }
          } catch (signInError) {
            console.error("Auto sign-in error:", signInError);
            setMessage("Email verified but auto-login failed. Please sign in manually.");
            setTimeout(() => {
              router.push("/auth/signin");
            }, 3000);
          }
        } else {
          // Fallback to manual sign-in
          setTimeout(() => {
            router.push("/auth/signin");
          }, 3000);
        }
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during verification");
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    setResendSuccess(false);
    setIsRateLimited(false);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage("Verification email sent! Please check your inbox.");
        setResendEmail("");
        setResendSuccess(true);
      } else if (response.status === 429) {
        // Rate limited
        setMessage(data.error);
        setIsRateLimited(true);
        setTimeRemaining(data.timeRemaining || 3600); // Default to 1 hour if not provided
        setResendSuccess(false);
      } else {
        setMessage(data.error || "Failed to send verification email");
        setResendSuccess(false);
      }
    } catch (error) {
      setMessage("An error occurred while sending verification email");
      setResendSuccess(false);
    } finally {
      setResending(false);
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
            Email Verification
          </h1>

          {status === "loading" && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 font-medium">{message}</p>
              <p className="text-gray-600 text-sm">Redirecting to sign in...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                resendSuccess ? "bg-green-100" : "bg-red-100"
              }`}>
                {resendSuccess ? (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <p className={`font-medium ${resendSuccess ? "text-green-600" : "text-red-600"}`}>{message}</p>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Resend Verification Email
                </h3>
                {isRateLimited && timeRemaining > 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Rate limit reached</p>
                        <p className="text-sm text-yellow-700">
                          Please wait {formatTimeRemaining(timeRemaining)} before trying again
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleResendVerification} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                    disabled={isRateLimited && timeRemaining > 0}
                  />
                  <button
                    type="submit"
                    disabled={resending || (isRateLimited && timeRemaining > 0)}
                    className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {resending ? "Sending..." : 
                     (isRateLimited && timeRemaining > 0) ? `Wait ${formatTimeRemaining(timeRemaining)}` : 
                     "Resend Verification Email"}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
              Email Verification
            </h1>
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}