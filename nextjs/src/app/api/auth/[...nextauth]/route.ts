import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      // 環境変数を取得
      const envEmails = process.env.ALLOWED_EMAILS;

      if (!envEmails) {
        return false;
      }

      const allowedEmails = envEmails.split(",").map((email: string) => email.trim());

      if (user.email && allowedEmails.includes(user.email)) {
        return true;
      }
      return false;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
