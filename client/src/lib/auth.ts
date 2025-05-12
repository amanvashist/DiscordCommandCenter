import { LoginCredentials, AuthResponse } from "@shared/schema";

// Helper for debugging
const logResponse = async (response: Response, operation: string) => {
  const clonedResponse = response.clone();
  let responseBody;
  try {
    responseBody = await clonedResponse.text();
    
    // Get important headers directly
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    console.log(`${operation} response:`, {
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
      headers: {
        'content-type': contentType,
        'content-length': contentLength
      }
    });
  } catch (e) {
    console.log(`Could not parse ${operation} response body`, e);
  }
};

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    console.log("Login request:", { 
      username: credentials.username,
      passwordLength: credentials.password?.length || 0
    });
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials),
      credentials: 'same-origin'
    });
    
    await logResponse(response, 'Login');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    console.log("Login success:", data);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during login');
  }
}

export async function logout(): Promise<void> {
  try {
    console.log("Logout request");
    
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });
    
    await logResponse(response, 'Logout');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Logout failed' }));
      throw new Error(errorData.message || 'Logout failed');
    }
    
    console.log("Logout success");
  } catch (error) {
    console.error("Logout error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during logout');
  }
}

export async function checkAuthStatus(): Promise<AuthResponse> {
  try {
    console.log("Auth status check request");
    
    const response = await fetch('/api/auth/status', {
      credentials: 'same-origin'
    });
    
    await logResponse(response, 'Auth status');
    
    if (!response.ok) {
      throw new Error('Failed to check auth status');
    }
    
    const data = await response.json();
    console.log("Auth status result:", data);
    return data;
  } catch (error) {
    console.error("Auth status check error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during auth check');
  }
}
