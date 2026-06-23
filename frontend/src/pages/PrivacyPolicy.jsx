import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/layout/SEO';

const LAST_UPDATED = 'June 24, 2026';

function Section({ title, icon, children, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="border-[3px] border-ink bg-white shadow-hard overflow-hidden"
      style={{ borderRadius: '12px 24px 12px 24px / 24px 12px 24px 12px' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 md:p-6 text-left hover:bg-postit/20 transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="font-kalam text-xl md:text-2xl font-bold text-ink">{title}</h2>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-ink/40 text-2xl font-bold select-none shrink-0"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-6 pt-2 font-patrick text-lg md:text-xl leading-relaxed text-ink/85 space-y-4 border-t-2 border-dashed border-ink/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col gap-8 py-6 text-ink max-w-3xl mx-auto">
      <SEO
        title="Privacy Policy – Eterna"
        description="Eterna's Privacy Policy. Learn how we collect, use, and protect your personal information and family memories."
        keywords="privacy policy, data protection, GDPR, CCPA, Eterna"
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="inline-block bg-postit text-ink border-[2px] border-ink px-4 py-1 font-kalam text-sm rotate-2 shadow-hard mb-4">
          🔒 Your Privacy Matters
        </span>
        <h1 className="font-kalam text-4xl md:text-5xl font-bold mb-3">Privacy Policy</h1>
        <p className="font-patrick text-xl text-ink/60">
          Last updated: {LAST_UPDATED}
        </p>
      </motion.div>

      {/* Intro card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-postit/30 border-[3px] border-ink p-6 md:p-8 shadow-hard wobbly-sm relative"
      >
        <div className="paper-clip" />
        <p className="font-patrick text-xl leading-relaxed text-ink/85">
          Eterna is a private family legacy platform — not a social network. We currently do not run ads, sell data, or build advertising profiles. This policy explains what we collect, why, and what choices you have. We've tried to keep it clear and human-readable.
        </p>
      </motion.div>

      {/* Accordion sections */}
      <div className="flex flex-col gap-4">

        <Section title="Information You Provide" icon="📝" index={0}>
          <p>When you use Eterna, you may voluntarily provide:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information</strong> — Name, email, and password.</li>
            <li><strong>Profile Information</strong> — Display name, bio, profile photo.</li>
            <li><strong>Uploaded Content</strong> — Photos, videos, audio recordings, stories, family timelines, and memorial pages.</li>
            <li><strong>Communications</strong> — Messages sent through the platform and support requests.</li>
            <li><strong>Sharing Preferences</strong> — Who you choose to share memories with.</li>
          </ul>
        </Section>

        <Section title="Automatically Collected Information" icon="⚙️" index={1}>
          <p>When you access Eterna, we may automatically collect:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Device Info</strong> — Browser type, OS, and device type.</li>
            <li><strong>Usage Info</strong> — Pages visited and features used.</li>
            <li><strong>Log Data</strong> — IP addresses, access times, and referring URLs.</li>
            <li><strong>Cookies</strong> — Small data files to help the platform function and remember your preferences.</li>
          </ul>
          <p>We collect this data to operate and improve the platform. <strong>We currently do not use it to build advertising profiles.</strong></p>
        </Section>

        <Section title="Legal Basis for Processing (GDPR)" icon="🇪🇺" index={2}>
          <p>If you are located in the European Economic Area (EEA) or United Kingdom, we process your personal data under the following legal bases:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Consent</strong> — When you create an account, upload content, or opt into specific features.</li>
            <li><strong>Contract Performance</strong> — To provide the services you have requested and maintain your account.</li>
            <li><strong>Legitimate Interests</strong> — To improve our platform, ensure security, and communicate with you about your account. We balance these interests against your privacy rights.</li>
            <li><strong>Legal Obligations</strong> — When we are required to process data by applicable law, regulation, or legal process.</li>
          </ul>
          <p>You may withdraw consent at any time where processing is based on consent. Withdrawal does not affect the lawfulness of processing conducted prior to withdrawal.</p>
        </Section>

        <Section title="How We Use Information" icon="🎯" index={3}>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, operate, and maintain Eterna.</li>
            <li>Create and manage your account.</li>
            <li>Store, organize, and display your memories.</li>
            <li>Enable family sharing features you choose to use.</li>
            <li>Communicate about your account and platform updates.</li>
            <li>Monitor and improve security and reliability.</li>
            <li>Detect and prevent fraud or abuse.</li>
            <li>Comply with legal obligations.</li>
            <li>Develop and improve our products and features.</li>
          </ul>
          <div className="bg-white border-2 border-ink/20 p-4 mt-2" style={{ borderRadius: '8px' }}>
            <p className="font-kalam font-bold text-marker">We currently do not sell your personal information.</p>
          </div>
        </Section>

        <Section title="Content Ownership" icon="👑" index={4}>
          <p><strong>You own the content you upload.</strong> Photographs, stories, recordings — all of it remains your intellectual property.</p>
          <p>Eterna receives only a limited, non-exclusive license to store, display, and back up your content so the service can function. This license exists solely to provide and improve the service and terminates when you delete your content or account, subject to reasonable delays for backup removal.</p>
        </Section>

        <Section title="Family Sharing & Permissions" icon="👨‍👩‍👧‍👦" index={5}>
          <p><strong>You control who sees your content.</strong> Sharing is initiated by you.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Shared content is generally visible only to the people you invite.</li>
            <li>Collaborators can contribute based on the permissions you grant.</li>
            <li>Revoking access prevents future access, but recipients may have already viewed or saved content on their own devices.</li>
          </ul>
        </Section>

        <Section title="AI Features & AI-Generated Content" icon="🤖" index={6}>
          <p>Eterna may offer AI tools for transcription, organization, and accessibility. Key disclosures:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AI output may contain inaccuracies — always review before relying on it.</li>
            <li>AI is a tool. It does not own your content.</li>
            <li>Eterna does not currently use your personal content to train general-purpose AI models for third parties without your consent. If this practice changes, we will notify you and provide clear opt-out options.</li>
            <li>AI output is not professional advice of any kind.</li>
          </ul>
        </Section>

        <Section title="Children's Privacy" icon="🧒" index={7}>
          <p>Eterna is not directed at children under 13. We do not knowingly collect information from children without verifiable parental consent.</p>
          <p>Families may upload photos and stories about children as part of their family legacy — but the account holder must be an adult or meet the applicable minimum age requirement.</p>
        </Section>

        <Section title="Cookies & Analytics" icon="🍪" index={8}>
          <p>We use cookies to keep you logged in, remember preferences, and understand how the platform is used. <strong>We currently do not use cookies for behavioral advertising or cross-site tracking.</strong></p>
          <p>You can manage cookies through your browser settings. Disabling certain cookies may affect functionality.</p>
        </Section>

        <Section title="Third-Party Service Providers" icon="🏢" index={9}>
          <p>We use trusted providers for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Hosting & Infrastructure</strong> — To store and serve content.</li>
            <li><strong>Email Services</strong> — For account notifications.</li>
            <li><strong>Media Storage</strong> — To securely store uploaded files.</li>
            <li><strong>Analytics</strong> — To understand aggregate usage patterns.</li>
          </ul>
          <p>These providers are contractually required to maintain confidentiality. <strong>We currently do not sell or rent your data to third parties.</strong></p>
        </Section>

        <Section title="Data Retention" icon="🗄️" index={10}>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Data</strong> — Retained while your account exists and for a reasonable period afterward for legal and operational purposes.</li>
            <li><strong>Uploaded Content</strong> — Retained while your account is active. Removed upon account deletion within a commercially reasonable timeframe.</li>
            <li><strong>Backups</strong> — Deleted content may persist temporarily in encrypted backup systems. We aim to remove backup copies within a reasonable period, though specific timeframes may vary based on technical and operational requirements.</li>
          </ul>
          <div className="bg-white border-2 border-ink/20 p-4 mt-2" style={{ borderRadius: '8px' }}>
            <p className="font-kalam font-bold text-ink/80">⚠️ We do not promise permanent or indefinite storage. We strongly encourage users to maintain their own backups.</p>
          </div>
        </Section>

        <Section title="Data Security" icon="🛡️" index={11}>
          <p>We implement reasonable administrative, technical, and physical security measures designed to protect your information, including encryption in transit, secure authentication, and access controls.</p>
          <p><strong>However, no method of electronic transmission or storage is completely secure.</strong> While we strive to protect your information, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.</p>
        </Section>

        <Section title="Security Incident Notification" icon="🚨" index={12}>
          <p>If a material security breach occurs that affects your personal data, Eterna will:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Investigate the incident promptly.</li>
            <li>Take reasonable steps to mitigate any harm.</li>
            <li>Provide notice as required by applicable law and regulation.</li>
          </ul>
          <p>The form, timing, and content of notifications will be determined by the nature of the incident and applicable legal requirements.</p>
        </Section>

        <Section title="Data Portability & Export" icon="📦" index={13}>
          <p>We believe in user ownership. Eterna is designed to provide you with the ability to export your data, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Photographs and images.</li>
            <li>Videos and audio recordings.</li>
            <li>Written memories, stories, and timelines.</li>
            <li>Account and profile information.</li>
          </ul>
          <p>Export tools are intended to be available through your account settings. We are committed to avoiding vendor lock-in — your memories should be portable.</p>
        </Section>

        <Section title="International Data Transfers" icon="🌍" index={14}>
          <p>Your information may be transferred to and processed in countries other than your own. We take reasonable steps to ensure compliance with applicable data transfer laws and that your information receives an adequate level of protection wherever it is processed.</p>
          <p>Where required, we rely on appropriate transfer mechanisms such as Standard Contractual Clauses or other lawful transfer safeguards.</p>
        </Section>

        <Section title="Your Rights" icon="✊" index={15}>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access</strong> — Request a copy of your personal information.</li>
            <li><strong>Correction</strong> — Request correction of inaccurate data.</li>
            <li><strong>Deletion</strong> — Request deletion of your data.</li>
            <li><strong>Portability</strong> — Request data in a structured, machine-readable format.</li>
            <li><strong>Objection</strong> — Object to certain processing activities.</li>
            <li><strong>Restriction</strong> — Request restriction of processing in certain circumstances.</li>
          </ul>
          <p className="mt-2">We will not discriminate against you for exercising your privacy rights. To exercise any of these rights, contact us at privacy@eterna.app.</p>
          <div className="bg-postit/30 border-2 border-ink/20 p-4 mt-2" style={{ borderRadius: '8px' }}>
            <p className="font-kalam font-bold text-sm">For California residents (CCPA/CPRA): Eterna currently does not sell personal information.</p>
            <p className="font-kalam font-bold text-sm mt-1">For EU/UK residents (GDPR): You may lodge a complaint with your local data protection authority.</p>
          </div>
        </Section>

        <Section title="Account Deletion & Data Removal" icon="🗑️" index={16}>
          <p>You may delete your account at any time. When you do:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Personal information and content are removed from active systems within a commercially reasonable timeframe.</li>
            <li>Backup copies are purged within a reasonable period, though specific timeframes may vary.</li>
            <li>Some data may be retained as required by law or for legitimate business purposes.</li>
            <li>Content shared with others or contributed to collaborative spaces may remain visible to those users.</li>
          </ul>
          <p className="font-bold mt-2">We strongly encourage you to export and download your own copies before deleting your account.</p>
        </Section>

        <Section title="Law Enforcement & Legal Compliance" icon="⚖️" index={17}>
          <p>We may disclose information when we believe in good faith that disclosure is necessary to comply with applicable law, enforce our Terms, or protect the rights, property, or safety of our users or the public.</p>
          <p>Where permitted by law, we will make reasonable efforts to notify you before disclosing information in response to legal requests, unless doing so is prohibited or would be inappropriate.</p>
        </Section>

        <Section title="Changes to This Policy" icon="📋" index={18}>
          <p>We may update this policy from time to time. When we make material changes, we will update the date above and provide reasonable notice via email or in-platform notification.</p>
          <p>Continued use after changes are posted constitutes acceptance of the updated policy. If you disagree with the changes, you should stop using the platform.</p>
        </Section>

        <Section title="Contact Us" icon="💌" index={19}>
          <p>Questions about this Privacy Policy? Contact us at:</p>
          <div className="bg-white border-2 border-ink/20 p-4 mt-2 text-center" style={{ borderRadius: '8px' }}>
            <p className="font-kalam text-2xl font-bold text-marker">Eterna</p>
            <p className="font-patrick text-xl">privacy@eterna.app</p>
          </div>
        </Section>
      </div>

      {/* Closing note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center py-6 border-t-2 border-dashed border-ink/15"
      >
        <p className="font-kalam text-lg text-ink/50 italic">
          This policy is designed to be clear and honest. Trust is earned through transparency, not legal complexity.
        </p>
      </motion.div>
    </div>
  );
}
