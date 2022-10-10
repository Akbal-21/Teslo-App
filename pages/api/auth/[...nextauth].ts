import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { dbUsers } from "../../../database";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    Credentials({
      name: "Custom Login",
      credentials: {
        email: {
          label: "Correo",
          type: "email",
          placeholder: "corre@google.com",
        },
        password: {
          label: "contraseña",
          type: "password",
          placeholder: "Contraseña",
        },
      },
      async authorize(credentials) {
        //TODO: Validar contra base de datos
        /*
        *Esto es para realizar prruebas y verificar que se hace de forma correcta 
        return { name: "queso", correo: "queso@google.com", role: "admin" }; */

        return await dbUsers.checkUserEmailPassword(
          credentials!.email,
          credentials!.password
        );
      },
    }),

    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    // ...add more providers here
  ],

  //Custom Pages
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },

  //CALLBACKS

  session: {
    maxAge: 2592000, //30d
    strategy: "jwt",
    updateAge: 86400, //cada dia se actualiza
  },

  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_Token;
        switch (account.type) {
          case "oauth":
            //TODO: Crear usuario si exsite en mi DB

            token.user = await dbUsers.oAUthToDbUser(
              user?.email || "",
              user?.name || ""
            );
            break;

          case "credentials":
            token.user = user;
            break;

          default:
            break;
        }
      }
      return token;
    },
    async session({ session, token, user }) {
      session.accessToken = token.accessToken;
      session.user = token.user as any;
      return session;
    },
  },
};

export default NextAuth(authOptions);
