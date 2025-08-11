import { User, UserCredentials } from '../types/user';

const VALID_CREDENTIALS = {
  email: 'dbit@gmail.com',
  password: 'dbit'
};

export const authService = {
  async signup(email: string, password: string, name: string): Promise<User> {
    try {
      // In a real app, this would create a new user
      // For demo, just return a mock user
      const user: User = {
        id: '2',
        email,
        displayName: name,
        preferences: { notifications: true },
        createdAt: new Date()
      };
      sessionStorage.setItem('userEmail', email);
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      // In a real app, this would update the user in the database
      // For demo, just return the updated user
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found');
      }
      const updatedUser = {
        ...currentUser,
        ...data,
      };
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  async login({ email, password }: UserCredentials): Promise<User> {
    try {
      // Validate credentials
      if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
        const user: User = {
          id: '1',
          email: email,
          displayName: 'DBIT User',
          preferences: { notifications: true },
          createdAt: new Date()
        };
        
        // Store auth state in session
        sessionStorage.setItem('userEmail', email);
        return user;
      }
      throw new Error('Invalid email or password');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const email = sessionStorage.getItem('userEmail');
    if (email === VALID_CREDENTIALS.email) {
      return {
        id: '1',
        email: email,
        displayName: 'DBIT User',
        preferences: { notifications: true },
        createdAt: new Date()
      };
    }
    return null;
  },

  async signOut(): Promise<void> {
    sessionStorage.removeItem('userEmail');
  }
};