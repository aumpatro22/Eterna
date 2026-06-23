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

export default function TermsOfService() {
  return (
    <div className="flex flex-col gap-8 py-6 text-ink max-w-3xl mx-auto">
      <SEO
        title="Terms of Service – Eterna"
        description="Eterna's Terms of Service. Understand your rights, responsibilities, and content ownership when using the platform."
        keywords="terms of service, terms, legal, user agreement, Eterna"
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="inline-block bg-postit text-ink border-[2px] border-ink px-4 py-1 font-kalam text-sm -rotate-1 shadow-hard mb-4">
          📜 The Rules of the Road
        </span>
        <h1 className="font-kalam text-4xl md:text-5xl font-bold mb-3">Terms of Service</h1>
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
          By creating an account or using Eterna, you agree to these Terms. Eterna is a private family legacy platform — not a social network. Please read these terms carefully. They cover what you can expect from us, and what we expect from you.
        </p>
      </motion.div>

      {/* Sections */}
      <div className="flex flex-col gap-4">

        <Section title="Eligibility" icon="🎂" index={0}>
          <p>You must be at least <strong>13 years old</strong> (or the minimum age in your jurisdiction) to create an account. If you're under 18, you may only use Eterna with a parent or legal guardian's involvement.</p>
        </Section>

        <Section title="Your Account" icon="🔑" index={1}>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and truthful information when registering.</li>
            <li>Keep your login credentials confidential.</li>
            <li>You are responsible for all activity under your account.</li>
            <li>You may delete your account at any time.</li>
          </ul>
          <p>We may suspend or terminate accounts that violate these Terms, at our sole discretion, with or without prior notice.</p>
        </Section>

        <Section title="Content Ownership & License" icon="👑" index={2}>
          <div className="bg-white border-2 border-ink/20 p-4" style={{ borderRadius: '8px' }}>
            <p className="font-kalam font-bold text-marker text-lg">You own everything you upload.</p>
          </div>
          <p className="mt-3">Photos, videos, stories, recordings — all User Content remains your intellectual property. Eterna does not claim ownership of User Content.</p>
          <p>By uploading, you grant us a <strong>limited, non-exclusive, worldwide, royalty-free license</strong> to store, host, back up, display (to you and your authorized users), and process your content as reasonably necessary to operate and improve the service. This license terminates when you delete your content or account, subject to reasonable delays for backup removal.</p>
          <p className="font-bold">You represent and warrant that you own the content you upload or have all necessary permissions, licenses, and consents.</p>
        </Section>

        <Section title="Acceptable Use" icon="✅" index={3}>
          <p>You agree <strong>not</strong> to use Eterna to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Upload illegal, defamatory, threatening, or hateful content.</li>
            <li>Upload content that exploits minors in any way.</li>
            <li>Impersonate any person or entity.</li>
            <li>Interfere with the platform's infrastructure or security.</li>
            <li>Attempt unauthorized access to any part of the platform.</li>
            <li>Use bots, scrapers, or automated tools without written consent.</li>
            <li>Upload malware, viruses, or harmful code.</li>
            <li>Use the platform for commercial purposes unrelated to its intended function without express written permission.</li>
          </ul>
          <p>We reserve the right to remove content and suspend accounts that violate these rules.</p>
        </Section>

        <Section title="Family Sharing & Collaboration" icon="👨‍👩‍👧" index={4}>
          <ul className="list-disc pl-6 space-y-2">
            <li>You choose who to share content with. Eterna does not control how recipients use shared content once viewed.</li>
            <li>In collaborative spaces, each contributor retains ownership of their own contributions.</li>
            <li>Revoking access prevents future access but does not recall already-viewed content.</li>
          </ul>
        </Section>

        <Section title="AI-Assisted Features" icon="🤖" index={5}>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>AI assists, it does not own.</strong> Any AI-generated content based on your materials belongs to you.</li>
            <li>AI output may contain errors — you are responsible for reviewing and verifying it.</li>
            <li>AI content is <strong>not</strong> professional advice of any kind (legal, medical, financial, or otherwise).</li>
            <li>We do not guarantee the accuracy, completeness, or suitability of AI output for any purpose.</li>
            <li>Eterna does not currently use your personal content to train general-purpose AI models for third parties without your consent. If this changes, we will notify you and provide opt-out options.</li>
          </ul>
        </Section>

        <Section title="No Guarantee of Permanent Storage" icon="⚠️" index={6}>
          <div className="bg-white border-2 border-ink/20 p-4" style={{ borderRadius: '8px' }}>
            <p className="font-kalam font-bold text-ink/80">
              Eterna does not promise permanent, indefinite, or "forever" preservation.
            </p>
          </div>
          <p className="mt-3">Availability depends on platform operation, infrastructure reliability, your account status, and circumstances beyond our reasonable control.</p>
          <p className="font-bold">We strongly encourage all users to maintain their own personal backups of important memories.</p>
          <p>If we discontinue the service, we will make commercially reasonable efforts to provide advance notice and data export tools before cessation.</p>
        </Section>

        <Section title="Payments & Subscriptions" icon="💳" index={7}>
          <p>If paid plans are offered:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pricing and terms will be disclosed before purchase.</li>
            <li>Subscriptions may auto-renew unless canceled before the renewal date.</li>
            <li>Refunds are handled in accordance with applicable law.</li>
            <li>Non-payment may result in downgrading to a free tier or disabling premium features. <strong>Eterna is designed to avoid automatic deletion of content due to payment failure.</strong> We will make reasonable efforts to provide notice and export opportunities before any content action is taken.</li>
          </ul>
        </Section>

        <Section title="Copyright Complaints (DMCA)" icon="📋" index={8}>
          <p>Eterna respects the intellectual property rights of others. If you believe content on the platform infringes your copyright:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Submit a written notice to our designated agent identifying the copyrighted work and the infringing content.</li>
            <li>Include your contact information, a statement of good faith belief, and a statement under penalty of perjury that you are authorized to act on behalf of the copyright owner.</li>
            <li>We will investigate and, if appropriate, remove or disable access to the infringing content.</li>
          </ul>
          <p>Eterna maintains a <strong>repeat infringer policy</strong>. Accounts that repeatedly violate copyright may be terminated.</p>
          <div className="bg-white border-2 border-ink/20 p-4 mt-2 text-center" style={{ borderRadius: '8px' }}>
            <p className="font-kalam font-bold text-ink/80">Copyright notices: copyright@eterna.app</p>
          </div>
        </Section>

        <Section title="Estate Planning Disclaimer" icon="📜" index={9}>
          <div className="bg-white border-2 border-ink/20 p-4" style={{ borderRadius: '8px' }}>
            <p className="font-kalam font-bold text-ink/80">
              Eterna is not a law firm and does not provide legal advice.
            </p>
          </div>
          <p className="mt-3">The platform is designed to help families preserve memories and stories. It is <strong>not</strong> a substitute for professional estate planning, wills, trusts, powers of attorney, or any other legal instrument.</p>
          <p>Eterna does not replace the services of qualified attorneys, financial advisors, or estate planning professionals. Users should consult appropriate professionals for legal, financial, or estate matters.</p>
        </Section>

        <Section title="Inactive Accounts" icon="💤" index={10}>
          <p>If your account is inactive for an extended period, Eterna may:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Send you email notifications requesting you to confirm your account status.</li>
            <li>Place your account in a <strong>read-only archival mode</strong> to preserve your content while reducing active resource usage.</li>
            <li>Eterna is designed to preserve memories whenever possible. We will make reasonable efforts to avoid deleting content due to inactivity alone.</li>
          </ul>
          <p>If we need to take action on inactive accounts, we will provide reasonable advance notice and the opportunity to reactivate or export your data.</p>
        </Section>

        <Section title="Family Ownership Disputes" icon="👥" index={11}>
          <p>If multiple family members or authorized users disagree about ownership or access to shared content:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Eterna does not act as a mediator, arbitrator, or judge in family disputes.</li>
            <li>We may temporarily restrict access to disputed content while we review the situation or await legal direction.</li>
            <li>We may require appropriate legal documentation (such as a court order) before making changes to content ownership or access rights.</li>
          </ul>
          <p>We encourage families to discuss and agree on sharing preferences proactively.</p>
        </Section>

        <Section title="Force Majeure" icon="🌊" index={12}>
          <p>Eterna is not liable for any failure or delay in performance resulting from causes beyond our reasonable control, including but not limited to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Natural disasters, epidemics, or pandemics.</li>
            <li>War, terrorism, or civil unrest.</li>
            <li>Government actions, sanctions, or regulations.</li>
            <li>Internet outages or telecommunications failures.</li>
            <li>Cyberattacks, including denial-of-service attacks.</li>
            <li>Cloud service provider failures or outages.</li>
            <li>Power outages or equipment failures.</li>
          </ul>
          <p>We will make commercially reasonable efforts to resume normal service as promptly as possible.</p>
        </Section>

        <Section title="Business Transfers" icon="🏗️" index={13}>
          <p>If Eterna is involved in a merger, acquisition, asset sale, restructuring, or similar business transaction:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your information and content may be transferred as part of that transaction.</li>
            <li>These Terms and our Privacy Policy will continue to apply to your data under the new entity.</li>
            <li>We will provide notice before your information is transferred and becomes subject to a different privacy policy.</li>
          </ul>
          <p>Any successor entity will be bound by the commitments we have made to you in these Terms, to the extent commercially reasonable.</p>
        </Section>

        <Section title="Intellectual Property" icon="©️" index={14}>
          <p>The Eterna name, logo, branding, design, and software are owned by Eterna or its licensors and are protected by applicable intellectual property laws.</p>
          <p>If you provide suggestions or feedback, you grant us a non-exclusive, worldwide, royalty-free, perpetual license to use that feedback for any purpose without obligation to you.</p>
        </Section>

        <Section title="Disclaimer of Warranties" icon="📢" index={15}>
          <div className="bg-white border-2 border-ink/20 p-4" style={{ borderRadius: '8px' }}>
            <p className="font-kalam font-bold text-ink/80 uppercase tracking-wide text-sm">
              Eterna is provided "as is" and "as available" without warranties of any kind, express or implied.
            </p>
          </div>
          <p className="mt-3">To the fullest extent permitted by applicable law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the platform will be uninterrupted, error-free, secure, or that content will be preserved without loss or corruption.</p>
        </Section>

        <Section title="Limitation of Liability" icon="🔒" index={16}>
          <p>To the fullest extent permitted by applicable law, Eterna and its officers, directors, employees, and affiliates shall not be liable for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Indirect, incidental, special, consequential, or punitive damages.</li>
            <li>Loss of data, memories, content, profits, goodwill, or other intangible losses.</li>
            <li>Damages from unauthorized access, alteration, or loss of content.</li>
            <li>Platform interruptions, errors, or discontinuation.</li>
          </ul>
          <p className="mt-2">Our total aggregate liability for all claims shall not exceed the greater of (a) the amount you paid us in the 12 months before the claim, or (b) $100 USD. Some jurisdictions do not allow these limitations; in such cases, liability is limited to the greatest extent permitted by law.</p>
        </Section>

        <Section title="Indemnification" icon="🤝" index={17}>
          <p>You agree to indemnify, defend, and hold harmless Eterna and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorney's fees) arising from your use of the platform, your violation of these Terms, your violation of any third-party rights, or content you upload.</p>
        </Section>

        <Section title="Governing Law & Disputes" icon="⚖️" index={18}>
          <p>These Terms are governed by and construed in accordance with the laws of <strong>[governing jurisdiction to be specified upon incorporation]</strong>, without regard to conflict of law principles.</p>
          <p>Disputes shall first be resolved through good faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration or in the courts of competent jurisdiction, as permitted by applicable law.</p>
          <p className="font-bold">Class Action Waiver: To the fullest extent permitted by law, disputes will be resolved on an individual basis, not as class, consolidated, or representative actions.</p>
        </Section>

        <Section title="Severability" icon="✂️" index={19}>
          <p>If any provision of these Terms is found invalid, illegal, or unenforceable, that provision will be modified to the minimum extent necessary or severed. The remaining provisions will continue in full force and effect.</p>
        </Section>

        <Section title="Changes to These Terms" icon="📝" index={20}>
          <p>We may update these Terms from time to time. When we make material changes, we will update the date above and provide reasonable notice (such as email notification or in-platform notice).</p>
          <p>Your continued use of the platform after changes become effective constitutes acceptance of the updated Terms. If you do not agree with the changes, you should stop using the platform.</p>
        </Section>

        <Section title="Contact Us" icon="💌" index={21}>
          <p>Questions about these Terms?</p>
          <div className="bg-white border-2 border-ink/20 p-4 mt-2 text-center" style={{ borderRadius: '8px' }}>
            <p className="font-kalam text-2xl font-bold text-marker">Eterna</p>
            <p className="font-patrick text-xl">legal@eterna.app</p>
          </div>
        </Section>
      </div>

      {/* Closing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center py-6 border-t-2 border-dashed border-ink/15"
      >
        <p className="font-kalam text-lg text-ink/50 italic">
          These Terms are designed to be fair and transparent. A platform built on trust requires honest communication about rights and responsibilities.
        </p>
      </motion.div>
    </div>
  );
}
