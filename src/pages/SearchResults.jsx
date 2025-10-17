import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import SEO from '../components/SEO';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    sortBy: 'relevance',
  });
  const [stats, setStats] = useState({
    total: 0,
    courses: 0,
    instructors: 0,
    pages: 0,
  });

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, filters]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/search', {
        q: query,
        type: filters.type !== 'all' ? filters.type : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        sortBy: filters.sortBy,
      });
      
      setResults(data.results || []);
      setStats({
        total: data.total || 0,
        courses: data.stats?.courses || 0,
        instructors: data.stats?.instructors || 0,
        pages: data.stats?.pages || 0,
      });
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (type) => {
    const icons = {
      course: '📚',
      instructor: '👨‍🏫',
      page: '📄',
      topic: '🏷️',
      certificate: '🎓',
    };
    return icons[type] || '🔍';
  };

  const getResultLink = (result) => {
    switch (result.type) {
      case 'course':
        return `/course/${result.id}`;
      case 'instructor':
        return `/instructor/${result.id}`;
      case 'page':
        return result.path;
      default:
        return '#';
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <SEO
        title={`Search Results for "${query}"`}
        description={`Search results for ${query} on Elevate for Humanity`}
      />

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>
          Search Results
        </h1>
        <p style={{ fontSize: 16, color: 'var(--brand-secondary)' }}>
          {isLoading ? (
            'Searching...'
          ) : (
            <>
              Found {stats.total} result{stats.total !== 1 ? 's' : ''} for "{query}"
            </>
          )}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 32 }}>
        {/* Filters Sidebar */}
        <div>
          <div style={{ position: 'sticky', top: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>Filters</h3>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 14,
                  border: '1px solid var(--brand-border)',
                  borderRadius: 6,
                }}
              >
                <option value="all">All Types</option>
                <option value="course">Courses ({stats.courses})</option>
                <option value="instructor">Instructors ({stats.instructors})</option>
                <option value="page">Pages ({stats.pages})</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 14,
                  border: '1px solid var(--brand-border)',
                  borderRadius: 6,
                }}
              >
                <option value="all">All Categories</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="personal-development">Personal Development</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 14,
                  border: '1px solid var(--brand-border)',
                  borderRadius: 6,
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <button
              onClick={() => setFilters({ type: 'all', category: 'all', sortBy: 'relevance' })}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 14,
                border: '1px solid var(--brand-border)',
                borderRadius: 6,
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <LoadingSpinner size="large" />
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--brand-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>No results found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={getResultLink(result)}
                  style={{
                    display: 'block',
                    padding: 20,
                    backgroundColor: 'white',
                    border: '1px solid var(--brand-border)',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand-info)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ fontSize: 32 }}>{getResultIcon(result.type)}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--brand-info)' }}>
                        {result.title}
                      </h3>
                      {result.description && (
                        <p style={{ fontSize: 14, color: 'var(--brand-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                          {result.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#999' }}>
                        <span>{result.type.charAt(0).toUpperCase() + result.type.slice(1)}</span>
                        {result.category && (
                          <>
                            <span>•</span>
                            <span>{result.category}</span>
                          </>
                        )}
                        {result.rating && (
                          <>
                            <span>•</span>
                            <span>⭐ {result.rating.toFixed(1)}</span>
                          </>
                        )}
                        {result.enrollments && (
                          <>
                            <span>•</span>
                            <span>{result.enrollments.toLocaleString()} enrolled</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
