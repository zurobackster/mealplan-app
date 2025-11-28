import { SessionOptions } from 'iron-session';
import { SessionData, defaultSession } from './types';

/**
 * Session configuration for iron-session
 */
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'meal-planner-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  },
};

/**
 * Type helper for session
 */
export type SessionRequest = {
  session: SessionData;
};

/**
 * Get default session data
 */
export function getDefaultSession(): SessionData {
  return { ...defaultSession };
}
