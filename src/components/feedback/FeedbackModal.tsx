import { useEffect, useRef, useState } from 'react';

const GITHUB_REPO = 'daviesemark-stack/CGTCalc';
const RATE_LIMIT_MS = 60_000;
const MIN_LENGTH = 20;
const STORAGE_KEY = 'cgt_feedback_last_sent';

type Category = 'suggestion' | 'bug' | 'question' | 'general';

const CATEGORY_LABELS: Record<Category, string> = {
  suggestion: 'Suggestion',
  bug: 'Bug report',
  question: 'Question',
  general: 'General feedback',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function isRateLimited(): boolean {
  const last = localStorage.getItem(STORAGE_KEY);
  if (!last) return false;
  return Date.now() - parseInt(last, 10) < RATE_LIMIT_MS;
}

export function FeedbackModal({ isOpen, onClose }: Props) {
  const [category, setCategory] = useState<Category>('suggestion');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // Reset state each time modal opens
  useEffect(() => {
    if (isOpen) {
      setCategory('suggestion');
      setMessage('');
      setHoneypot('');
      setError(null);
      setSubmitted(false);
      setRateLimited(isRateLimited());
      // Move focus into the modal
      setTimeout(() => panelRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check — silently drop bot submissions
    if (honeypot !== '') return;

    // Rate limit
    if (isRateLimited()) {
      setRateLimited(true);
      return;
    }

    // Minimum length
    if (message.trim().length < MIN_LENGTH) {
      setError(`Please enter at least ${MIN_LENGTH} characters.`);
      return;
    }

    const title = encodeURIComponent(`[${CATEGORY_LABELS[category]}]`);
    const body = encodeURIComponent(
      `**Category:** ${CATEGORY_LABELS[category]}\n\n**Feedback:**\n${message.trim()}\n\n---\n_Submitted from CGT Reform Calculator_`
    );
    window.open(
      `https://github.com/${GITHUB_REPO}/issues/new?title=${title}&body=${body}`,
      '_blank',
      'noopener'
    );
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setSubmitted(true);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      aria-hidden={!isOpen}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        tabIndex={-1}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 outline-none"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="feedback-title" className="text-base font-semibold text-gray-900">
            Send feedback
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close feedback"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              <p className="font-medium mb-1">Thanks for your feedback!</p>
              <p>Your browser has opened the GitHub issue page. Review the pre-filled details and click <strong>Submit new issue</strong> to send it.</p>
              <p className="mt-2 text-xs text-green-700">A GitHub account is required to submit.</p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="feedback-category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="feedback-category"
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([v, label]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="feedback-message"
                rows={5}
                maxLength={1000}
                value={message}
                onChange={e => { setMessage(e.target.value); setError(null); }}
                placeholder="Describe your feedback, bug, or question…"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="flex justify-between mt-1">
                {error ? (
                  <p className="text-xs text-red-600">{error}</p>
                ) : (
                  <p className="text-xs text-gray-400">Minimum {MIN_LENGTH} characters</p>
                )}
                <p className="text-xs text-gray-400">{message.length}/1000</p>
              </div>
            </div>

            {/* Honeypot — hidden from real users, filled by bots */}
            <div aria-hidden="true" style={{ display: 'none' }}>
              <label htmlFor="feedback-url">Website</label>
              <input
                id="feedback-url"
                type="text"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {rateLimited && (
              <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded p-2">
                Please wait a moment before submitting again.
              </p>
            )}

            <p className="text-xs text-gray-500">
              Clicking submit opens a pre-filled GitHub issue in a new tab. A GitHub account is required to send it.
            </p>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Open GitHub issue →
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
