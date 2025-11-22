"use client";

import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { Image as ImageKitImage, type IKImageProps } from "@imagekit/next";
import type { Transformation } from "@imagekit/javascript";

import { imageKitConfig } from "@/lib/imagekit";

type ImageKitExtras = Partial<
  Pick<
    IKImageProps,
    | "queryParameters"
    | "responsive"
    | "transformation"
    | "transformationPosition"
    | "urlEndpoint"
  >
>;

export type AppImageProps = NextImageProps & ImageKitExtras;

export default function AppImage(props: AppImageProps) {
  const normalizeSrc = (rawSrc: string) => {
    const base = imageKitConfig.urlEndpoint;

    // If src already includes our endpoint, strip it to let ImageKit handle transformations.
    if (base && rawSrc.startsWith(base)) {
      const withoutBase = rawSrc.slice(base.length);
      return withoutBase.startsWith("/") ? withoutBase : `/${withoutBase}`;
    }

    // If absolute URL to another domain, keep as-is.
    if (rawSrc.startsWith("http://") || rawSrc.startsWith("https://")) {
      return rawSrc;
    }

    // Ensure leading slash for relative paths.
    return rawSrc.startsWith("/") ? rawSrc : `/${rawSrc}`;
  };

  const {
    transformation,
    transformationPosition,
    queryParameters,
    responsive,
    urlEndpoint,
    ...nextImageProps
  } = props;

  const {
    enabled,
    urlEndpoint: defaultEndpoint,
    transformationPosition: defaultPosition,
  } = imageKitConfig;
  const isStringSrc = typeof props.src === "string";

  const normalizedStringSrc = isStringSrc
    ? normalizeSrc(props.src as string)
    : null;
  const finalSrc: typeof props.src = normalizedStringSrc ?? props.src;
  const shouldUseImageKit = enabled && defaultEndpoint && normalizedStringSrc;

  const hasCustomTransformation =
    Array.isArray(transformation) && transformation.length > 0;
  const defaultTransformation: Transformation[] = [{ format: "auto" }];
  const effectiveTransformation: Transformation[] | undefined =
    shouldUseImageKit && !hasCustomTransformation
      ? defaultTransformation
      : transformation;

  const shouldUnoptimize =
    !shouldUseImageKit && process.env.NODE_ENV !== "production";

  if (!shouldUseImageKit) {
    return (
      <NextImage
        {...nextImageProps}
        src={finalSrc}
        unoptimized={shouldUnoptimize}
      />
    );
  }

  return (
    <ImageKitImage
      {...nextImageProps}
      src={normalizedStringSrc}
      urlEndpoint={urlEndpoint ?? defaultEndpoint}
      transformation={effectiveTransformation}
      transformationPosition={transformationPosition ?? defaultPosition}
      queryParameters={queryParameters}
      responsive={responsive}
    />
  );
}
