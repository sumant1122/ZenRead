'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, BookOpen, Clock, FileText, ArrowRight, ExternalLink, Trash2, History, Menu, X } from 'lucide-react';

interface BlogHistoryItem {
  url: string;
  title: string;
  wordCount: number;
  readingTime: number;
  progress: number;
  content: string; // storing content to avoid refetching
  lastRead: number;
}

export default function BlogTracker() {
  const [url, setUrl] = useState('');
  const [blogData, setBlogData] = useState<BlogHistoryItem | null>(null);
  const [history, setHistory] = useState<BlogHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false); // For mobile responsiveness
  const readerRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('blogHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('blogHistory', JSON.stringify(history));
  }, [history]);

  // Update current blog progress in history
  useEffect(() => {
    if (blogData) {
      setHistory(prevHistory => 
        prevHistory.map(item => 
          item.url === blogData.url 
            ? { ...item, progress: Math.max(item.progress, scrollProgress), lastRead: Date.now() } 
            : item
        )
      );
    }
  }, [scrollProgress, blogData]);

  const fetchBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Check if already in history
    const existingBlog = history.find(item => item.url === url);
    if (existingBlog) {
      loadFromHistory(existingBlog);
      return;
    }

    setLoading(true);
    setError('');
    setBlogData(null);

    try {
      const response = await axios.get(`/api/fetch-blog?url=${encodeURIComponent(url)}`);
      const newBlog: BlogHistoryItem = {
        url,
        title: response.data.title,
        wordCount: response.data.wordCount,
        readingTime: response.data.readingTime,
        content: response.data.content,
        progress: 0,
        lastRead: Date.now()
      };
      
      setBlogData(newBlog);
      setHistory(prev => [newBlog, ...prev]);
      setScrollProgress(0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch blog content');
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: BlogHistoryItem) => {
    setBlogData(item);
    setUrl(item.url);
    setScrollProgress(item.progress);
    // Reset scroll position roughly to where they left off (approximation)
    // In a real app, you might store exact scrollY position
    setTimeout(() => {
      // Allow DOM to update first
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }, 100);
    setShowSidebar(false); // Close sidebar on mobile on selection
  };

  const deleteFromHistory = (urlToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.url !== urlToDelete));
    if (blogData && blogData.url === urlToDelete) {
      setBlogData(null);
      setUrl('');
      setScrollProgress(0);
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your reading history?')) {
      setHistory([]);
      setBlogData(null);
      setUrl('');
      setScrollProgress(0);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!readerRef.current) return;
      
      const element = readerRef.current;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;
      
      const scrollableDistance = elementHeight - windowHeight;

      if (scrollableDistance <= 0) {
         setScrollProgress(100);
         return;
      }

      const currentScroll = window.scrollY - elementTop;
      const progress = (currentScroll / scrollableDistance) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [blogData]); // Re-bind when blogData changes (DOM changes)

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Mobile Toggle */}
      <button 
        className="btn btn-outline-secondary d-md-none position-fixed m-3"
        style={{ zIndex: 1050, top: 0, left: 0 }}
        onClick={() => setShowSidebar(!showSidebar)}
      >
        {showSidebar ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`bg-white border-end d-flex flex-column transition-transform ${showSidebar ? 'translate-x-0 shadow-lg' : ''}`}
        style={{ 
          width: '320px', 
          height: '100vh', 
          position: 'fixed',
          left: 0,
          top: 0,
          overflowY: 'auto',
          zIndex: 1040,
          transform: showSidebar ? 'translateX(0)' : 'translateX(0)', // Handle via CSS class in real responsive design, here manual style
        }}
      >
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
          <div className="d-flex align-items-center fw-bold text-primary">
            <History className="me-2" size={20} />
            Reading List
          </div>
          {history.length > 0 && (
            <button className="btn btn-sm btn-outline-danger" onClick={clearHistory} title="Clear History">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="list-group list-group-flush flex-grow-1">
          {history.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <p className="small mb-0">No blogs read yet.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.url}
                className={`list-group-item list-group-item-action py-3 ${blogData?.url === item.url ? 'active border-start border-4 border-primary' : ''}`}
                onClick={() => loadFromHistory(item)}
                style={{ cursor: 'pointer', borderLeft: blogData?.url === item.url ? '4px solid #0d6efd' : 'none' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="mb-0 text-truncate" style={{ maxWidth: '200px' }} title={item.title}>
                    {item.title}
                  </h6>
                  <button 
                    className="btn btn-link text-danger p-0 ms-2 opacity-50 hover-opacity-100"
                    onClick={(e) => deleteFromHistory(item.url, e)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="d-flex align-items-center small text-muted mb-2">
                  <span className="me-3">{item.wordCount} words</span>
                  <span>{item.readingTime} min</span>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div 
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${item.progress}%` }}
                    aria-valuenow={item.progress} 
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow-1" style={{ marginLeft: '320px', width: 'calc(100% - 320px)' }}>
        <div className="container py-5">
          <header className="text-center mb-5">
            <h1 className="display-5 fw-bold mb-3">Blog Reading Tracker</h1>
            <p className="text-muted">Paste a URL to add to your library.</p>
          </header>

          <div className="row justify-content-center mb-5">
            <div className="col-lg-10">
              <form onSubmit={fetchBlog} className="input-group input-group-lg shadow-sm">
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/blog-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <button className="btn btn-primary d-flex align-items-center" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="spinner-border spinner-border-sm me-2" /> : <ArrowRight className="me-2" size={20} />}
                  {loading ? 'Fetching...' : 'Track'}
                </button>
              </form>
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
          </div>

          {blogData ? (
            <div className="row justify-content-center">
              <div className="col-lg-10">
                {/* Stats Bar */}
                <div className="sticky-top bg-white py-3 border-bottom mb-4 shadow-sm rounded px-3" style={{ top: '1rem', zIndex: 1000 }}>
                  <div className="row align-items-center mb-2">
                    <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start mb-2 mb-md-0">
                      <FileText className="text-primary me-2" size={18} />
                      <span className="fw-semibold">{blogData.wordCount} words</span>
                    </div>
                    <div className="col-md-4 d-flex align-items-center justify-content-center mb-2 mb-md-0">
                      <Clock className="text-primary me-2" size={18} />
                      <span className="fw-semibold">{blogData.readingTime} min read</span>
                    </div>
                    <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-end">
                      <BookOpen className="text-primary me-2" size={18} />
                      <span className="fw-semibold">{Math.round(scrollProgress)}% read</span>
                    </div>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      style={{ width: `${scrollProgress}%` }}
                      aria-valuenow={scrollProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>

                <article className="bg-white p-4 p-md-5 shadow-sm rounded" ref={readerRef}>
                  <h2 className="mb-4">{blogData.title}</h2>
                  <div className="mb-3">
                    <a href={blogData.url} target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none small d-flex align-items-center">
                      <ExternalLink size={14} className="me-1" />
                      Original Source
                    </a>
                  </div>
                  <hr />
                  <div className="blog-content mt-4" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#333' }}>
                    {blogData.content.split('\n').map((para: string, index: number) => (
                      para.trim() && <p key={index} className="mb-4">{para}</p>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          ) : (
             <div className="text-center py-5 text-muted">
              <BookOpen size={48} className="mb-3 opacity-25" />
              <p>Select a blog from history or paste a new URL.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {showSidebar && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 d-md-none"
          style={{ zIndex: 1030 }}
          onClick={() => setShowSidebar(false)}
        ></div>
      )}
    </div>
  );
}
