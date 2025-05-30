import { env } from '@/config/env';

export interface BitwardenCredential {
  id?: string;
  name: string;
  username: string;
  password: string;
  uri?: string;
  notes?: string;
  folderId?: string;
}

export interface BitwardenVault {
  id: string;
  name: string;
  organizationId?: string;
}

class BitwardenClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.baseUrl = env.bitwardenApiUrl || 'https://api.bitwarden.com';
    this.clientId = env.bitwardenClientId;
    this.clientSecret = env.bitwardenClientSecret;
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/identity/connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'api',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Bitwarden auth failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;

      // Set expiry to 5 minutes before actual expiry for safety
      const expiryInSeconds = data.expires_in || 3600;
      this.tokenExpiry = new Date(Date.now() + (expiryInSeconds - 300) * 1000);

      return this.accessToken as string;
    } catch (error) {
      console.error('Failed to get Bitwarden access token:', error);
      throw new Error('Bitwarden authentication failed');
    }
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bitwarden API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async createCredential(credential: BitwardenCredential): Promise<string> {
    try {
      const payload = {
        type: 1, // Login type
        name: credential.name,
        notes: credential.notes,
        login: {
          username: credential.username,
          password: credential.password,
          uris: credential.uri ? [{ uri: credential.uri }] : [],
        },
        folderId: credential.folderId,
      };

      const result = await this.makeRequest('/api/ciphers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return result.Id;
    } catch (error) {
      console.error('Failed to create Bitwarden credential:', error);
      throw new Error('Failed to store credential securely');
    }
  }

  async getCredential(credentialId: string): Promise<BitwardenCredential | null> {
    try {
      const result = await this.makeRequest(`/api/ciphers/${credentialId}`);

      if (result.Type !== 1) {
        throw new Error('Invalid credential type');
      }

      return {
        id: result.Id,
        name: result.Name,
        username: result.Login.Username,
        password: result.Login.Password,
        uri: result.Login.Uris?.[0]?.Uri,
        notes: result.Notes,
        folderId: result.FolderId,
      };
    } catch (error) {
      console.error('Failed to get Bitwarden credential:', error);
      return null;
    }
  }

  async updateCredential(credentialId: string, credential: Partial<BitwardenCredential>): Promise<void> {
    try {
      // First get the existing credential
      const existing = await this.getCredential(credentialId);
      if (!existing) {
        throw new Error('Credential not found');
      }

      const payload = {
        type: 1,
        name: credential.name || existing.name,
        notes: credential.notes || existing.notes,
        login: {
          username: credential.username || existing.username,
          password: credential.password || existing.password,
          uris: credential.uri || existing.uri ? [{ uri: credential.uri || existing.uri }] : [],
        },
        folderId: credential.folderId || existing.folderId,
      };

      await this.makeRequest(`/api/ciphers/${credentialId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to update Bitwarden credential:', error);
      throw new Error('Failed to update credential');
    }
  }

  async deleteCredential(credentialId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/ciphers/${credentialId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete Bitwarden credential:', error);
      throw new Error('Failed to delete credential');
    }
  }

  async generatePassword(length: number = 16): Promise<string> {
    try {
      const result = await this.makeRequest('/api/tools/password', {
        method: 'POST',
        body: JSON.stringify({
          length,
          uppercase: true,
          lowercase: true,
          numbers: true,
          special: true,
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSpecial: 1,
        }),
      });

      return result.data;
    } catch (error) {
      console.error('Failed to generate password:', error);
      // Fallback to local generation
      return this.generatePasswordFallback(length);
    }
  }

  private generatePasswordFallback(length: number): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = uppercase + lowercase + numbers + special;

    let password = '';

    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password.split("").sort(() => 0.5 - Math.random()).join("")
  }
}

export const bitwardenClient = new BitwardenClient()