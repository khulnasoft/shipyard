// Basic TypeScript type definitions for the project

// Example interface for a user
export interface User {
  id: string;
  username: string;
  email: string;
  created_at?: Date;
}

// Example type for application settings
export type AppSettings = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
};
