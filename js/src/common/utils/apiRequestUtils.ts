import app from 'flarum/common/app';

/**
 * Standardized API request configuration
 */
interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Standardized error response structure
 */
interface ApiError {
  message: string;
  errors?: Array<{
    detail: string;
    source?: {
      pointer?: string;
      parameter?: string;
    };
  }>;
  status?: number;
  code?: string;
}

/**
 * API request options for different operation types
 */
interface ApiRequestOptions {
  showSuccessAlert?: boolean;
  showErrorAlert?: boolean;
  successMessage?: string;
  errorMessage?: string;
  validateResponse?: (response: any) => boolean;
  transformResponse?: (response: any) => any;
  onSuccess?: (response: any) => void;
  onError?: (error: ApiError) => void;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_HEADERS = {
  'Content-Type': 'application/vnd.api+json',
  'Accept': 'application/vnd.api+json'
};

/**
 * Build complete request configuration
 */
function buildRequestConfig(config: ApiRequestConfig) {
  const { method, endpoint, body, params, headers, timeout } = config;
  
  const fullUrl = endpoint.startsWith('http') 
    ? endpoint 
    : `${app.forum.attribute('apiUrl')}${endpoint}`;

  const requestConfig: any = {
    method,
    url: fullUrl,
    headers: { ...DEFAULT_HEADERS, ...headers },
    timeout: timeout || DEFAULT_TIMEOUT
  };

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    requestConfig.body = body;
  }

  if (params && method === 'GET') {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlParams.append(key, String(value));
      }
    });
    requestConfig.url += `?${urlParams.toString()}`;
  }

  return requestConfig;
}

/**
 * Parse and standardize error responses
 */
function parseError(error: any): ApiError {
  // Handle network/timeout errors
  if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
    return {
      message: app.translator.trans('core.lib.error.network_error').toString(),
      status: 0
    };
  }

  // Handle Flarum API errors
  if (error && error.response) {
    try {
      const response = typeof error.response === 'string' 
        ? JSON.parse(error.response) 
        : error.response;
      
      if (response.errors && Array.isArray(response.errors)) {
        return {
          message: response.errors[0].detail || 'API error occurred',
          errors: response.errors,
          status: error.status
        };
      }
    } catch {
      // If parsing fails, treat as HTML error page
      if (error.response.includes('<b>Fatal error</b>') || 
          error.response.includes('<!DOCTYPE')) {
        return {
          message: app.translator.trans('core.lib.error.generic_error').toString(),
          status: error.status || 500
        };
      }
    }
  }

  // Handle direct error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      status: (error as any).status
    };
  }

  // Fallback for unknown errors
  return {
    message: app.translator.trans('core.lib.error.generic_error').toString(),
    status: 500
  };
}

/**
 * Generic API request method
 */
export async function apiRequest<T = any>(
  config: ApiRequestConfig, 
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    showSuccessAlert = false,
    showErrorAlert = true,
    successMessage,
    errorMessage,
    validateResponse,
    transformResponse,
    onSuccess,
    onError
  } = options;

  try {
    const requestConfig = buildRequestConfig(config);
    const response = await app.request(requestConfig);
    
    // Validate response if validator provided
    if (validateResponse && !validateResponse(response)) {
      throw new Error('Response validation failed');
    }

    // Transform response if transformer provided
    const finalResponse = transformResponse ? transformResponse(response) : response;

    // Show success alert if requested
    if (showSuccessAlert && successMessage) {
      app.alerts.show({ type: 'success', dismissible: true }, successMessage);
    }

    // Execute success callback
    if (onSuccess) {
      onSuccess(finalResponse);
    }

    return finalResponse;
  } catch (error) {
    const apiError = parseError(error);
    
    // Execute error callback
    if (onError) {
      onError(apiError);
    }

    // Show error alert if requested
    if (showErrorAlert) {
      const message = errorMessage || apiError.message || 'An error occurred';
      app.alerts.show({ type: 'error', dismissible: true }, message);
    }

    throw apiError;
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
  endpoint: string, 
  params?: Record<string, any>, 
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequest<T>({ method: 'GET', endpoint, params }, options);
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  endpoint: string, 
  body?: any, 
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequest<T>({ method: 'POST', endpoint, body }, options);
}

/**
 * PATCH request helper
 */
export async function apiPatch<T = any>(
  endpoint: string, 
  body?: any, 
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequest<T>({ method: 'PATCH', endpoint, body }, options);
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequest<T>({ method: 'DELETE', endpoint }, options);
}

/**
 * Platform-specific API helpers
 */
export const PlatformAPI = {
  /**
   * Load withdrawal platforms
   */
  async loadWithdrawalPlatforms(params?: Record<string, any>) {
    return apiGet('/withdrawal-platforms', params, {
      errorMessage: app.translator.trans('withdrawal.admin.platforms.load_error').toString(),
      transformResponse: (response) => {
        app.store.pushPayload(response);
        return app.store.all('withdrawal-platforms');
      }
    });
  },

  /**
   * Create withdrawal platform
   */
  async createWithdrawalPlatform(data: any) {
    return apiPost('/withdrawal-platforms', { data }, {
      showSuccessAlert: true,
      successMessage: app.translator.trans('withdrawal.admin.platforms.add_success').toString(),
      errorMessage: app.translator.trans('withdrawal.admin.platforms.add_error').toString(),
      onSuccess: (response) => {
        app.store.pushPayload(response);
      }
    });
  }
};

/**
 * Request-specific API helpers
 */
export const RequestAPI = {
  /**
   * Load withdrawal requests
   */
  async loadWithdrawalRequests(params?: Record<string, any>) {
    return apiGet('/withdrawal-requests', { include: 'user,platform', ...params }, {
      errorMessage: app.translator.trans('withdrawal.admin.requests.load_error').toString(),
      transformResponse: (response) => {
        app.store.pushPayload(response);
        return Array.isArray(response.data) 
          ? response.data.filter((r: any) => r !== null)
          : (response.data ? [response.data] : []);
      }
    });
  }
};

// For backward compatibility, create an object with the same interface as the class
export const ApiRequestUtils = {
  PlatformAPI,
  RequestAPI
};