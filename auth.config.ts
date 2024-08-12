import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    //ini middleware
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user; //double exclamation mark ini fungsina kyk Boolean(auth.user) 
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      //kalo lagi di dashboard
      if (isOnDashboard) {
        //dan udah login, maka lanjut
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page

        //tp klo udah login, cm gak masuk ke dashboard page, 
      } else if (isLoggedIn) {
        //redirect ke dashboard
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
