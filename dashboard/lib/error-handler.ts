'use client';

import { toast } from '@/components/ui/toast';

/**
 * Generic user-friendly fallback error message
 */
export const GENERIC_ERROR_MESSAGE = 'An unexpected error occurred. Please try again later.';

/**
 * Sanitizes any raw or backend error message into a safe, generic message.
 * Ensures no internal error details (e.g. coin errors, database traces, or raw exceptions) are exposed.
 */
export function getGenericErrorMessage(error: any, customFallback?: string): string {
  if (!error) {
    return customFallback || GENERIC_ERROR_MESSAGE;
  }

  const rawMessage = typeof error === 'string'
    ? error
    : error?.response?.data?.message || error?.message || '';

  const lowerMsg = rawMessage.toLowerCase();

  // Filter out any coin, raw database, internal server, or sensitive error messages
  if (
    lowerMsg.includes('coin') ||
    lowerMsg.includes('sql') ||
    lowerMsg.includes('syntaxerror') ||
    lowerMsg.includes('internal server error') ||
    lowerMsg.includes('exception') ||
    lowerMsg.includes('stack') ||
    lowerMsg.includes('undefined') ||
    lowerMsg.includes('null')
  ) {
    return customFallback || GENERIC_ERROR_MESSAGE;
  }

  // Handle specific standard status codes/scenarios gracefully
  if (lowerMsg.includes('network error') || lowerMsg.includes('econnrefused')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (lowerMsg.includes('401') || lowerMsg.includes('unauthorized') || lowerMsg.includes('invalid credentials')) {
    return 'Invalid email or password. Please try again.';
  }

  if (lowerMsg.includes('403') || lowerMsg.includes('forbidden')) {
    return 'You do not have permission to perform this action.';
  }

  if (lowerMsg.includes('404') || lowerMsg.includes('not found')) {
    return 'The requested resource was not found.';
  }

  // If there's a clean user-friendly string (without technical noise), return it or generic fallback
  if (rawMessage && rawMessage.length < 100 && !/[{}[\]\\]/.test(rawMessage)) {
    return rawMessage;
  }

  return customFallback || GENERIC_ERROR_MESSAGE;
}

/**
 * Global Error Handler function
 * Displays a generic, sanitized error toast at the TOP-RIGHT corner
 * using the base-ui/react toast from @/components/ui/toast.
 */
export function handleGlobalError(error: any, customFallback?: string): string {
  const safeMessage = getGenericErrorMessage(error, customFallback);

  toast.add({
    title: safeMessage,
    type: 'error',
    timeout: 4000,
  });

  return safeMessage;
}
