// lib/lulu-client.ts
/**
 * 🖨️ CLIENT API LULU avec OAuth2
 * 
 * Lulu utilise OpenID Connect (OAuth2) pour l'authentification
 */

const LULU_CONFIG = {
  clientKey: process.env.LULU_CLIENT_KEY || '',
  clientSecret: process.env.LULU_CLIENT_SECRET || '',
  apiUrl: process.env.LULU_API_URL || 'https://api.sandbox.lulu.com',
  isSandbox: process.env.LULU_API_URL?.includes('sandbox') ?? true
};

// URL du token (identique pour sandbox et production)
const getTokenUrl = (isSandbox: boolean) => {
  const baseUrl = isSandbox 
    ? 'https://api.sandbox.lulu.com' 
    : 'https://api.lulu.com';
  return `${baseUrl}/auth/realms/glasstree/protocol/openid-connect/token`;
};

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

export class LuluClient {
  private clientKey: string;
  private clientSecret: string;
  private baseUrl: string;
  public isSandbox: boolean;
  
  // Token OAuth
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientKey = LULU_CONFIG.clientKey;
    this.clientSecret = LULU_CONFIG.clientSecret;
    this.baseUrl = LULU_CONFIG.apiUrl;
    this.isSandbox = LULU_CONFIG.isSandbox;

    console.log(`🖨️ Lulu Client initialisé (${this.isSandbox ? 'SANDBOX' : 'PRODUCTION'})`);
    
