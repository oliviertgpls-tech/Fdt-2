import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 1. Nombre d'utilisateurs (excluant oliviertgpls@gmail.com)
    const totalUsers = await prisma.user.count({
      where: {
        email: {
          not: 'oliviertgpls@gmail.com'
        }
      }
    });

    // 2. Récupérer tous les users (sauf olivier) avec leurs données
    const users = await prisma.user.findMany({
      where: {
        email: {
          not: 'oliviertgpls@gmail.com'
        }
      },
      include: {
        recipes: true,
        notebooks: true,
        books: true,
      }
    });

    // 3. Calculer les moyennes
    const totalRecipes = users.reduce((sum, user) => sum + user.recipes.length, 0);
    const totalNotebooks = users.reduce((sum, user) => sum + user.notebooks.length, 0);
    const totalBooks = users.reduce((sum, user) => sum + user.books.length, 0);

    const avgRecipesPerUser = totalUsers > 0 ? (totalRecipes / totalUsers).toFixed(1) : '0';
    const avgNotebooksPerUser = totalUsers > 0 ? (totalNotebooks / totalUsers).toFixed(1) : '0';
    const avgBooksPerUser = totalUsers > 0 ? (totalBooks / totalUsers).toFixed(1) : '0';

    return NextResponse.json({
      totalUsers,
      avgRecipesPerUser: parseFloat(avgRecipesPerUser),
      avgNotebooksPerUser: parseFloat(avgNotebooksPerUser),
      avgBooksPerUser: parseFloat(avgBooksPerUser),
      // Données brutes pour debug (optionnel)
      raw: {
        totalRecipes,
        totalNotebooks,
        totalBooks,
      }
    });

  } catch (error: any) {
    console.error('Erreur stats admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}