"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  acceptAllConsent,
  defaultConsentCategories,
  hasConsentChoice,
  readConsentCookie,
  rejectNonEssentialConsent,
  saveConsentChoices,
} from "@/lib/consent/storage";
import type { ConsentCategories, ConsentChoices } from "@/lib/consent/types";

import { CookieBanner } from "./cookie-banner";
import { CookiePreferencesDialog } from "./cookie-preferences-dialog";
import { GoogleAnalyticsLoader } from "./google-analytics";
import { SentryClientLoader } from "./sentry-client";

type ConsentContextValue = {
  consent: ConsentCategories;
  showBanner: boolean;
  preferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  saveConsent: (choices: ConsentChoices) => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within ConsentProvider.");
  }
  return context;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentCategories>(defaultConsentCategories);
  const [showBanner, setShowBanner] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const record = readConsentCookie();
    if (record) {
      setConsent(record.categories);
      setShowBanner(false);
    } else {
      setShowBanner(!hasConsentChoice());
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((record: ReturnType<typeof acceptAllConsent>) => {
    setConsent(record.categories);
    setShowBanner(false);
    setPreferencesOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    persist(acceptAllConsent());
  }, [persist]);

  const rejectNonEssential = useCallback(() => {
    persist(rejectNonEssentialConsent());
  }, [persist]);

  const saveConsent = useCallback(
    (choices: ConsentChoices) => {
      persist(saveConsentChoices(choices));
    },
    [persist],
  );

  const openPreferences = useCallback(() => {
    setPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setPreferencesOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      consent,
      showBanner,
      preferencesOpen,
      openPreferences,
      closePreferences,
      saveConsent,
      acceptAll,
      rejectNonEssential,
    }),
    [
      consent,
      showBanner,
      preferencesOpen,
      openPreferences,
      closePreferences,
      saveConsent,
      acceptAll,
      rejectNonEssential,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>
      {hydrated && consent.analytics ? <GoogleAnalyticsLoader /> : null}
      {hydrated && consent.monitoring ? <SentryClientLoader /> : null}
      {children}
      {hydrated ? <CookieBanner /> : null}
      {hydrated ? (
        <CookiePreferencesDialog
          open={preferencesOpen}
          onOpenChange={setPreferencesOpen}
        />
      ) : null}
    </ConsentContext.Provider>
  );
}
