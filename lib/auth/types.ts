/**
 * Session data stored in encrypted cookie
 */
export interface SessionData {
  userId: number;
  username: string;
  isLoggedIn: boolean;
}

/**
 * Default empty session
 */
export const defaultSession: SessionData = {
  userId: 0,
  username: '',
  isLoggedIn: false,
};
