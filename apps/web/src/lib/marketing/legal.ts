export type LegalSection = {
  id: string;
  number: string;
  title: string;
  content: string[];
};

export type LegalDocument = {
  slug: string;
  title: string;
  lastUpdated: string;
  description: string;
  sections: LegalSection[];
};

export const legalDocuments: Record<string, LegalDocument> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    lastUpdated: "June 2026",
    description: "How Arco collects, uses, and protects your personal information.",
    sections: [
      {
        id: "introduction",
        number: "1",
        title: "Introduction",
        content: [
          "Arco Inc. (\"Arco\", \"we\", \"us\") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.",
          "By using Arco, you agree to the collection and use of information in accordance with this policy.",
        ],
      },
      {
        id: "information-we-collect",
        number: "2",
        title: "Information We Collect",
        content: [
          "Account information: name, email address, and password when you create an account.",
          "Usage data: projects, exports, feature usage, and interaction logs within the application.",
          "Payment information: processed by Polar; we do not store full credit card numbers.",
          "Content you upload: screen recordings and brand assets you provide for video generation.",
          "Technical data: IP address, browser type, device information, and pages visited when you use our site or when analytics or monitoring tools are enabled with your consent.",
        ],
      },
      {
        id: "how-we-use",
        number: "3",
        title: "How We Use Information",
        content: [
          "To provide, maintain, and improve the Arco service.",
          "To process payments and manage subscriptions.",
          "To send service-related communications and product updates.",
          "To detect, prevent, and address technical issues and abuse.",
          "To analyze product usage and measure marketing performance when you consent to analytics cookies.",
          "To diagnose client-side errors and performance issues when you consent to monitoring cookies.",
        ],
      },
      {
        id: "legal-bases",
        number: "4",
        title: "Legal Bases for Processing (GDPR)",
        content: [
          "Contract: processing needed to provide the Arco service you signed up for (account data, project content, billing).",
          "Consent: analytics cookies (Google Analytics) and client-side monitoring cookies (Sentry). You can withdraw consent at any time via Cookie settings.",
          "Legitimate interest: server-side error logging and security monitoring to keep the service reliable, fraud prevention, and product improvement that does not override your rights.",
          "Legal obligation: records we must keep for tax, accounting, or compliance purposes.",
        ],
      },
      {
        id: "data-retention",
        number: "5",
        title: "Data Retention",
        content: [
          "We retain account data for as long as your account is active. Project files and exports are retained according to your plan limits and deleted within 30 days of account closure.",
          "Analytics data retained by Google is governed by Google's settings and our configuration. Sentry retains error events according to our Sentry project retention settings.",
          "You may request deletion of your data at any time by contacting privacy@arco.app.",
        ],
      },
      {
        id: "third-party",
        number: "6",
        title: "Third-Party Services",
        content: [
          "Polar — payment processing and subscription billing.",
          "Cloud infrastructure providers — hosting and storage.",
          "Google Analytics — website and product usage analytics (only with your consent).",
          "Sentry — error and performance monitoring. Server-side monitoring runs to maintain reliability; client-side monitoring runs only with your consent.",
          "Each processor is bound by their privacy policies and, where applicable, a Data Processing Agreement (DPA) with Arco.",
        ],
      },
      {
        id: "international-transfers",
        number: "7",
        title: "International Transfers",
        content: [
          "Arco is based in the United States. If you access Arco from the European Economic Area, UK, or other regions with data protection laws, your information may be transferred to the US and other countries where our processors operate.",
          "We rely on appropriate safeguards such as Standard Contractual Clauses and processor DPAs for cross-border transfers.",
        ],
      },
      {
        id: "your-rights",
        number: "8",
        title: "Your Privacy Rights",
        content: [
          "Depending on your location, you may have the right to access, correct, delete, or export your personal data; restrict or object to certain processing; and withdraw consent for analytics and monitoring cookies.",
          "To exercise these rights, email privacy@arco.app. We will respond within the timeframe required by applicable law.",
          "You may also lodge a complaint with your local data protection authority.",
          "To withdraw cookie consent, use Cookie settings in the site footer or account menu at any time.",
        ],
      },
      {
        id: "security",
        number: "9",
        title: "Security",
        content: [
          "We implement industry-standard security measures including encryption in transit and at rest, access controls, and regular security reviews.",
          "Error monitoring data is scrubbed to remove emails, tokens, and user-generated recording paths where possible.",
        ],
      },
      {
        id: "contact",
        number: "10",
        title: "Contact Information",
        content: [
          "For privacy-related inquiries, contact us at privacy@arco.app or write to Arco Inc., 548 Market St, San Francisco, CA 94104.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    lastUpdated: "June 2026",
    description: "The terms governing your use of Arco.",
    sections: [
      {
        id: "acceptance",
        number: "1",
        title: "Acceptance of Terms",
        content: [
          "By accessing or using Arco, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.",
        ],
      },
      {
        id: "service",
        number: "2",
        title: "Description of Service",
        content: [
          "Arco provides a cloud-based platform for transforming screen recordings into motion-designed promotional videos. Features and availability may change as we improve the product.",
        ],
      },
      {
        id: "accounts",
        number: "3",
        title: "Accounts",
        content: [
          "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate registration information.",
        ],
      },
      {
        id: "billing",
        number: "4",
        title: "Billing and Subscriptions",
        content: [
          "Paid plans are billed in advance on a monthly or annual basis. Subscriptions renew automatically unless cancelled before the renewal date. Refunds are handled according to our Refund Policy.",
        ],
      },
      {
        id: "content",
        number: "5",
        title: "Your Content",
        content: [
          "You retain ownership of content you upload. By uploading content, you grant Arco a limited license to process, store, and render it solely to provide the service.",
        ],
      },
      {
        id: "acceptable-use",
        number: "6",
        title: "Acceptable Use",
        content: [
          "You may not use Arco to create content that is illegal, infringes intellectual property rights, or violates the rights of others. We reserve the right to suspend accounts that violate these terms.",
        ],
      },
      {
        id: "liability",
        number: "7",
        title: "Limitation of Liability",
        content: [
          "Arco is provided \"as is\" without warranties. To the maximum extent permitted by law, Arco shall not be liable for indirect, incidental, or consequential damages.",
        ],
      },
      {
        id: "contact-terms",
        number: "8",
        title: "Contact",
        content: [
          "Questions about these terms? Contact legal@arco.app.",
        ],
      },
    ],
  },
  cookies: {
    slug: "cookies",
    title: "Cookie Policy",
    lastUpdated: "June 2026",
    description: "How Arco uses cookies and similar technologies.",
    sections: [
      {
        id: "what-are-cookies",
        number: "1",
        title: "What Are Cookies",
        content: [
          "Cookies are small text files stored on your device when you visit a website. Similar technologies include local storage and session identifiers used by analytics or monitoring tools.",
          "We use cookies to operate Arco, remember your preferences, and — with your consent — understand usage and diagnose errors.",
        ],
      },
      {
        id: "consent",
        number: "2",
        title: "How We Ask for Consent",
        content: [
          "When you first visit Arco, a cookie banner lets you accept all cookies, reject non-essential cookies, or customize your choices.",
          "Non-essential cookies are blocked until you opt in. You can change or withdraw consent at any time using Cookie settings in the site footer or account menu.",
        ],
      },
      {
        id: "cookie-categories",
        number: "3",
        title: "Cookie Categories",
        content: [
          "Essential — required for sign-in, security, and storing your consent choice. Always active.",
          "Functional — remember UI preferences such as sidebar layout. Optional.",
          "Analytics — help us measure traffic and product usage via Google Analytics. Optional.",
          "Monitoring — client-side error and performance reporting via Sentry. Optional.",
        ],
      },
      {
        id: "cookies-we-use",
        number: "4",
        title: "Cookies and Storage We Use",
        content: [
          "arco_consent — Arco — stores your cookie preferences — up to 12 months — Essential.",
          "authjs.session-token / __Secure-authjs.session-token — Arco — keeps you signed in — session or as configured — Essential.",
          "sidebar_state — Arco — remembers dashboard sidebar open/closed state — 7 days — Functional (only if enabled).",
          "_ga — Google — distinguishes users for analytics — 2 years — Analytics (only if enabled).",
          "_ga_* — Google — persists session state for analytics — 2 years — Analytics (only if enabled).",
          "sentry-* — Sentry — supports error monitoring sessions — session / as configured — Monitoring (only if enabled).",
        ],
      },
      {
        id: "managing-cookies",
        number: "5",
        title: "Managing Cookies",
        content: [
          "Use Cookie settings on our site to enable or disable optional categories.",
          "You can also control cookies through your browser settings. Disabling essential cookies may affect your ability to use Arco.",
          "Rejecting analytics or monitoring cookies does not affect core product functionality.",
        ],
      },
    ],
  },
};

export function getLegalDocument(slug: string): LegalDocument | undefined {
  return legalDocuments[slug];
}
