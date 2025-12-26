import OgImage, { contentType, size } from "./opengraph-image";

// Definimos o runtime aqui para o Next reconhecer sem re-export indireto.
export const runtime = "nodejs";

export { contentType, size };
export default OgImage;
