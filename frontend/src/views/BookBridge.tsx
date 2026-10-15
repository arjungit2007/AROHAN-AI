import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { BookListing, BookRequest } from '../types';
import { EmptyState, ErrorState, LoadingState } from '../components/common/RequestState';
import { 
  BookOpen, 
  Search, 
  Plus, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Check, 
  Sparkles,
  Inbox
} from 'lucide-react';

interface BookBridgeProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const BookBridge: React.FC<BookBridgeProps> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [books, setBooks] = useState<BookListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Modals & Forms
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);
  const [requestingBook, setRequestingBook] = useState<BookListing | null>(null);
  const [requestNote, setRequestNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // User's own listings & requests tab
  const [activeTab, setActiveTab] = useState<'browse' | 'my_listings' | 'my_requests'>('browse');
  const [myListings, setMyListings] = useState<BookListing[]>([]);
  const [myRequests, setMyRequests] = useState<BookRequest[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  // Form State for new listing
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newClass, setNewClass] = useState('Class 10');
  const [newLanguage, setNewLanguage] = useState('English / Tamil');
  const [newCondition, setNewCondition] = useState<'like_new' | 'good' | 'fair'>('good');
  const [newGeneralArea, setNewGeneralArea] = useState('Thanjavur Old Bus Stand area');
  const [newCollectionPoint, setNewCollectionPoint] = useState('Town Central Library Counter');
  const [newNotes, setNewNotes] = useState('');

  const fetchBooks = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await api.getBooks({
        q: searchQuery || undefined,
        subject: subjectFilter || undefined,
        class_or_exam: classFilter || undefined,
        status: 'available'
      });
      setBooks(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Could not load books. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    if (!user) return;
    setIsLoadingActivity(true);
    setActivityError(null);
    try {
      const [listings, reqs] = await Promise.all([
        api.getMyBookListings(),
        api.getMyBookRequests()
      ]);
      setMyListings(listings);
      setMyRequests(reqs);
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : 'Could not load your BookBridge activity. Please retry.');
    } finally {
      setIsLoadingActivity(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    if (user) {
      fetchUserActivity();
    }
  }, [activeTab]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await api.createBookListing({
        title: newTitle,
        author: newAuthor,
        subject: newSubject,
        class_or_exam: newClass,
        language: newLanguage,
        condition: newCondition,
        general_pickup_area: newGeneralArea,
        collection_point_name: newCollectionPoint,
        notes: newNotes
      });
      setIsNewListingModalOpen(false);
      setSuccessBanner('Book listed successfully! Thank you for sharing knowledge with fellow students.');
      fetchBooks();
      fetchUserActivity();
      // Reset form
      setNewTitle('');
      setNewAuthor('');
      setNewNotes('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not list the book. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendRequest = async () => {
    if (!requestingBook) return;
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await api.requestBook(requestingBook.id, requestNote);
      setRequestingBook(null);
      setRequestNote('');
      setSuccessBanner(`Your request for "${requestingBook.title}" has been sent to the donor.`);
      fetchBooks();
      fetchUserActivity();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not request this book. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
              Community Book Sharing
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              Zero Cost • Non-Commercial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            BookBridge: Educational Textbook Sharing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Donate or receive NCERT, Samacheer Kalvi, NEET/JEE, and TNPSC books. Handover occurs safely via registered public libraries and panchayat collection hubs.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) onOpenAuth('login');
              else {
                setFormError(null);
                setIsNewListingModalOpen(true);
              }
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Donate a Book</span>
        </button>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} aria-label="Dismiss success message" className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'browse'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Available Books Directory
        </button>
        {user && (
          <>
            <button
              onClick={() => setActiveTab('my_requests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'my_requests'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>My Requests ({myRequests.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('my_listings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'my_listings'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>My Donations ({myListings.length})</span>
            </button>
          </>
        )}
      </div>

      {/* Tab 1: Browse Available Books */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <form onSubmit={(event) => { event.preventDefault(); fetchBooks(); }} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                aria-label="Search donated books"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, author, or subject (e.g. Mathematics, Samacheer, TNPSC)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="min-h-11 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition disabled:opacity-60"
            >
              Search
            </button>
          </form>

          {/* Books Grid */}
          {isLoading ? (
            <LoadingState label="Loading donated books..." />
          ) : fetchError ? (
            <ErrorState message={fetchError} onRetry={fetchBooks} />
          ) : books.length === 0 ? (
            <EmptyState title="No books match your search" description="Try another title, subject, or class. You can also list a book for donation." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {books.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-purple-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
                        {b.subject}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {b.condition.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">
                      {b.author || 'Board Edition'} • {b.class_or_exam}
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1 mb-4 border border-slate-100">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Pickup: {b.general_pickup_area}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Hub: {b.collection_point_name}
                      </p>
                      {b.notes && (
                        <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200/50">
                          "{b.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) onOpenAuth('login');
                      else {
                        setFormError(null);
                        setRequestingBook(b);
                      }
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Request This Book
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Requests */}
      {activeTab === 'my_requests' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Your Submitted Book Requests</h3>
          {isLoadingActivity ? (
            <LoadingState label="Loading your book requests..." />
          ) : activityError ? (
            <ErrorState message={activityError} onRetry={fetchUserActivity} />
          ) : myRequests.length === 0 ? (
            <EmptyState title="No book requests yet" description="Browse available books to request a free textbook." actionLabel="Browse books" onAction={() => setActiveTab('browse')} />
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{req.book_title}</h4>
                    <p className="text-[11px] text-slate-500">Requested note: {req.request_note}</p>
                    {req.safe_handover_details && (
                      <p className="text-[11px] font-bold text-emerald-700 mt-1">
                        Handover: {req.safe_handover_details}
                      </p>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Donations */}
      {activeTab === 'my_listings' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Books You Have Listed</h3>
          {isLoadingActivity ? (
            <LoadingState label="Loading your donated books..." />
          ) : activityError ? (
            <ErrorState message={activityError} onRetry={fetchUserActivity} />
          ) : myListings.length === 0 ? (
            <EmptyState title="No donations listed yet" description="Share a textbook with a student in your community." actionLabel="Donate a book" onAction={() => setIsNewListingModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myListings.map((listing) => (
                <div key={listing.id} className="bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{listing.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 capitalize">
                      {listing.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{listing.subject} • {listing.class_or_exam}</p>
                  <p className="text-[11px] text-slate-600 mt-2">Hub: {listing.collection_point_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Request Modal */}
      {requestingBook && (
        <div role="dialog" aria-modal="true" aria-labelledby="book-request-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 id="book-request-title" className="font-bold text-slate-900 text-sm">Request Donated Book</h3>
              <button onClick={() => setRequestingBook(null)} aria-label="Close book request" className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}

            <p className="text-xs font-bold text-slate-800 mb-1">{requestingBook.title}</p>
            <p className="text-[11px] text-slate-500 mb-4">
              Pickup Area: {requestingBook.general_pickup_area} ({requestingBook.collection_point_name})
            </p>

            <div className="mb-4">
              <label htmlFor="book-request-note" className="block text-xs font-semibold text-slate-700 mb-1">
                Note to Donor (e.g. your class, study goals)
              </label>
              <textarea
                id="book-request-note"
                rows={3}
                required
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                placeholder="I am preparing for my 10th board exams and need this guide..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRequestingBook(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!requestNote.trim() || isSubmitting}
                onClick={handleSendRequest}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition"
              >
                {isSubmitting ? 'Sending Request...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Listing Modal */}
      {isNewListingModalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="book-listing-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 id="book-listing-title" className="font-bold text-slate-900 text-base">Donate a Book on BookBridge</h3>
                <p className="text-[11px] text-slate-500">Help a student study without financial burden</p>
              </div>
              <button onClick={() => setIsNewListingModalOpen(false)} aria-label="Close book listing" className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}

            <form onSubmit={handleCreateListing} className="space-y-3.5 text-xs">
              <div>
                <label htmlFor="listing-title" className="block font-bold text-slate-700 mb-1">Book Title *</label>
                <input
                  id="listing-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. NCERT Mathematics Class 10"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="listing-author" className="block font-bold text-slate-700 mb-1">Author or Publisher</label>
                <input
                  id="listing-author"
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. NCERT"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="listing-subject" className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <input
                    id="listing-subject"
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="listing-class" className="block font-bold text-slate-700 mb-1">Class / Exam *</label>
                  <input
                    id="listing-class"
                    type="text"
                    required
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="e.g. Class 10 / TNPSC"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="listing-language" className="block font-bold text-slate-700 mb-1">Language</label>
                  <input
                    id="listing-language"
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="listing-condition" className="block font-bold text-slate-700 mb-1">Condition</label>
                  <select
                    id="listing-condition"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  >
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair (Usable)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                <p className="font-bold mb-0.5">Youth & Privacy Safeguard:</p>
                <p>Never enter personal home addresses or private phone numbers. Specify a public pickup area and designated community hub.</p>
              </div>

              <div>
                <label htmlFor="listing-pickup-area" className="block font-bold text-slate-700 mb-1">General Pickup Area *</label>
                <input
                  id="listing-pickup-area"
                  type="text"
                  required
                  value={newGeneralArea}
                  onChange={(e) => setNewGeneralArea(e.target.value)}
                  placeholder="e.g. Near Thanjavur Old Bus Stand"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label htmlFor="listing-collection-point" className="block font-bold text-slate-700 mb-1">Collection Point / Hub</label>
                <input
                  id="listing-collection-point"
                  type="text"
                  value={newCollectionPoint}
                  onChange={(e) => setNewCollectionPoint(e.target.value)}
                  placeholder="e.g. Town Central Library Desk"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label htmlFor="listing-notes" className="block font-bold text-slate-700 mb-1">Optional Notes</label>
                <textarea
                  id="listing-notes"
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Includes solved model question papers..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewListingModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition"
                >
                  {isSubmitting ? 'Listing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
