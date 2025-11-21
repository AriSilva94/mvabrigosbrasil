"use client";

import type { PropsWithChildren } from "react";
import { ImageKitProvider } from "@imagekit/next";

import { imageKitConfig } from "@/lib/imagekit";

export default function AppImageProvider({ children }: PropsWithChildren) {
  if (!imageKitConfig.enabled || !imageKitConfig.urlEndpoint) {
    return <>{children}</>;
  }

  return (
    <ImageKitProvider
      urlEndpoint={imageKitConfig.urlEndpoint}
      transformationPosition={imageKitConfig.transformationPosition}
    >
      {children}
    </ImageKitProvider>
  );
}
