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
          "Payment information: processed by Stripe; we do not store full credit card numbers.",
          "Content you upload: screen recordings and brand assets you provide for video generation.",
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
        ],
      },
      {
        id: "data-retention",
        number: "4",
        title: "Data Retention",
        content: [
          "We retain account data for as long as your account is active. Project files and exports are retained according to your plan limits and deleted within 30 days of account closure.",
          "You may request deletion of your data at any time by contacting privacy@arco.app.",
        ],
      },
      {
        id: "third-party",
        number: "5",
        title: "Third-Party Services",
        content: [
          "We use Stripe for payment processing, cloud infrastructure providers for hosting, and analytics tools to improve our product. Each third party is bound by their own privacy policies and our data processing agreements where applicable.",
        ],
      },
      {
        id: "security",
        number: "6",
        title: "Security",
        content: [
          "We implement industry-standard security measures including encryption in transit and at rest, access controls, and regular security reviews.",
        ],
      },
      {
        id: "contact",
        number: "7",
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
          "Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience.",
        ],
      },
      {
        id: "cookies-we-use",
        number: "2",
        title: "Cookies We Use",
        content: [
          "Essential cookies: required for authentication and security.",
          "Functional cookies: remember your preferences and settings.",
          "Analytics cookies: help us understand how visitors use our site (anonymized).",
        ],
      },
      {
        id: "managing-cookies",
        number: "3",
        title: "Managing Cookies",
        content: [
          "You can control cookies through your browser settings. Disabling essential cookies may affect your ability to use Arco.",
        ],
      },
    ],
  },
};

export function getLegalDocument(slug: string): LegalDocument | undefined {
  return legalDocuments[slug];
}
