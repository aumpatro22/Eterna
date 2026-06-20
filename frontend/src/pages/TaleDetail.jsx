import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import ReportModal from '../components/layout/ReportModal';

// Pagination helper: groups paragraphs into pages of roughly 750 characters
const paginateContent = (text, charsPerPage = 750) => {
  if (!text) return [];
  const paragraphs = text.split('\n\n');
  const pages = [];
  let currentPage = '';

  paragraphs.forEach((para) => {
    if ((currentPage + para).length > charsPerPage && currentPage) {
      pages.push(currentPage.trim());
      currentPage = para + '\n\n';
    } else {
      currentPage += para + '\n\n';
    }
  });
  if (currentPage.trim()) {
    pages.push(currentPage.trim());
  }
  return pages;
};

export default function TaleDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [tale, setTale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(null);
  const [bookIndex, setBookIndex] = useState(0); // Index of the left page (always even)
  const [comments, setComments] = useState([]);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentForm, setCommentForm] = useState({ author: '', content: '' });

  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetType, setReportTargetType] = useState('TALE');
  const [reportTargetId, setReportTargetId] = useState(null);

  // New chapter states
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [chapterForm, setChapterForm] = useState({ title: '', content: '', order: 1 });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchTale();
  }, [slug]);

  useEffect(() => {
    // Load local comments for this tale
    const key = `eterna_tale_comments_${slug}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setComments(JSON.parse(stored));
      } catch {
        seedComments();
      }
    } else {
      seedComments();
    }
  }, [slug]);

  // Reset page position when active chapter changes
  useEffect(() => {
    setBookIndex(0);
  }, [activeChapter]);

  const seedComments = () => {
    const defaultComments = [
      { id: 'seed-c1', author: 'Jane D.', content: 'This paragraph made me think of my grandpa. Beautiful storytelling.', side: 'left', top: 120, rotate: -4 },
      { id: 'seed-c2', author: 'Echo Writer', content: 'Love the hand-drawn detail in this notebook reader!', side: 'right', top: 200, rotate: 3 },
    ];
    setComments(defaultComments);
  };

  const fetchTale = async (activateChapterId = null) => {
    try {
      const data = await api.get(`/api/tales/${slug}/`);
      setTale(data);
      if (data.chapters && data.chapters.length > 0) {
        if (activateChapterId) {
          const match = data.chapters.find(c => c.id === activateChapterId);
          setActiveChapter(match || data.chapters[data.chapters.length - 1]);
        } else if (!activeChapter) {
          setActiveChapter(data.chapters[0]);
        }
      }
      if (user) {
        setCommentForm(prev => ({ ...prev, author: user.first_name || user.username }));
      }
    } catch {
      setTale(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.title.trim() || !chapterForm.content.trim()) return;
    setSubmitLoading(true);
    try {
      const res = await api.post(`/api/tales/${slug}/chapters/`, {
        title: chapterForm.title,
        content: chapterForm.content,
        order: chapterForm.order || (tale.chapters.length + 1)
      });
      setChapterForm({ title: '', content: '', order: 1 });
      setIsAddingChapter(false);
      await fetchTale(res.id);
    } catch (err) {
      alert(err.message || 'Failed to add chapter.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const saveComment = (e) => {
    e.preventDefault();
    if (!commentForm.author.trim() || !commentForm.content.trim()) return;

    const newComment = {
      id: Math.random().toString(),
      author: commentForm.author,
      content: commentForm.content,
      side: comments.length % 2 === 0 ? 'left' : 'right',
      top: 80 + Math.random() * 240,
      rotate: Math.floor(Math.random() * 8) - 4,
    };

    const updated = [...comments, newComment];
    setComments(updated);
    localStorage.setItem(`eterna_tale_comments_${slug}`, JSON.stringify(updated));
    setCommentForm(prev => ({ ...prev, content: '' }));
    setIsCommenting(false);
  };

  const deleteComment = (id) => {
    const updated = comments.filter(c => c.id !== id);
    setComments(updated);
    localStorage.setItem(`eterna_tale_comments_${slug}`, JSON.stringify(updated));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-[4px] border-ink border-t-marker rounded-full animate-spin"></div>
    </div>
  );
  if (!tale) return <div className="text-center font-kalam text-4xl mt-12">Tale not found.</div>;

  const pages = activeChapter ? paginateContent(activeChapter.content) : [];
  const leftPageText = pages[bookIndex] || '';
  const rightPageText = pages[bookIndex + 1] || '';

  return (
    <div className="flex flex-col gap-10 select-none">
      
      {/* Title Header */}
      <div className="paper-card p-8 text-center bg-white rotate-1 tack-decoration">
        <h1 className="font-kalam text-4xl md:text-5xl mb-3">{tale.title}</h1>
        {tale.subtitle && <h2 className="font-patrick text-2xl text-ink/70 mb-4">{tale.subtitle}</h2>}
        <p className="font-patrick text-lg font-bold border-t-[3px] border-dashed border-ink inline-block pt-3">
          Authored by {tale.author_username}
          {user && tale.author_id !== user.id && (
            <button
              onClick={() => {
                setReportTargetType('TALE');
                setReportTargetId(tale.id);
                setShowReportModal(true);
              }}
              className="ml-3 hover:text-marker text-sm font-bold underline cursor-pointer"
            >
              🛡️ Report Tale
            </button>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar TOC */}
        <div className="lg:col-span-3 paper-card bg-postit p-6 sticky top-24 -rotate-1 tape-decoration">
          <h3 className="font-kalam text-3xl mb-4 border-b-[3px] border-ink pb-2">Chapters</h3>
          <ul className="flex flex-col gap-2 font-patrick text-xl">
            {tale.chapters.map((ch, idx) => (
              <li key={ch.id}>
                <button
                  onClick={() => {
                    setActiveChapter(ch);
                    setIsAddingChapter(false);
                  }}
                  className={`w-full text-left p-3 border-[3px] border-ink wobbly-sm transition-transform ${
                    !isAddingChapter && activeChapter?.id === ch.id 
                      ? 'bg-marker text-white rotate-2' 
                      : 'bg-white hover:-rotate-1 hover:bg-erased'
                  }`}
                >
                  <span className="font-bold mr-2">{idx + 1}.</span>
                  {ch.title}
                </button>
              </li>
            ))}
          </ul>
          
          {user && user.id === tale.author_id && (
            <button
              onClick={() => {
                setIsAddingChapter(true);
                setActiveChapter(null);
              }}
              className={`btn btn-primary w-full text-lg mt-4 -rotate-1 transition-transform ${
                isAddingChapter ? 'scale-95 opacity-80' : 'hover:-rotate-2'
              }`}
            >
              ➕ Add Chapter
            </button>
          )}

          {/* Add Comment / Margin Scribble Button */}
          <div className="mt-8 border-t-[3px] border-dashed border-ink/30 pt-6">
            <button
              onClick={() => setIsCommenting(!isCommenting)}
              className="btn btn-secondary w-full text-lg -rotate-1"
            >
              ✏️ Margin Scribble
            </button>
          </div>
        </div>

        {/* Reading Area */}
        <div className="lg:col-span-9 flex flex-col gap-6 relative">
          
          {/* New Margin Comment Creator Drawer */}
          {isCommenting && (
            <div className="paper-card bg-postit p-6 rotate-2 shadow-hard max-w-md mx-auto w-full border-[3px] border-ink animate-jitter">
              <h4 className="font-kalam text-2xl text-center mb-3">Scribble in the Margin</h4>
              <form onSubmit={saveComment} className="flex flex-col gap-3">
                <input
                  className="input bg-white"
                  placeholder="Your Name"
                  required
                  value={commentForm.author}
                  onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                />
                <textarea
                  className="input bg-white h-24"
                  placeholder="Scribble a reaction or thought..."
                  required
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                />
                <div className="flex gap-3">
                  <button type="submit" className="btn btn-primary flex-1">Pin Note</button>
                  <button type="button" onClick={() => setIsCommenting(false)} className="btn btn-secondary px-4">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Notebook open view or Add Chapter form */}
          {isAddingChapter ? (
            <div className="paper-card bg-white p-8 md:p-12 rotate-1 tape-decoration border-[4px] border-ink wobbly-md">
              <div className="text-center mb-6 border-b-[3px] border-dashed border-ink pb-4">
                <h3 className="font-kalam text-4xl">Add New Chapter</h3>
                <p className="font-patrick text-xl mt-2">Introduce a new page to the story.</p>
              </div>
              <form onSubmit={handleAddChapter} className="flex flex-col gap-6 font-patrick">
                <div>
                  <label className="input-label">Chapter Title</label>
                  <input
                    className="input bg-paper"
                    required
                    placeholder="e.g. The Quiet Woods"
                    value={chapterForm.title}
                    onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Order Number</label>
                  <input
                    type="number"
                    className="input bg-paper"
                    required
                    min="1"
                    value={chapterForm.order}
                    onChange={(e) => setChapterForm({ ...chapterForm, order: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label className="input-label">Content</label>
                  <textarea
                    className="input bg-paper min-h-[300px] whitespace-pre-wrap"
                    required
                    placeholder="Write the chapter content..."
                    value={chapterForm.content}
                    onChange={(e) => setChapterForm({ ...chapterForm, content: e.target.value })}
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn btn-primary text-xl flex-1 py-3" disabled={submitLoading}>
                    {submitLoading ? 'Saving...' : 'Publish Chapter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingChapter(false)}
                    className="btn btn-secondary text-xl px-6 py-3"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : activeChapter ? (
            <div className="relative">
              
              {/* Outer Margin Comments - Draggable & Dismissible */}
              <div className="hidden xl:block">
                {comments.map((comment) => (
                  <motion.div
                    drag
                    dragMomentum={false}
                    key={comment.id}
                    className={`absolute w-36 p-3 bg-postit border-2 border-ink wobbly-sm shadow-hard-hover text-left rotate-[${comment.rotate}deg] font-patrick cursor-grab active:cursor-grabbing z-30`}
                    style={{
                      left: comment.side === 'left' ? '-195px' : 'auto',
                      right: comment.side === 'right' ? '-195px' : 'auto',
                      top: `${comment.top}px`,
                      transform: `rotate(${comment.rotate}deg)`,
                    }}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteComment(comment.id); }}
                      className="absolute top-1 right-1 text-xs font-bold text-ink/40 hover:text-marker"
                      title="Remove note"
                    >
                      ✖
                    </button>
                    <div className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-marker border border-ink rounded-full" />
                    <span className="font-kalam text-sm font-bold text-ink/80 block border-b border-dashed border-ink/20 pb-1">{comment.author}</span>
                    <p className="text-sm mt-1 text-ink/90 leading-tight">{comment.content}</p>
                  </motion.div>
                ))}
              </div>

              {/* Physical Book Container */}
              <div className="paper-card bg-white border-[4px] border-ink wobbly-md shadow-hard relative overflow-hidden flex min-h-[500px]">
                
                {/* Spiral wire down the middle */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-4 flex flex-col justify-around items-center z-20 pointer-events-none">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="w-6 h-3.5 bg-erased border-2 border-ink rounded-full -rotate-12" />
                  ))}
                </div>

                {/* Left Page */}
                <div className="w-1/2 h-full bg-paper border-r-[2px] border-ink/30 p-8 flex flex-col justify-between relative min-h-[500px]">
                  {/* Lined notebook lines */}
                  <div 
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(45, 45, 45, 0.4) 1px, transparent 1px)',
                      backgroundSize: '100% 28px',
                      backgroundPosition: '0 40px',
                    }}
                  />

                  <div className="relative z-10">
                    <h3 className="font-kalam text-2xl text-ink/40 mb-6 uppercase tracking-wider">{tale.title}</h3>
                    {leftPageText ? (
                      <div 
                        className="font-patrick text-lg md:text-xl whitespace-pre-wrap text-ink/90"
                        style={{ lineHeight: '28px', paddingTop: '4px' }}
                      >
                        {bookIndex === 0 ? (
                          <>
                            {/* Drop Cap */}
                            <span className="float-left text-6xl font-kalam leading-none mr-2 mt-2 text-marker">{leftPageText.charAt(0)}</span>
                            {leftPageText.substring(1)}
                          </>
                        ) : (
                          leftPageText
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center text-ink/30">
                        <span className="text-4xl">✒️</span>
                        <p className="font-patrick text-lg mt-3">End of Chapter</p>
                      </div>
                    )}
                  </div>

                  <div className="font-kalam text-sm text-ink/40 text-left mt-12">
                    page {bookIndex + 1}
                  </div>
                </div>

                {/* Right Page */}
                <div className="w-1/2 h-full bg-paper p-8 flex flex-col justify-between relative min-h-[500px]">
                  {/* Lined notebook lines */}
                  <div 
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(45, 45, 45, 0.4) 1px, transparent 1px)',
                      backgroundSize: '100% 28px',
                      backgroundPosition: '0 40px',
                    }}
                  />

                  <div className="relative z-10">
                    <h3 className="font-kalam text-2xl text-ink/40 mb-6 uppercase tracking-wider">{activeChapter.title}</h3>
                    {rightPageText ? (
                      <div 
                        className="font-patrick text-lg md:text-xl whitespace-pre-wrap text-ink/90"
                        style={{ lineHeight: '28px', paddingTop: '4px' }}
                      >
                        {rightPageText}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center text-ink/30">
                        <span className="text-4xl">✒️</span>
                        <p className="font-patrick text-lg mt-3">End of Chapter</p>
                      </div>
                    )}
                  </div>

                  <div className="font-kalam text-sm text-ink/40 text-right mt-12">
                    page {bookIndex + 2}
                  </div>
                </div>

              </div>

              {/* Book Page Turner Controls */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setBookIndex(Math.max(0, bookIndex - 2))}
                  disabled={bookIndex === 0}
                  className="btn btn-secondary py-2 px-6"
                >
                  ◀ Flip Back
                </button>
                <span className="font-kalam text-xl">
                  Page {bookIndex + 1}-{bookIndex + 2} of {pages.length}
                </span>
                <button
                  onClick={() => setBookIndex(bookIndex + 2)}
                  disabled={bookIndex + 2 >= pages.length}
                  className="btn btn-primary py-2 px-6"
                >
                  Flip Next ▶
                </button>
              </div>

              {/* Mobile/Tablet list view for Margin Comments */}
              <div className="xl:hidden mt-8 paper-card p-6 rotate-1">
                <h4 className="font-kalam text-2xl mb-4 border-b-2 border-dashed border-ink/20 pb-2">Margin Comments</h4>
                <div className="flex flex-col gap-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-postit border-2 border-ink wobbly-sm font-patrick text-left relative">
                      <button 
                        onClick={() => deleteComment(comment.id)}
                        className="absolute top-2 right-2 text-xs font-bold text-ink/40 hover:text-marker"
                        title="Remove note"
                      >
                        ✖
                      </button>
                      <span className="font-kalam text-base font-bold text-ink/80 block border-b border-dashed border-ink/20 pb-1">{comment.author}</span>
                      <p className="text-lg mt-1 text-ink/90">{comment.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && <p className="font-patrick text-lg italic text-ink/40">No scribbles left here yet.</p>}
                </div>
              </div>

            </div>
          ) : (
            <div className="paper-card bg-white p-20 text-center">
              <p className="font-kalam text-3xl mb-6">{tale.description}</p>
              <p className="font-patrick text-2xl text-marker font-bold rotate-2 animate-bounce">Select a chapter from the notes to begin.</p>
            </div>
          )}

        </div>

      </div>

      {showReportModal && (
        <ReportModal
          targetType={reportTargetType}
          targetId={reportTargetId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
