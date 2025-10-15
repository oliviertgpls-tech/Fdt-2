import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let ingredients: string[] = [];
  
  try {
    const body = await request.json();
    ingredients = body.ingredients;
    
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé OpenAI manquante' }, { status: 500 });
    }

    if (!ingredients || ingredients.length <= 1) {
      return NextResponse.json({ ingredients: ingredients || [] });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `Voici une liste d'ingrédients provenant de plusieurs scans d'une même recette. Il y a des DOUBLONS SÉMANTIQUES à éliminer.

LISTE BRUTE :
${ingredients.map((ing: string, i: number) => `${i + 1}. ${ing}`).join('\n')}

RÈGLES DE DÉDUPLICATION STRICTES :
1. Si 2+ ingrédients désignent la MÊME CHOSE, garde UNIQUEMENT le plus précis/complet
   Exemple : "200g de farine" + "farine" + "farine T55" → garde SEULEMENT "200g de farine T55"

2. Élimine les mentions partielles dans les instructions
   Exemple : "sel" + "sel et poivre" → garde "sel et poivre"

3. Si un ingrédient est une sous-partie d'un autre, garde le plus complet
   Exemple : "coriandre" + "une botte de coriandre fraîche" → garde "une botte de coriandre fraîche"

4. Les versions avec quantités sont TOUJOURS prioritaires
   Exemple : "sucre" + "100g de sucre" → garde "100g de sucre"

5. Si vraiment identiques, garde celui qui apparaît en premier

IMPORTANT : Sois TRÈS AGRESSIF sur la déduplication. En cas de doute, déduplique !

RETOURNE UN JSON avec UNIQUEMENT la liste nettoyée (pas de commentaire) :
{
  "ingredients": ["ingrédient 1", "ingrédient 2", ...]
}`
        }],
        max_tokens: 800,
        temperature: 0.1  // Très bas pour être déterministe
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur OpenAI déduplication:', error);
      // Fallback : déduplication basique
      return NextResponse.json({ 
        ingredients: Array.from(new Set(ingredients)) 
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json({ 
        ingredients: Array.from(new Set(ingredients)) 
      });
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ 
        ingredients: Array.from(new Set(ingredients)) 
      });
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log('✅ Déduplication : de', ingredients.length, 'à', result.ingredients.length, 'ingrédients');
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('❌ Erreur déduplication:', error);
    // Fallback : déduplication basique si on a les ingrédients
    if (ingredients && ingredients.length > 0) {
      return NextResponse.json({ 
        ingredients: Array.from(new Set(ingredients)) 
      });
    }
    return NextResponse.json({ 
      ingredients: [] 
    }, { status: 500 });
  }
}