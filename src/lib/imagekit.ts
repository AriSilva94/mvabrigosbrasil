type TransformationPosition = "path" | "query";

const envFlag =
  process.env.NEXT_PUBLIC_IMAGEKIT_ENABLED ??
  process.env.NEXT_PUBLIC_ENABLE_IMAGEKIT;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

const transformationPosition: TransformationPosition =
  process.env.NEXT_PUBLIC_IMAGEKIT_TRANSFORMATION_POSITION === "path"
    ? "path"
    : "query";

const canEnable = envFlag === "true" || (envFlag !== "false" && process.env.NODE_ENV === "production");

export const imageKitConfig: {
  enabled: boolean;
  urlEndpoint: string;
  transformationPosition: TransformationPosition;
} = {
  enabled: Boolean(urlEndpoint) && canEnable,
  urlEndpoint: urlEndpoint ?? "",
  transformationPosition,
};
