export class Jwt {
  raw: string;
  body: JwtPayload;

  constructor(token: string) {
    this.raw = token;
    const body = token.split(".")?.[1] ?? "";
    this.body = JSON.parse(atob(body)) as JwtPayload;
  }
}

export type JwtHeader = {
  alg: string;
  typ: string;
};

export type token_type = "access_token" | "refresh_token";

export type JwtPayload = {
  sub: string;
  token: string;
  token_type?: token_type;

  iat?: number;
  exp: number;

  aud: string | string[];
  iss: string;
};
