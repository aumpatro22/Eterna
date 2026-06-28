import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { compressImage } from '../utils/imageCompression';

export default function MemorialCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Load tags on mount
  useEffect(() => {
    api.get('/api/memorials/tags/')
      .then(data => setAvailableTags(data))
      .catch(err => console.error('Failed to load tags:', err));
  }, []);

  const [form, setForm] = useState({
    full_name: '',
    birth_date: '',
    passing_date: '',
    biography: '',
    profile_image: null,
    cover_image: null,
    visibility: 'PUBLIC',
    use_ai_image: false,
    image_prompt: '',
    generate_tribute: false,
    relationship: '',
    memories: ''
  });

  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [tempEvent, setTempEvent] = useState({ event_date: '', title: '', description: '', image: null });

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const addTimelineEvent = () => {
    if (!tempEvent.event_date || !tempEvent.title) return;
    setTimelineEvents([...timelineEvents, tempEvent]);
    setTempEvent({ event_date: '', title: '', description: '', image: null });
  };

  const removeTimelineEvent = (index) => {
    setTimelineEvents(timelineEvents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('full_name', form.full_name);
      if (form.birth_date) formData.append('birth_date', form.birth_date);
      if (form.passing_date) formData.append('passing_date', form.passing_date);
      formData.append('biography', form.biography);
      formData.append('visibility', form.visibility);
      
      if (form.profile_image) formData.append('profile_image', form.profile_image);
      if (form.cover_image) formData.append('cover_image', form.cover_image);

      if (form.use_ai_image) {
        formData.append('use_ai_image', 'true');
        formData.append('image_prompt', form.image_prompt);
      }
      if (form.generate_tribute) {
        formData.append('generate_tribute', 'true');
        formData.append('relationship', form.relationship);
        formData.append('memories', form.memories);
      }

      selectedTags.forEach(id => {
        formData.append('tags', id);
      });

      const data = await api.post('/api/memorials/create/', formData);

      // Upload additional photos
      for (const file of additionalPhotos) {
        const photoData = new FormData();
        photoData.append('image', file);
        await api.post(`/api/memorials/${data.id}/photos/`, photoData);
      }

      // Upload timeline events
      for (const ev of timelineEvents) {
        const evData = new FormData();
        evData.append('event_date', ev.event_date);
        evData.append('title', ev.title);
        evData.append('description', ev.description);
        if (ev.image) {
          evData.append('image', ev.image);
        }
        await api.post(`/api/memorials/${data.id}/timeline/`, evData);
      }

      navigate(`/memorial/${data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create memorial.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="paper-card p-5 sm:p-6 md:p-12 -rotate-1 tape-decoration">
        <div className="text-center mb-10 border-b-[3px] border-dashed border-ink pb-6">
          <h1 className="font-kalam text-5xl mb-4">Start a New Sketchbook</h1>
          <p className="font-patrick text-2xl text-ink/75">Record the life, timeline, and stories of someone special.</p>
        </div>

        {error && (
          <div className="bg-marker/20 border-[3px] border-marker p-4 wobbly-sm font-patrick text-xl text-ink font-bold mb-8 rotate-1">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          
          {/* Section 1: The Basics */}
          <section className="bg-erased p-6 border-[3px] border-ink wobbly-sm rotate-1">
            <h3 className="font-kalam text-3xl mb-6">1. The Basics</h3>
            <div className="flex flex-col gap-6">
              <div>
                <label className="input-label">Full Name *</label>
                <input 
                  className="input" 
                  required 
                  value={form.full_name} 
                  onChange={e => setForm({...form, full_name: e.target.value})} 
                  placeholder="e.g. John Doe" 
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="input-label">Date of Birth</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={form.birth_date} 
                    onChange={e => setForm({...form, birth_date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="input-label">Date of Passing</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={form.passing_date} 
                    onChange={e => setForm({...form, passing_date: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Biography</label>
                <textarea 
                  className="input font-patrick text-xl" 
                  rows="4" 
                  value={form.biography} 
                  onChange={e => setForm({...form, biography: e.target.value})} 
                  placeholder="Tell their life story..."
                ></textarea>
              </div>
              <div>
                <label className="input-label">Privacy Visibility</label>
                <select 
                  className="input font-patrick text-xl bg-white" 
                  value={form.visibility} 
                  onChange={e => setForm({...form, visibility: e.target.value})}
                >
                  <option value="PUBLIC">Public (Visible to everyone)</option>
                  <option value="FAMILY_ONLY">Family Only (Visible to invited family & editors)</option>
                  <option value="PRIVATE">Private (Visible only to owner)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Experience Tags */}
          {availableTags.length > 0 && (
            <section className="bg-postit p-6 border-[3px] border-ink wobbly-sm -rotate-1">
              <h3 className="font-kalam text-3xl mb-4">2. Share Journeys</h3>
              <p className="font-patrick text-xl mb-6 text-ink/75">Select one or more life experience tags to connect with others who understand:</p>
              <div className="flex flex-wrap gap-2 md:gap-4">
                {availableTags.map(tag => {
                  const selected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-4 py-2 border-[3px] border-ink font-patrick text-xl transition-all wobbly-xs ${
                        selected ? 'bg-marker text-white rotate-2 scale-105' : 'bg-white md:hover:bg-erased -rotate-1'
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 3: Photos */}
          <section className="bg-white p-6 border-[3px] border-ink wobbly-sm rotate-1">
            <h3 className="font-kalam text-3xl mb-6">3. Photos</h3>
            <div className="grid md:grid-cols-2 gap-6 pb-6 border-b-[2px] border-dashed border-ink/30">
              <div className={form.use_ai_image ? 'opacity-50 pointer-events-none' : ''}>
                <label className="input-label">Profile Image (Portrait)</label>
                <input 
                  type="file" 
                  className="input bg-white" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const compressed = await compressImage(file);
                      setForm({...form, profile_image: compressed});
                    }
                  }} 
                />
              </div>
              <div>
                <label className="input-label">Cover Image (Landscape Banner)</label>
                <input 
                  type="file" 
                  className="input bg-white" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const compressed = await compressImage(file);
                      setForm({...form, cover_image: compressed});
                    }
                  }} 
                />
              </div>
            </div>

            {/* AI Image Option */}
            <div className="mt-6">
              <label className="flex items-center gap-4 cursor-pointer font-kalam text-2xl group">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={form.use_ai_image} 
                  onChange={e => setForm({...form, use_ai_image: e.target.checked})} 
                />
                <div className={`w-8 h-8 border-[3px] border-ink wobbly-sm flex items-center justify-center transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-dotted peer-focus-visible:outline-offset-[4.5px] peer-focus-visible:outline-ink ${form.use_ai_image ? 'bg-marker' : 'bg-white'}`}>
                  {form.use_ai_image && <span className="text-white">✓</span>}
                </div>
                <span className="group-hover:underline decoration-wavy">✨ Generate Profile Sketch with AI</span>
              </label>
              
              {form.use_ai_image && (
                <div className="mt-6 animate-fade-in pl-12 border-l-[3px] border-ink ml-4">
                  <label className="input-label">Describe the portrait style</label>
                  <input 
                    className="input bg-white" 
                    value={form.image_prompt} 
                    onChange={e => setForm({...form, image_prompt: e.target.value})} 
                    placeholder='e.g., "A gentle sketch of an old smiling grandfather in spectacles"' 
                    required={form.use_ai_image} 
                  />
                </div>
              )}
            </div>

            {/* Additional Photos Upload */}
            <div className="mt-6 pt-6 border-t-[2px] border-dashed border-ink/30">
              <label className="input-label">Upload Additional Memory Photos (Multiple)</label>
              <input 
                type="file" 
                multiple 
                className="input bg-white" 
                accept="image/*" 
                onChange={async (e) => {
                  const files = Array.from(e.target.files);
                  const compressedFiles = [];
                  for (const file of files) {
                    const compressed = await compressImage(file);
                    compressedFiles.push(compressed);
                  }
                  setAdditionalPhotos(compressedFiles);
                }} 
              />
              {additionalPhotos.length > 0 && (
                <p className="font-patrick text-lg text-ink/70 mt-2">
                  {additionalPhotos.length} additional photo(s) selected.
                </p>
              )}
            </div>
          </section>

          {/* Section 4: Timeline Builder */}
          <section className="bg-erased p-6 border-[3px] border-ink wobbly-sm -rotate-1">
            <h3 className="font-kalam text-3xl mb-4">4. Chronological Timeline</h3>
            <p className="font-patrick text-xl mb-6 text-ink/75">Add important milestones, accomplishments, or memorable life events:</p>
            
            {/* Added Events List */}
            {timelineEvents.length > 0 && (
              <div className="flex flex-col gap-4 mb-6">
                {timelineEvents.map((ev, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-4 border-[2px] border-ink font-patrick text-xl wobbly-xs">
                    <div>
                      <strong className="font-bold font-kalam text-xl mr-2">{ev.event_date}</strong> 
                      <span>{ev.title}</span>
                      {ev.description && <p className="text-sm text-ink/70 mt-1">{ev.description}</p>}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeTimelineEvent(index)}
                      className="text-marker font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Event Form */}
            <div className="bg-white p-4 border-[2px] border-ink wobbly-xs flex flex-col gap-4">
              <h4 className="font-kalam text-2xl text-ink">Add a Milestone</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label text-sm">Event Date *</label>
                  <input 
                    type="date" 
                    className="input py-2" 
                    value={tempEvent.event_date} 
                    onChange={e => setTempEvent({...tempEvent, event_date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="input-label text-sm">Milestone Title *</label>
                  <input 
                    className="input py-2" 
                    placeholder="e.g. Graduated University, Married" 
                    value={tempEvent.title} 
                    onChange={e => setTempEvent({...tempEvent, title: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="input-label text-sm">Milestone Description (Optional)</label>
                <textarea 
                  className="input py-2" 
                  rows="2" 
                  placeholder="Detail this milestone..." 
                  value={tempEvent.description} 
                  onChange={e => setTempEvent({...tempEvent, description: e.target.value})}
                />
              </div>
              <div>
                <label className="input-label text-sm">Milestone Photo (Optional)</label>
                <input 
                  type="file" 
                  className="input py-2 bg-white" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const compressed = await compressImage(file);
                      setTempEvent({...tempEvent, image: compressed});
                    }
                  }} 
                />
              </div>
              <button
                type="button"
                onClick={addTimelineEvent}
                className="btn btn-secondary py-2 text-xl font-patrick w-fit self-end"
                disabled={!tempEvent.event_date || !tempEvent.title}
              >
                + Add Milestone to List
              </button>
            </div>
          </section>

          {/* Section 5: AI Tribute */}
          <section className="bg-postit p-6 border-[3px] border-ink wobbly-sm rotate-1 tack-decoration">
            <h3 className="font-kalam text-3xl mb-6">5. AI Tribute Writer</h3>
            
            <label className="flex items-center gap-4 cursor-pointer font-kalam text-2xl group">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={form.generate_tribute} 
                onChange={e => setForm({...form, generate_tribute: e.target.checked})} 
              />
              <div className={`w-8 h-8 border-[3px] border-ink wobbly-sm flex items-center justify-center transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-dotted peer-focus-visible:outline-offset-[4.5px] peer-focus-visible:outline-ink ${form.generate_tribute ? 'bg-marker' : 'bg-white'}`}>
                {form.generate_tribute && <span className="text-white">✓</span>}
              </div>
              <span className="group-hover:underline decoration-wavy">✨ Let AI help draft a beautiful tribute</span>
            </label>
            
            {form.generate_tribute && (
              <div className="mt-6 flex flex-col gap-6 animate-fade-in pl-12 border-l-[3px] border-ink ml-4">
                <div>
                  <label className="input-label">Your Relationship</label>
                  <input 
                    className="input bg-white" 
                    placeholder="e.g. Grandson, Daughter, Close Friend" 
                    value={form.relationship} 
                    onChange={e => setForm({...form, relationship: e.target.value})} 
                    required={form.generate_tribute} 
                  />
                </div>
                <div>
                  <label className="input-label">Key Memories or Traits</label>
                  <textarea 
                    className="input bg-white font-patrick text-xl" 
                    rows="4" 
                    placeholder="e.g. Always cooked mango pickle on Sundays, taught me how to fish, had a infectious laugh..." 
                    value={form.memories} 
                    onChange={e => setForm({...form, memories: e.target.value})} 
                    required={form.generate_tribute} 
                  />
                </div>
                <p className="font-patrick text-lg text-ink/70">
                  Note: The AI will structure these into a cohesive tribute. AI will never invent facts or memories.
                </p>
              </div>
            )}
          </section>

          <button 
            type="submit" 
            className="btn btn-primary text-3xl py-4 mt-4 rotate-1 w-full" 
            disabled={loading}
          >
            {loading ? (form.use_ai_image || form.generate_tribute ? 'Drawing & Writing with AI...' : 'Creating...') : 'Publish Memorial'}
          </button>
        </form>
      </div>
    </div>
  );
}
