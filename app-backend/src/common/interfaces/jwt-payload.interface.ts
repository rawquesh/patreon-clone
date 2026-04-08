export interface JwtPayload {
  sub: string; // userId
  email: string;
  iat?: number;
  exp?: number;
}
