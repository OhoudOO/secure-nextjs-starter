import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// Auth.js reads AUTH_SECRET, AUTH_GITHUB_ID and AUTH_GITHUB_SECRET from the environment.
// Sessions are signed, encrypted JWT cookies (HttpOnly, Secure in production, SameSite=Lax).
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/" },
  callbacks: {
    // Expose the stable provider user id so ownership checks can use it.
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
