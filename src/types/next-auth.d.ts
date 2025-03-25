import "next-auth";
import { DefaultSession } from "next-auth";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    isAdmin: boolean;
    username: string;
  }
}

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
    username: string;
  }
}
