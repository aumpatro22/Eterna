import { useState } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/layout/SEO';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="flex flex-col gap-12 py-6 text-ink font-patrick text-xl">
      <SEO 
        title="Contact Us & Direct Support – Eterna"
        description="Get in touch with the Eterna team. Submit questions, feedback, or report bugs directly to the founders."
        keywords="contact, support, feedback, help, bug report, Eterna"
      />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="inline-block bg-postit text-ink border-[2px] border-ink px-4 py-1 font-kalam text-sm rotate-2 shadow-hard mb-4">
          📬 Support & Feedback
        </span>
        <h1 className="font-kalam text-5xl md:text-6xl font-bold mb-4">Get in Touch</h1>
        <p className="font-patrick text-2xl text-ink/70 max-w-xl mx-auto">
          Have a question about preserving your family memories? We are here to help.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-12 gap-8 items-start max-w-4xl mx-auto w-full">
        {/* Contact Info Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-5 bg-postit border-[3px] border-ink p-8 shadow-hard rotate-1 relative"
          style={{ borderRadius: '15px 30px 15px 30px / 30px 15px 30px 15px' }}
        >
          <div className="paper-clip" />
          <h2 className="font-kalam text-3xl font-bold mb-6">Contact Channels</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-kalam font-bold text-xl text-marker">📧 General Inquiries</h3>
              <p className="mt-1">support@eterna-five-phi.vercel.app</p>
            </div>
            
            <div>
              <h3 className="font-kalam font-bold text-xl text-marker">🐞 Bug Reporting</h3>
              <p className="mt-1">
                Notice an issue? Submit details directly using our official bug tracking form:
              </p>
              <a 
                href="https://forms.gle/jPHUuWkMbHNGPahPA" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block mt-3 bg-white border-[2.5px] border-ink px-4 py-2 font-kalam font-bold text-base shadow-hard hover:bg-erased -rotate-1 transition-transform"
              >
                Submit Bug Report 🐞
              </a>
            </div>
            
            <div className="border-t-2 border-dashed border-ink/20 pt-4">
              <p className="italic text-base text-ink/60">
                Eterna is built with empathy. We aim to reply to all legacy support emails within 24 hours.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Form Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-7 bg-white border-[3px] border-ink p-8 shadow-hard -rotate-1 relative wobbly-md"
        >
          {submitted ? (
            <div className="text-center py-10 flex flex-col items-center">
              <span className="text-6xl mb-4 select-none">✉️</span>
              <h2 className="font-kalam text-3xl font-bold text-marker mb-2">Message Sent!</h2>
              <p className="text-xl max-w-sm">
                Thank you for reaching out. We have pinned your note and will review it shortly.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="btn btn-secondary mt-6 font-kalam font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-patrick">
              <h2 className="font-kalam text-3xl font-bold text-ink mb-2">Send a Message</h2>
              
              <div>
                <label className="block font-kalam font-bold text-lg mb-1">Your Name</label>
                <input 
                  type="text" 
                  className="input w-full bg-paper border-2" 
                  required
                  placeholder="e.g. Elena Ross"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-kalam font-bold text-lg mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="input w-full bg-paper border-2" 
                  required
                  placeholder="e.g. elena@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-kalam font-bold text-lg mb-1">How can we help?</label>
                <textarea 
                  className="input w-full bg-paper border-2 h-32" 
                  required
                  placeholder="Write your thoughts or questions..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary text-xl font-kalam font-bold py-3 -rotate-1 shadow-hard hover:shadow-hard-hover"
              >
                Send Note ➜
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
