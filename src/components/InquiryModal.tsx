import React, { useState } from 'react';

export type ModalType = 
  | 'pitch' 
  | 'work' 
  | 'hello' 
  | 'operate' 
  | 'labs' 
  | 'studio' 
  | 'openings' 
  | 'shop' 
  | 'contact'
  | 'video'
  | null;

interface InquiryModalProps {
  type: ModalType;
  onClose: () => void;
  currentVideoUrl: string;
  onVideoUrlChange: (url: string) => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  type,
  onClose,
  currentVideoUrl,
  onVideoUrlChange,
}) => {
  const [pitchForm, setPitchForm] = useState({ name: '', email: '', idea: '', budget: '< $50k' });
  const [helloForm, setHelloForm] = useState({ name: '', email: '', note: '' });
  const [submitted, setSubmitted] = useState(false);
  const [customUrl, setCustomUrl] = useState(currentVideoUrl);

  if (!type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-neutral-950 border border-white/20 rounded-2xl p-6 sm:p-8 text-white shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Close button */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono tracking-widest text-neutral-400 uppercase">
              Mainframe® / {type}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Contents based on type */}
        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="text-3xl font-heading">Transmitted.</div>
            <p className="text-neutral-400 text-sm">
              A.R.I.A has routed your note to the partners. Expect a response shortly.
            </p>
          </div>
        ) : type === 'pitch' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-2xl font-heading mb-2">Pitch us an idea</h2>
              <p className="text-neutral-400 text-sm">
                We design and engineer bespoke spatial environments, digital systems, and brand interfaces.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Your Name</label>
                <input 
                  required
                  type="text" 
                  value={pitchForm.name}
                  onChange={(e) => setPitchForm({...pitchForm, name: e.target.value})}
                  placeholder="e.g. Elena Rostova" 
                  className="w-full bg-neutral-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={pitchForm.email}
                  onChange={(e) => setPitchForm({...pitchForm, email: e.target.value})}
                  placeholder="elena@company.com" 
                  className="w-full bg-neutral-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Project Concept</label>
                <textarea 
                  required
                  rows={3}
                  value={pitchForm.idea}
                  onChange={(e) => setPitchForm({...pitchForm, idea: e.target.value})}
                  placeholder="What are we building together? Core objectives, aesthetics, and timelines." 
                  className="w-full bg-neutral-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Expected Investment</label>
                <select 
                  value={pitchForm.budget}
                  onChange={(e) => setPitchForm({...pitchForm, budget: e.target.value})}
                  className="w-full bg-neutral-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-white transition-colors"
                >
                  <option value="< $50k">&lt; $50,000</option>
                  <option value="$50k - $150k">$50,000 – $150,000</option>
                  <option value="$150k - $300k">$150,000 – $300,000</option>
                  <option value="$300k+">$300,000+</option>
                </select>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors text-sm"
              >
                Submit Pitch
              </button>
            </div>
          </form>
        ) : type === 'work' || type === 'openings' ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading">Come work here</h2>
            <p className="text-neutral-400 text-sm">
              We look for cross-disciplinary practitioners who bridge graphic taste, machine intelligence, and front-end rigor.
            </p>
            <div className="space-y-3 pt-2">
              {[
                { title: 'Senior Creative Technologist', team: 'Labs / R&D', location: 'Remote / NYC' },
                { title: 'Interactive WebGL / 3D Engineer', team: 'Core Studio', location: 'Tokyo / London' },
                { title: 'Brand Identity & Systems Lead', team: 'Design Direction', location: 'Los Angeles / Zurich' },
                { title: 'AI Interface & Agent Researcher', team: 'A.R.I.A Systems', location: 'Remote' },
              ].map((role) => (
                <div 
                  key={role.title} 
                  className="p-4 rounded-xl border border-white/10 bg-neutral-900/60 flex items-center justify-between hover:border-white/30 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-white text-base">{role.title}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{role.team} · {role.location}</p>
                  </div>
                  <a 
                    href="mailto:careers@mainframe.co?subject=Application%20for%20Role"
                    className="px-3.5 py-1.5 rounded-full border border-white/20 text-xs hover:bg-white hover:text-black transition-colors"
                  >
                    Apply
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : type === 'hello' || type === 'contact' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-heading">Send a brief hello</h2>
            <p className="text-neutral-400 text-sm">
              Direct line to our studio dispatch. No spam, no pitch decks required.
            </p>
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Your Name</label>
                <input 
                  required
                  type="text" 
                  value={helloForm.name}
                  onChange={(e) => setHelloForm({...helloForm, name: e.target.value})}
                  placeholder="e.g. Miles Bennett" 
                  className="w-full bg-neutral-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Your Email</label>
                <input 
                  required
                  type="email" 
                  value={helloForm.email}
                  onChange={(e) => setHelloForm({...helloForm, email: e.target.value})}
                  placeholder="miles@domain.xyz" 
                  className="w-full bg-neutral-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Message</label>
                <textarea 
                  required
                  rows={3}
                  value={helloForm.note}
                  onChange={(e) => setHelloForm({...helloForm, note: e.target.value})}
                  placeholder="Say whatever is on your mind." 
                  className="w-full bg-neutral-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors text-sm"
              >
                Send Note
              </button>
            </div>
          </form>
        ) : type === 'operate' ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading">How we operate</h2>
            <p className="text-neutral-400 text-sm">
              Four fundamental tenets guide everything Mainframe designs, scripts, and ships.
            </p>
            <div className="space-y-3 pt-2 text-sm">
              <div className="p-3.5 rounded-xl border border-white/10 bg-neutral-900/60">
                <span className="font-mono text-xs text-neutral-400">01</span>
                <h3 className="font-medium text-white text-base mt-1">Frictionless Physicality</h3>
                <p className="text-neutral-400 text-xs mt-1">
                  Digital artifacts should respond to organic human movement with kinetic inertia and immediate tactile feedback.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-white/10 bg-neutral-900/60">
                <span className="font-mono text-xs text-neutral-400">02</span>
                <h3 className="font-medium text-white text-base mt-1">Typographic Dignity</h3>
                <p className="text-neutral-400 text-xs mt-1">
                  We treat type as architecture. Balanced measures, intentional scales, and zero pill-box clutter.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-white/10 bg-neutral-900/60">
                <span className="font-mono text-xs text-neutral-400">03</span>
                <h3 className="font-medium text-white text-base mt-1">Adaptive Intelligence (A.R.I.A)</h3>
                <p className="text-neutral-400 text-xs mt-1">
                  Automated systems must act as silent collaborators, anticipating human intent without intrusive dialog boxes.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-white/10 bg-neutral-900/60">
                <span className="font-mono text-xs text-neutral-400">04</span>
                <h3 className="font-medium text-white text-base mt-1">Radical Craftsmanship</h3>
                <p className="text-neutral-400 text-xs mt-1">
                  No generic templates. Every line of code and pixel of animation is deliberately authored for durability.
                </p>
              </div>
            </div>
          </div>
        ) : type === 'labs' ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading">Mainframe Labs</h2>
            <p className="text-neutral-400 text-sm">
              Experimental R&amp;D division exploring spatial compute, autonomous agents, and reactive generative canvases.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/40">
                <div className="text-xs font-mono text-neutral-400 mb-1">LAB-01</div>
                <h3 className="font-medium text-white text-sm">Kinetic Scrubbing Engine</h3>
                <p className="text-xs text-neutral-400 mt-1">Cursor-driven horizontal video scrub with non-blocking target time buffer.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/40">
                <div className="text-xs font-mono text-neutral-400 mb-1">LAB-02</div>
                <h3 className="font-medium text-white text-sm">A.R.I.A Behavioral Kernel</h3>
                <p className="text-xs text-neutral-400 mt-1">Adaptive Response Interface Agent responding in real-time to user exploration.</p>
              </div>
            </div>
          </div>
        ) : type === 'studio' ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading">Mainframe Studio</h2>
            <p className="text-neutral-400 text-sm">
              Our multidisciplinary design and technology production studio based in New York and Tokyo.
            </p>
            <p className="text-neutral-300 text-xs leading-relaxed">
              We collaborate with visionary founders and progressive brands to design category-defining identity systems, digital flagship experiences, and generative interfaces.
            </p>
            <div className="pt-2 text-xs text-neutral-400">
              Inquiries: <span className="text-white underline">studio@mainframe.co</span>
            </div>
          </div>
        ) : type === 'shop' ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading">Mainframe Editions &amp; Objects</h2>
            <p className="text-neutral-400 text-sm">
              Limited physical prints, bespoke typography specimens, and hardware artifacts.
            </p>
            <div className="p-6 rounded-xl border border-white/10 bg-neutral-900 text-center">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Spring Collection</span>
              <h3 className="text-lg font-heading text-white mt-1">A.R.I.A Specimen Vol. 1</h3>
              <p className="text-xs text-neutral-400 mt-2">Archival screenprint on Somerset Satin 300gsm paper. Edition of 50.</p>
              <button 
                onClick={() => alert("Edition waitlist joined.")}
                className="mt-4 px-4 py-1.5 rounded-full bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading">Background Video Source</h2>
            <p className="text-neutral-400 text-sm">
              Current video is set to the CloudFront MP4 stream. You can also specify an alternative direct MP4 stream URL.
            </p>
            <div className="space-y-3 pt-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://.../video.mp4"
                className="w-full bg-neutral-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onVideoUrlChange('/videos/robot.mp4');
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-full border border-white/20 text-xs hover:bg-white hover:text-black transition-colors"
                >
                  Reset Default
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onVideoUrlChange(customUrl);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors"
                >
                  Apply URL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
