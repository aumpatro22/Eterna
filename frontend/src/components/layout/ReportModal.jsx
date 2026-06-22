import { useState } from 'react';
import api from '../../api/client';

export default function ReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState('SPAM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/api/reports/', {
        target_type: targetType,
        target_id: targetId,
        reason: reason,
        description: description
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/60 z-[999999] flex items-center justify-center p-6 backdrop-blur-[2px] font-patrick">
      <div className="paper-card bg-white p-5 sm:p-6 md:p-8 max-w-md w-full relative rotate-1 tack-decoration shadow-hard">
        
        {!success && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 font-kalam text-3xl md:hover:text-marker transition-colors"
            aria-label="Close"
          >
            ✖
          </button>
        )}

        <h3 className="font-kalam text-3xl text-marker mb-4 border-b-[2px] border-dashed border-ink/20 pb-2">
          Report Content 🛡️
        </h3>

        {success ? (
          <div className="text-center py-6">
            <span className="text-5xl block mb-4">✅</span>
            <p className="text-2xl font-bold text-ink">Thank you for your report.</p>
            <p className="text-lg text-ink/75 mt-2">We will review this content to keep Eterna safe and supportive.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left text-xl">
            {error && (
              <div className="bg-marker/10 border-l-4 border-marker p-3 text-lg mb-2">
                {error}
              </div>
            )}

            <p className="text-lg text-ink/75 leading-relaxed">
              Help us understand what is wrong with this {targetType.toLowerCase()}. We review all reports carefully.
            </p>

            <div>
              <label className="block font-bold mb-1">Reason for Report</label>
              <select 
                className="input w-full"
                value={reason}
                onChange={e => setReason(e.target.value)}
              >
                <option value="SPAM">Spam or Unwanted Content</option>
                <option value="HARASSMENT">Harassment or Abuse</option>
                <option value="FAKE_ACCOUNT">Fake or Impersonation Account</option>
                <option value="INAPPROPRIATE_CONTENT">Inappropriate or Offensive Material</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">Details (Optional)</label>
              <textarea 
                className="input w-full h-24 text-lg"
                placeholder="Provide additional details to help our moderation team..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-4 justify-end mt-2">
              <button 
                type="button" 
                onClick={onClose}
                className="btn btn-secondary text-lg"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary text-lg bg-marker text-white hover:bg-marker/90"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
