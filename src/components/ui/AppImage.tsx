"use client";

import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { Image as ImageKitImage, type IKImageProps } from "@imagekit/next";

import { imageKitConfig } from "@/lib/imagekit";

type ImageKitExtras = Partial<
  Pick<
    IKImageProps,
    "queryParameters" | "responsive" | "transformation" | "transformationPosition" | "urlEndpoint"
  >
>;

export type AppImageProps = NextImageProps & ImageKitExtras;

export default function AppImage(props: AppImageProps) {
  const {
    transformation,
    transformationPosition,
    queryParameters,
    responsive,
    urlEndpoint,
    ...nextImageProps
  } = props;

  const { enabled, urlEndpoint: defaultEndpoint, transformationPosition: defaultPosition } = imageKitConfig;
  const isStringSrc = typeof props.src === "string";
  const shouldUseImageKit = enabled && defaultEndpoint && isStringSrc;

  if (!shouldUseImageKit) {
    return <NextImage {...nextImageProps} src={props.src} unoptimized />;
  }

  return (
    <ImageKitImage
      {...nextImageProps}
      src={props.src as string}
      urlEndpoint={urlEndpoint ?? defaultEndpoint}
      transformation={transformation}
      transformationPosition={transformationPosition ?? defaultPosition}
      queryParameters={queryParameters}
      responsive={responsive}
    />
  );
}
