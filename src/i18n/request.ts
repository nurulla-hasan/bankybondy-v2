import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  const locale =
    cookieLocale && hasLocale(routing.locales, cookieLocale)
      ? cookieLocale
      : routing.defaultLocale;

  return {
    locale,
    messages: {
      Auth: (await import(`../../messages/${locale}/auth.json`)).default,
      Common: (await import(`../../messages/${locale}/common.json`)).default,
      Navbar: (await import(`../../messages/${locale}/navbar.json`)).default,
      Hero: (await import(`../../messages/${locale}/hero.json`)).default,
      DonateUs: (await import(`../../messages/${locale}/donate.json`)).default,
      Footer: (await import(`../../messages/${locale}/footer.json`)).default,
      Bonds: (await import(`../../messages/${locale}/bonds.json`)).default,
      Friends: (await import(`../../messages/${locale}/friends.json`)).default,
      Messages: (await import(`../../messages/${locale}/messages.json`)).default,
      People: (await import(`../../messages/${locale}/people.json`)).default,
      Profile: (await import(`../../messages/${locale}/profile.json`)).default,
      Chatting: (await import(`../../messages/${locale}/chatting.json`)).default,
    },
  };

});


