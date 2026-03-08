import type { IUser } from "../../auth/auth.types";

const ACCESS_TOKEN_KEY: string = 'access_token';
const USER_KEY: string = 'auth_user';

export interface IAuthStorage {
  isAuthenticated: boolean;
  setSession(token: string, user: IUser): void;
  getToken(): string | null;
  getUser(): IUser | null;
  clearSession(): void;
}

export class AuthStorage implements IAuthStorage {
  public setSession(token: string, user: IUser): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  public getUser(): IUser | null {
    const rawUser: string | null = localStorage.getItem(USER_KEY);

    if (rawUser === null) {
      return null;
    }

    try {
      const parsedUser: unknown = JSON.parse(rawUser);

      if (this.isUser(parsedUser)) {
        return parsedUser;
      }

      return null;
    } catch {
      return null;
    }
  }

  public get isAuthenticated(): boolean {
    const token: string | null = this.getToken();
    return token !== null && token != 'undefined' && token.trim().length > 0;
  }

  public clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private isUser(value: unknown): value is IUser {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate: Record<string, unknown> = value as Record<string, unknown>;

    return (
      typeof candidate.login === 'string' &&
      typeof candidate.name === 'string' &&
      typeof candidate.email === 'string'
    );
  }
}
