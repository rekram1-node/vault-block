export class Jwt {
  raw: string;
  body?: JwtPayload;

  constructor(token: string) {
    this.raw = token;
    const body = token.split(".")?.[1];
    if (!body) {
      return;
    }

    this.body = JSON.parse(atob(body)) as JwtPayload;
  }
}

export type JwtHeader = {
  alg: string;
  typ: string;
};

export type TokenType = "access_token" | "refresh_token";

export type JwtPayload = {
  sub: string;
  token: string;
  tokenType?: TokenType;

  iat?: number;
  exp?: number;

  aud: string | string[];
  iss: string;
};
