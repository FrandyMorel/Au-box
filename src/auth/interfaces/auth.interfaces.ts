export interface JwtPayload {
  sub: number;
  email: string;
  department: string;
}

export interface AuthPayload {
  id: number;
  email: string;
  name: string;
  department: string;
}

export interface RequestWithUser {
  user: JwtPayload;
}
