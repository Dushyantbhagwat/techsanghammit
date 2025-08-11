export interface User {
  id: string;
  email: string;
  displayName?: string;
  userName?: string;
  preferences: {
    notifications: boolean;
  };
  createdAt: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}