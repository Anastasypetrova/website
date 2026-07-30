import { createContext, useContext, type ReactNode } from 'react';

export type Lang = 'ru' | 'en';

export interface Bi {
  ru: ReactNode;
  en: ReactNode;
}

export const LangContext = createContext<Lang>('ru');

export function useLang(): Lang {
  return useContext(LangContext);
}

/** Renders one of two language variants depending on the current language context. */
export function T({ ru, en }: Bi) {
  const lang = useLang();
  return <>{lang === 'en' ? en : ru}</>;
}

export function pick<A>(lang: Lang, ru: A, en: A): A {
  return lang === 'en' ? en : ru;
}
