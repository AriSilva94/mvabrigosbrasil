// A API isenta do rate limit só as chamadas que trazem este segredo; sem ele,
// todo o SSR dividiria o limite por IP do container web.
export const INTERNAL_TOKEN_HEADER = "x-internal-api-token";

export function withInternalToken(headers: Headers): Headers {
  const token = process.env.INTERNAL_API_TOKEN;
  if (token) headers.set(INTERNAL_TOKEN_HEADER, token);
  return headers;
}
