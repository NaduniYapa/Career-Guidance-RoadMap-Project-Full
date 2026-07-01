export class ApiError extends Error {
  constructor(status, message, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

class ApiClient {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    };
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData;
        try {
          errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          
          // If there are validation details, include them in the error message
          if (errorData.details && Array.isArray(errorData.details)) {
            const validationErrors = errorData.details
              .map(detail => `${detail.path?.join('.') || 'field'}: ${detail.message}`)
              .join('; ');
            errorMessage = `${errorMessage} - ${validationErrors}`;
          }
        } catch {}
        throw new ApiError(response.status, errorMessage, errorData);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) return {};
      return response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  get(endpoint, options)           { return this.request(endpoint, { ...options, method: 'GET' }); }
  post(endpoint, body, options)    { return this.request(endpoint, { ...options, method: 'POST', body }); }
  put(endpoint, body, options)     { return this.request(endpoint, { ...options, method: 'PUT', body }); }
  patch(endpoint, body, options)   { return this.request(endpoint, { ...options, method: 'PATCH', body }); }
  delete(endpoint, options)        { return this.request(endpoint, { ...options, method: 'DELETE' }); }
}

export const apiClient = new ApiClient();
export default apiClient;
