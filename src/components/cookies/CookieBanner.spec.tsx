import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import CookieBanner from "./CookieBanner";

const originalDocument = globalThis.document;

afterEach(() => {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: originalDocument,
  });
});

describe("CookieBanner hydration", () => {
  it("keeps SSR markup stable when browser globals are present", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: undefined,
    });
    const serverMarkup = renderToString(<CookieBanner />);

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { cookie: "" },
    });
    const firstBrowserMarkup = renderToString(<CookieBanner />);

    expect(firstBrowserMarkup).toBe(serverMarkup);
  });
});
