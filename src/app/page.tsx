'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, BookOpen, Clock, FileText, ArrowRight, ExternalLink } from 'lucide-react';

export default function BlogTracker() {
  const [url, setUrl] = useState('');
  const [blogData, setBlogData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const readerRef = useRef<HTMLDivElement>(null);

  const fetchBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setBlogData(null);

    try {
      const response = await axios.get(`/api/fetch-blog?url=${encodeURIComponent(url)}`);
      setBlogData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch blog content');
    } finally {
      setLoading(false);
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
      
      // The total scrollable distance within the article relative to the viewport
      // We want 0% when the top of the article is at the top of the screen (or just entering)
      // And 100% when the bottom of the article meets the bottom of the screen.
      const scrollableDistance = elementHeight - windowHeight;

      if (scrollableDistance <= 0) {
         setScrollProgress(100);
         return;
      }

      const currentScroll = window.scrollY - elementTop;
      
      // Clamp the value between 0 and 100
      const progress = (currentScroll / scrollableDistance) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount/update to set initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [blogData]);

  return (
    <div className="container py-5">
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">Blog Reading Tracker</h1>
        <p className="lead text-muted">Paste a blog URL to start reading with progress tracking.</p>
      </header>

      <div className="row justify-content-center mb-5">
        <div className="col-md-8">
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
              {loading ? 'Fetching...' : 'Track Progress'}
            </button>
          </form>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>

      {blogData && (
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
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
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none small d-flex align-items-center">
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
      )}

      {!blogData && !loading && (
        <div className="text-center py-5 text-muted">
          <BookOpen size={48} className="mb-3 opacity-25" />
          <p>Your blog content will appear here.</p>
        </div>
      )}
    </div>
  );
}