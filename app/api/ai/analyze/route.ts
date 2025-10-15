import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, firstName, mode } = await request.json();
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé OpenAI manquante' }, { status: 500 });
    }

    const prompt = mode === 'manuscript' 
      ? `Lisez cette recette manuscrite et structurez-la au format JSON.

INSTRUCTIONS :
- Lisez tout le texte visible
- Dans "steps", séparez par |

FORMAT : {"title":"...","author":"${firstName}","prepMinutes":30,"servings":"4","ingredients":["..."],"steps":"Étape1|Étape2","confidence":90}`
      : `Analysez cette photo de plat.

FORMAT JSON : {"title":"...","author":"${firstName}","prepMinutes":30,"servings":"4","ingredients":["..."],"steps":"Étape1|Étape2","confidence":85}`;

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
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "high" }}
          ]
        }],
        max_tokens: mode === 'manuscript' ? 1200 : 1000,
        temperature: mode === 'manuscript' ? 0.3 : 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erreur OpenAI:', error);
      return NextResponse.json({ error: 'Erreur OpenAI' }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}