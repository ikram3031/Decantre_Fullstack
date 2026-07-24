import React, { useState } from 'react';
import { Star, MessageSquare, Plus, Check, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Reviews = () => {
  const { addToast, products } = useApp();

  // Initial static reviews
  const [reviewsList, setReviewsList] = useState([
    {
      id: 1,
      name: 'Viscount Sterling',
      location: 'London, UK',
      rating: 5,
      fragrance: 'Oud Impérial',
      text: 'Oud Impérial is an architectural marvel in liquid form. The dry-down of royal leather coupled with golden saffron is absolutely divine. I wear it to international meetings and the silage commands supreme respect.',
      date: '2026-06-12'
    },
    {
      id: 2,
      name: 'Elena Rostova',
      location: 'Paris, France',
      rating: 5,
      fragrance: 'Nectar de Saphir',
      text: 'I was skeptic about ordering L\'Élixir online but Nectar de Saphir has changed everything. The champagne rose and warm Madagascar vanilla is soft yet incredibly hypnotic. It persists past 24 hours on my coat.',
      date: '2026-06-28'
    },
    {
      id: 3,
      name: 'Marcus Vance',
      location: 'New York, USA',
      rating: 5,
      fragrance: 'Saffron Mystique',
      text: 'Saffron Mystique is a sensory goldmine. It smells like hot spice balanced perfectly with black amber and tonka. The packaging is just stunning - a beautiful black box that feels like premium jewelry.',
      date: '2026-07-02'
    },
    {
      id: 4,
      name: 'Sophia Lindqvist',
      location: 'Stockholm, Sweden',
      rating: 4,
      fragrance: 'Bergamote Sauvage',
      text: 'Extremely clean, bright, and invigorating! The opening note of Calabrian bergamot combined with sea salt is incredibly fresh. Perfect for hot summer mornings. I wish the top note lingered just a tiny bit longer, but the dry-down is fantastic.',
      date: '2026-07-10'
    },
    {
      id: 5,
      name: 'Aurelia Dubois',
      location: 'Grasse, France',
      rating: 5,
      fragrance: 'Rose Absolue',
      text: 'A rose scent unlike any other. It avoids the typical synthetic sweetness and instead smells like a dewy rose garden at dawn. The hint of dark patchouli in the heart notes adds a gorgeous and mysterious depth.',
      date: '2026-07-14'
    }
  ]);

  // Review Form States
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formFragrance, setFormFragrance] = useState(products[0]?.name || 'Oud Impérial');
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterFragrance, setFilterFragrance] = useState('All');

  // Submit Review Handler
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formText) {
      addToast('Please provide a name and your review message.', 'error');
      return;
    }

    const newReview = {
      id: Date.now(),
      name: formName,
      location: formLocation || 'Global Connoisseur',
      rating: formRating,
      fragrance: formFragrance,
      text: formText,
      date: new Date().toISOString().split('T')[0]
    };

    setReviewsList([newReview, ...reviewsList]);
    addToast('Thank you! Your sovereign review was verified and added.', 'success');

    // Reset Form
    setFormName('');
    setFormLocation('');
    setFormText('');
    setFormRating(5);
    setIsFormOpen(false);
  };

  // Filter reviews
  const filteredReviews = filterFragrance === 'All'
    ? reviewsList
    : reviewsList.filter(r => r.fragrance === filterFragrance);

  return (
    <div className="py-12 sm:py-20 bg-luxury-black animate-fade-in text-left">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center space-y-4 mb-16 relative py-12 border-b border-gold/15">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium block">Verified Testimonial Ledger</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-luxury-white tracking-wide">
            MEMBER VERDICTS
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed">
            Read and publish authentic scent reviews. Filter verdicts by individual fragrance labels to inspect their chemical behavior and sillage longevity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          {/* Scent filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gold shrink-0" />
            <select
              value={filterFragrance}
              onChange={(e) => setFilterFragrance(e.target.value)}
              className="bg-luxury-dark border border-white/10 text-zinc-300 text-xs rounded-sm px-4 py-2.5 outline-none focus:border-gold/60 font-sans tracking-wide"
            >
              <option value="All">All Fragrance Labels</option>
              {products.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Toggle form button */}
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="inline-flex items-center gap-2 bg-gold text-black text-xs font-sans font-bold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-gold/90 transition-all duration-300 shrink-0 shadow-lg shadow-gold/5"
          >
            {isFormOpen ? 'Close Review Form' : 'Write a Sovereign Review'}
            {isFormOpen ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Dynamic Review Submission Form */}
        {isFormOpen && (
          <div className="mb-16 p-6 sm:p-8 bg-luxury-dark border border-gold/20 rounded-sm animate-fade-in">
            <h3 className="text-lg font-serif text-gold font-light mb-6">PUBLISH YOUR VERDICT</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-zinc-400 block mb-2">FullName</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Baron Alexis"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-gold/60 text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-zinc-400 block mb-2">Your Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Monaco, France"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-gold/60 text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-zinc-400 block mb-2">Select Scent Label</label>
                  <select
                    value={formFragrance}
                    onChange={(e) => setFormFragrance(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-gold/60 text-zinc-300 text-xs px-4 py-3 outline-none rounded-sm font-sans"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-zinc-400 block mb-2">Olfactory Rating</label>
                  <div className="flex items-center gap-2 pt-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setFormRating(stars)}
                        className="hover:scale-110 transition-transform duration-100"
                      >
                        <Star className={`w-6 h-6 ${stars <= formRating ? 'fill-gold text-gold' : 'text-zinc-600'}`} />
                      </button>
                    ))}
                    <span className="text-xs text-zinc-400 font-mono ml-2">({formRating} / 5)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-widest text-zinc-400 block mb-2">Your Scent Journey / Message</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Share details about the scent evolution, sillage, longevity, or overall aura..."
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-gold/60 text-zinc-200 text-xs p-4 outline-none rounded-sm font-sans leading-relaxed resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-3 border border-white/5 hover:border-white/10 text-zinc-400 text-xs font-sans uppercase tracking-widest rounded-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gold text-black text-xs font-sans font-bold uppercase tracking-widest rounded-sm hover:bg-gold/95 transition-all shadow-lg shadow-gold/5"
                >
                  Publish Sovereign Review
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16 border border-white/5 rounded-sm bg-luxury-dark/10">
              <MessageSquare className="w-8 h-8 text-gold/30 mx-auto mb-3" />
              <p className="text-zinc-500 text-xs font-sans font-light">No reviews posted for this scent label yet.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-luxury-dark/30 border border-white/5 hover:border-gold/20 p-6 sm:p-8 rounded-sm shadow-2xl space-y-4 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-serif text-xs text-gold font-semibold">
                      {review.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-bold uppercase text-zinc-200 tracking-wider">
                        {review.name}
                      </h4>
                      <span className="text-[9px] text-zinc-500 font-sans uppercase tracking-widest">
                        {review.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${idx < review.rating ? 'fill-gold text-gold' : 'text-zinc-700'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {review.date}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="inline-block bg-gold/10 border border-gold/20 px-3 py-1 rounded-full">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-gold">
                      Scent Selection: {review.fragrance}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-xs sm:text-sm font-sans font-light leading-relaxed italic">
                    "{review.text}"
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
export default Reviews;
