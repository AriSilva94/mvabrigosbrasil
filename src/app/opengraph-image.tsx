/* eslint-disable @next/next/no-img-element */
import { promises as fs } from "fs";
import path from "path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function loadFont(filePath: string) {
  const absolutePath = path.join(process.cwd(), "src", "app", filePath);
  const buffer = await fs.readFile(absolutePath);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
}

const geistBold = loadFont(path.join("fonts", "geist-sans", "Geist-700.ttf"));
const geistMedium = loadFont(path.join("fonts", "geist-sans", "Geist-500.ttf"));
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteHost = (() => {
  try {
    return new URL(siteUrl).host;
  } catch {
    return "mvabrigosbrasil.com.br";
  }
})();
const logoUrl = `${siteUrl}/assets/img/logo-medicina-de-abrigos-brasil.svg`;

export default async function OpengraphImage() {
  const [boldFont, mediumFont] = await Promise.all([geistBold, geistMedium]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "stretch",
          padding: "72px",
          position: "relative",
          color: "#f7f9f4",
          background:
            "linear-gradient(135deg, #0c6a48 0%, #108259 45%, #5e782a 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.08), transparent 32%), radial-gradient(circle at 82% 0%, rgba(255,255,255,0.12), transparent 38%), radial-gradient(circle at 60% 82%, rgba(0,0,0,0.16), transparent 42%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: "38px",
            borderRadius: "32px",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05) inset",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "760px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "12px 18px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.12)",
              fontSize: "22px",
              letterSpacing: "0.4px",
            }}
          >
            <img
              src={logoUrl}
              alt="Medicina de Abrigos Brasil"
              width={210}
              height={68}
              style={{
                display: "block",
                objectFit: "contain",
                maxHeight: "68px",
              }}
            />
          </div>

          <div
            style={{
              fontSize: "64px",
              lineHeight: 1.05,
              fontWeight: 700,
              textShadow: "0 10px 40px rgba(0,0,0,0.25)",
            }}
          >
            Mapeamento e Banco de Dados de Abrigos de Animais no Brasil.
          </div>

          <div
            style={{
              fontSize: "28px",
              lineHeight: 1.3,
              color: "rgba(247,249,244,0.9)",
              maxWidth: "720px",
            }}
          >
            Transparência sobre abrigos e lares temporários, biblioteca técnica
            e apoio para proteger animais em todo o Brasil.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "4px",
                borderRadius: "999px",
                background: "#f2a400",
                boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
              }}
            />
            <div
              style={{
                fontSize: "24px",
                letterSpacing: "0.5px",
                color: "rgba(247,249,244,0.9)",
              }}
            >
              {siteHost}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            position: "relative",
            width: "320px",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "8px 0",
            gap: "12px",
          }}
        >
          <div
            style={{
              padding: "18px 16px",
              borderRadius: "18px",
              background: "rgba(12, 32, 22, 0.25)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
              backdropFilter: "blur(4px)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                color: "rgba(247,249,244,0.7)",
              }}
            >
              Destaques
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "22px",
              }}
            >
              <div>• Transparência de dados</div>
              <div>• Biblioteca técnica</div>
              <div>• Rede de voluntários</div>
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              borderRadius: "18px",
              background: "rgba(242, 164, 0, 0.12)",
              border: "1px solid rgba(242,164,0,0.45)",
              color: "#fdfcf7",
              fontSize: "20px",
              lineHeight: 1.3,
              boxShadow: "0 10px 34px rgba(0,0,0,0.18)",
            }}
          >
            Cuidando de quem protege milhares de animais em todo o país.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: boldFont,
          style: "normal",
          weight: 700,
        },
        {
          name: "Geist",
          data: mediumFont,
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}
