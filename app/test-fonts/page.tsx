'use client';

import { useEffect, useState } from 'react';

export default function TestFontsPage() {
  const [status, setStatus] = useState<string>('Vérification...');

  useEffect(() => {
    const testFonts = async () => {
      try {
        // Test si les fichiers sont accessibles
        const fonts = [
          '/fonts/OpenSans-Regular.ttf',
          '/fonts/OpenSans-Bold.ttf',
          '/fonts/OpenSans-Italic.ttf'
        ];

        const results = await Promise.all(
          fonts.map(async (font) => {
            const response = await fetch(font, { method: 'HEAD' });
            return { font, ok: response.ok, status: response.status };
          })
        );

        const allOk = results.every(r => r.ok);

        if (allOk) {
          setStatus('✅ Toutes les polices sont accessibles !');
        } else {
          setStatus('❌ Certaines polices sont introuvables :\n' + 
            results.filter(r => !r.ok).map(r => `${r.font}: ${r.status}`).join('\n')
          );
        }

        console.log('Résultats:', results);
      } catch (error: any) {
        setStatus('❌ Erreur: ' + error.message);
      }
    };

    testFonts();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Test des polices</h1>
        <div className="whitespace-pre-wrap">{status}</div>
      </div>
    </div>
  );
}