    if (!this.clientKey || !this.clientSecret) {
      console.warn('⚠️ LULU_CLIENT_KEY ou LULU_CLIENT_SECRET non configurés');
    }
  }

  /**
   * 🔑 Obtenir un access token OAuth2
   */
  private async getAccessToken(): Promise<string> {
    // Si on a déjà un token valide, le retourner
    const now = Date.now();
    if (this.accessToken && this.tokenExpiresAt > now) {
      console.log('✅ Token existant encore valide');
      return this.accessToken;
    }

    console.log('🔑 Demande d\'un nouveau token OAuth...');

    try {
      // Créer le Basic Auth header (client_key:client_secret en base64)
      const credentials = `${this.clientKey}:${this.clientSecret}`;
      const basicAuth = Buffer.from(credentials).toString('base64');

      const tokenUrl = getTokenUrl(this.isSandbox);
        console.log('🎯 Token URL:', tokenUrl);

        const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur obtention token:', response.status, errorText);
        throw new Error(`Erreur auth (${response.status}): ${errorText}`);
      }

      const data: TokenResponse = await response.json();
      
      console.log('✅ Token obtenu, expire dans', data.expires_in, 'secondes');

      // Stocker le token et calculer l'expiration (avec marge de 5min)
      this.accessToken = data.access_token;
      this.tokenExpiresAt = now + (data.expires_in - 300) * 1000;

      return this.accessToken;

    } catch (error: any) {
      console.error('💥 Erreur getAccessToken:', error);
      throw error;
    }
  }

  /**
   * Effectue un appel API Lulu avec authentification OAuth
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}${endpoint}`;

    console.log('🌐 Request:', url);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API Lulu:', errorText);
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  /**
   * 🏓 Test de connexion
   */
  async ping(): Promise<{ success: boolean; environment: string }> {
    try {
      // Tester en obtenant un token
      await this.getAccessToken();
      
      return {
        success: true,
        environment: this.isSandbox ? 'sandbox' : 'production'
      };
    } catch (error: any) {
      console.error('❌ Ping Lulu échoué:', error.message);
      return {
        success: false,
        environment: this.isSandbox ? 'sandbox' : 'production'
      };
    }
  }

  /**
   * 📤 Upload un fichier PDF vers Lulu
   */
  async uploadPDF(
    pdfBuffer: Buffer | Uint8Array,
    filename: string
  ): Promise<{ id: string }> {
    console.log('📤 uploadPDF appelé');
    console.log('📦 Taille buffer:', pdfBuffer.length, 'bytes');
    console.log('📁 Filename:', filename);
    
    try {
      // Obtenir un token valide
      const token = await this.getAccessToken();

      // Créer le FormData
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
      formData.append('file', blob, filename);

      const uploadUrl = `${this.baseUrl}/print-job-files/`;
      console.log('🎯 Upload URL:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Pas de Content-Type pour FormData
        },
        body: formData,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur upload:', errorText);
        throw new Error(`Upload échoué (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Upload réussi:', result);

      return { id: result.id };
      
    } catch (error: any) {
      console.error('💥 Erreur uploadPDF:', error);
      throw error;
    }
  }

  /**
   * 💰 Obtenir un devis
   */
  async getQuote(params: {
    interiorFileId: string;
    coverFileId: string;
    pageCount: number;
    quantity: number;
  }): Promise<any> {
    return this.request('/print-job-cost-calculations/', {
      method: 'POST',
      body: JSON.stringify({
        line_items: [
          {
            page_count: params.pageCount,
            pod_package_id: 'LULU_PERFECT_BIND_6x9',
            quantity: params.quantity,
            interior_print_file_url: params.interiorFileId,
            cover_print_file_url: params.coverFileId,
          }
        ]
      })
    });
  }

  /**
 * 🔍 Valider un fichier intérieur
 */
async validateInterior(
  fileUrl: string,
  podPackageId?: string
): Promise<{ id: string; status: string }> {
  console.log('🔍 Validation intérieur:', fileUrl);
  
  const payload: any = {
    interior_file_url: fileUrl
  };
  
  if (podPackageId) {
    payload.pod_package_id = podPackageId;
  }
  
  return this.request('/interior-files/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * 🔍 Valider un fichier de couverture
 */
async validateCover(
  fileUrl: string,
  podPackageId: string,
  interiorPageCount: number
): Promise<{ id: string; status: string }> {
  console.log('🔍 Validation couverture:', fileUrl);
  
  return this.request('/cover-files/', {
    method: 'POST',
    body: JSON.stringify({
      cover_file_url: fileUrl,
      pod_package_id: podPackageId,
      interior_page_count: interiorPageCount
    })
  });
}

/**
 * 📊 Vérifier le statut de validation d'un fichier
 */
async getValidationStatus(
  validationId: string,
  type: 'interior' | 'cover'
): Promise<any> {
  const endpoint = type === 'interior' 
    ? `/interior-files/${validationId}/` 
    : `/cover-files/${validationId}/`;
    
  return this.request(endpoint, { method: 'GET' });
}

  /**
   * 🛒 Créer une commande
   */
  async createOrder(params: {
    interiorFileId: string;
    coverFileId: string;
    pageCount: number;
    quantity: number;
    shippingAddress: {
      name: string;
      street1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  }): Promise<{ id: string; status: string }> {
    return this.request('/print-jobs/', {
      method: 'POST',
      body: JSON.stringify({
        line_items: [
          {
            page_count: params.pageCount,
            pod_package_id: 'LULU_PERFECT_BIND_6x9',
            quantity: params.quantity,
            interior_print_file_url: params.interiorFileId,
            cover_print_file_url: params.coverFileId,
          }
        ],
        shipping_address: params.shippingAddress,
        shipping_level: 'GROUND',
      })
    });
  }

  /**
   * 📦 Récupérer le statut d'une commande
   */
  async getOrderStatus(orderId: string): Promise<any> {
    return this.request(`/print-jobs/${orderId}/`, { method: 'GET' });
  }

  /**
   * 📋 Récupérer toutes les commandes
   */
  async getOrders(limit = 20): Promise<any[]> {
    const data = await this.request(`/print-jobs/?limit=${limit}`, {
      method: 'GET'
    }) as any;
    // L'API Lulu retourne un objet avec "results" qui contient le tableau
    return data.results || [];
  }
}

// Export d'une instance singleton
export const luluClient = new LuluClient();