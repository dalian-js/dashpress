import { i18n, Messages } from "@lingui/core";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { GetStaticPropsContext, GetStaticPropsResult } from "next";
import languages from "./languages";

async function loadCatalog(locale: string) {
  if (process.env.NODE_ENV === "production") {
    const { messages } = await import(`./locales/${locale}`);
    return messages;
  }
  const { messages } = await import(`./locales/${locale}.po`);

  return messages;
}

export async function getStaticProps(
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<any>> {
  return {
    props: {
      translation: await loadCatalog(ctx.locale as string),
    },
  };
}

export function useLinguiInit(messages: Messages) {
  const router = useRouter();
  const locale = router.locale || router.defaultLocale!;
  const isClient = typeof window !== "undefined";

  if (!isClient && locale !== i18n.locale) {
    // there is single instance of i18n on the server
    i18n.loadAndActivate({ locale, messages });
  }
  if (isClient && !i18n.locale) {
    // first client render
    i18n.loadAndActivate({ locale, messages });
  }

  useEffect(() => {
    const localeDidChange = locale !== i18n.locale;
    if (localeDidChange) {
      i18n.loadAndActivate({ locale, messages });
    }
  }, [locale, messages]);

  return i18n;
}

export function getRTL(locale: string): {
  direction: "ltr" | "rtl";
  left: "right" | "left";
  right: "right" | "left";
} {
  const language = languages.find((lang) => {
    return lang.locale === locale;
  });

  if (!language) {
    return {
      direction: "ltr",
      left: "left",
      right: "right",
    };
  }

  return {
    direction: language.rtl ? "rtl" : "ltr",
    left: language.rtl ? "right" : "left",
    right: language.rtl ? "left" : "right",
  };
}
