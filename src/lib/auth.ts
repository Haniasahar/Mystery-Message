import NextAuth, { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.models";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: any): Promise<any> => {
        await dbConnect();

        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) throw new Error("Missing credentials");

        const user = await User.findOne({
          $or: [{ email }],
        });
        if (!user) throw new Error("USER_NOT_FOUND");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("WRONG_PASSWORD");

        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });

        let baseUsername = user.name
          ? user.name.replace(/\s+/g, "").toLowerCase() // "John Doe" → "johndoe"
          : user.email!.split("@")[0];

        // Ensure uniqueness (in case "johndoe" already exists)
        let username = baseUsername;
        let userExists = await User.findOne({ username });
        let counter = 1;

        while (userExists) {
          username = `${baseUsername}${counter}`;
          userExists = await User.findOne({ username });
          counter++;
        }

        if (!existingUser) {
          const newUser = await User.create({
            email: user.email,
            username,
            password:
              "$2a$14$RNvhFRVyguOwzPRZwmb6ae4P3BHyEemkclr2wshDo4fj0Igc..Zlm",
            isVerified: true,
            isAccMsg: true,
            otp: null,
            otpExpiry: null,
          });
          user.id = newUser._id.toString();
          user.username = newUser.username;
          user.isVerified = true; 
          user.isAccMsg = true;
        } else {
          user.id = existingUser._id.toString();
          user.username = existingUser.username;
          user.isVerified = existingUser.isVerified ?? true;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || user._id?.toString();
        token._id = user._id?.toString();
        token.isVerified = user.isVerified ?? true;
        token.isAccMsg = user.isAccMsg ?? true;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token.id as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.isAccMsg = token.isAccMsg as boolean;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET!,
};

const handler = NextAuth(authOptions);
// export const signIn = (...args: any[]) => handler.signIn(...args);
// export const signOut = (...args: any[]) => handler.signOut(...args);
export { handler };

// export const { handler, signIn, signOut, auth } = NextAuth(authOptions) //wrong way
