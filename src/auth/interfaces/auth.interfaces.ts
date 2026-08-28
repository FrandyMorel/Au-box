export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthPayload {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface RequestWithUser {
  user: JwtPayload;
}
