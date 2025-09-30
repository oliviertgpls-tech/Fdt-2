import { withAuth } from "next-auth/middleware"

export default withAuth(
  // Middleware function qui s'exécute si l'user est connecté
  function middleware(req) {
    // Tu peux ajouter de la logique ici si besoin
  },
  {
    callbacks: {
      // Cette fonction détermine si l'user peut accéder à la route
      authorized: ({ token }) => !!token
    },
  }
)

// Configuration : quelles routes protéger
export const config = {
  matcher: [
    // Protège toutes les routes sauf les exceptions ci-dessous
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|$).*)",
  ]
}
