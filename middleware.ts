export { auth as middleware } from "./auth";

export const config = {
  matcher: ["/chat/:path*", "/api/chatrooms/:path*", "/api/messages/:path*", "/api/inbox/:path*"],
};
