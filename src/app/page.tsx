'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, BookOpen, Clock, FileText, ArrowRight, ExternalLink, Trash2, History, Menu, X, Leaf } from 'lucide-react';

interface BlogHistoryItem {
  url: string;
  title: string;
  wordCount: number;
  readingTime: number;
  progress: number;
  content: string;
  lastRead: number;
}

export default function ZenRead() {
  const [url, setUrl] = useState('');
  const [blogData, setBlogData] = useState<BlogHistoryItem | null>(null);
  const [history, setHistory] = useState<BlogHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('blogHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('blogHistory', JSON.stringify(history));
  }, [history]);

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
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }, 100);
    setShowSidebar(false);
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
    if (confirm('Clear your ZenRead library?')) {
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
  }, [blogData]);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <button 
        className="btn btn-zen-toggle d-md-none position-fixed m-3" 
        style={{ zIndex: 1050, top: 0, left: 0 }}
        onClick={() => setShowSidebar(!showSidebar)}
      >
        {showSidebar ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside 
        className={`zen-sidebar border-end d-flex flex-column ${showSidebar ? 'show' : ''}`}
      >
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between bg-white">
          <div className="d-flex align-items-center fw-bold zen-brand">
            <Leaf className="me-2 text-zen" size={20} />
            ZenRead
          </div>
          {history.length > 0 && (
            <button className="btn btn-sm btn-outline-light text-muted border-0" onClick={clearHistory} title="Clear History">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="list-group list-group-flush flex-grow-1 overflow-auto">
          {history.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <History size={32} className="mb-2 opacity-25" />
              <p className="small mb-0">Your library is empty.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.url}
                className={`list-group-item list-group-item-action py-3 px-4 border-0 mb-1 zen-item ${blogData?.url === item.url ? 'active' : ''}`}
                onClick={() => loadFromHistory(item)}
              >
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className="mb-0 text-truncate fw-medium" style={{ maxWidth: '180px' }}>
                    {item.title}
                  </h6>
                  <button 
                    className="btn btn-link text-muted p-0 ms-2 delete-btn" 
                    onClick={(e) => deleteFromHistory(item.url, e)}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="d-flex align-items-center x-small text-muted mb-2">
                  <span className="me-2">{item.readingTime} min read</span>
                </div>
                <div className="progress zen-mini-progress">
                  <div 
                    className="progress-bar"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="flex-grow-1 zen-main">
        <div className="container py-5 px-md-5">
          <header className="text-center mb-5 mt-md-4">
            <div className="d-inline-flex align-items-center justify-content-center p-3 mb-4 rounded-circle bg-zen-light text-zen">
              <Leaf size={40} />
            </div>
            <h1 className="display-4 fw-light zen-title mb-2">ZenRead</h1>
            <p className="text-muted lead fw-light">Pure, distraction-free reading.</p>
          </header>

          <div className="row justify-content-center mb-5">
            <div className="col-lg-8">
              <form onSubmit={fetchBlog} className="zen-search-form shadow-sm">
                <input
                  type="url"
                  className="form-control border-0 bg-transparent"
                  placeholder="Paste blog URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <button className="btn btn-zen px-4" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="spinner-border spinner-border-sm" /> : <ArrowRight size={20} />}
                </button>
              </form>
              {error && <div className="alert alert-zen-danger mt-3 text-center small">{error}</div>}
            </div>
          </div>

          {blogData ? (
            <div className="row justify-content-center">
              <div className="col-lg-9 col-xl-8">
                {/* Stats Bar */}
                <div className="sticky-top zen-stats-bar py-3 mb-5 px-4" style={{ top: '1.5rem' }}>
                  <div className="row align-items-center text-center text-md-start">
                    <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start mb-2 mb-md-0 small">
                      <FileText className="text-zen me-2" size={16} />
                      <span className="text-muted">{blogData.wordCount} words</span>
                    </div>
                    <div className="col-md-4 d-flex align-items-center justify-content-center mb-2 mb-md-0 small">
                      <Clock className="text-zen me-2" size={16} />
                      <span className="text-muted">{blogData.readingTime} min read</span>
                    </div>
                    <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-end small">
                      <BookOpen className="text-zen me-2" size={16} />
                      <span className="text-muted">{Math.round(scrollProgress)}% completed</span>
                    </div>
                  </div>
                  <div className="progress zen-main-progress mt-3">
                    <div
                      className="progress-bar"
                      style={{ width: `${scrollProgress}%` }}
                    ></div>
                  </div>
                </div>

                <article className="zen-article bg-white p-4 p-md-5 rounded shadow-sm" ref={readerRef}>
                  <div className="text-center mb-5">
                    <h2 className="display-6 mb-3 fw-normal">{blogData.title}</h2>
                    <a href={blogData.url} target="_blank" rel="noopener noreferrer" className="text-zen text-decoration-none small d-inline-flex align-items-center opacity-75">
                      <ExternalLink size={12} className="me-1" />
                      Original Source
                    </a>
                  </div>
                  
                  <div className="zen-content">
                    {blogData.content.split('\n').map((para: string, index: number) => (
                      para.trim() && <p key={index} className="mb-4">{para}</p>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          ) : (
             <div className="text-center py-5 text-muted opacity-50">
              <div className="mb-3"><History size={48} strokeWidth={1} /></div>
              <p className="fw-light">Select from your library or start a new read.</p>
            </div>
          )}
        </div>
      </main>
      
      {showSidebar && (
        <div 
          className="zen-overlay position-fixed top-0 start-0 w-100 h-100 d-md-none"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}
    </div>
  );
}