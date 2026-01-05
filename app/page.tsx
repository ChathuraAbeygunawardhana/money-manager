import Link from "next/link";
import { auth } from "@/auth";
import { APP_CONFIG } from "@/lib/config";
import DynamicImageGrid from "@/app/components/DynamicImageGrid";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {APP_CONFIG.name}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {session?.user ? (
                <Link
                  href="/chat"
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    href="/auth/signin"
                    className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-all duration-200 cursor-pointer"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative flex items-center justify-center min-h-screen px-6 pt-16 overflow-hidden">
        {/* Background Images */}
        <DynamicImageGrid />
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl">
          <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Connect & Chat
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join real-time conversations, create communities, and connect with people around the world in our modern chat platform.
          </p>
          
          {!session?.user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 text-lg cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-medium hover:border-gray-900 hover:bg-gray-50 transition-all duration-200 text-lg cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Sign In
              </Link>
            </div>
          )}

          {session?.user && (
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-6">
                Welcome back, {session.user.name}!
              </p>
              <Link
                href="/chat"
                className="px-8 py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 text-lg cursor-pointer inline-block shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose {APP_CONFIG.name}?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience seamless communication with our feature-rich platform designed for modern conversations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Real-time Messaging</h4>
              <p className="text-gray-600">
                Instant message delivery with live updates. Never miss a conversation.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Multiple Chatrooms</h4>
              <p className="text-gray-600">
                Join different communities and topics. Organize conversations by interest.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h4>
              <p className="text-gray-600">
                Your conversations are protected with modern security practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
