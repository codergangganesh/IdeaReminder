import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { FilterBar } from '../components/ideas/FilterBar';
import { IdeaCard } from '../components/ideas/IdeaCard';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Plus } from 'lucide-react';

export function Ideas() {
  const {
    ideas,
    categories,
    onQuickCapture,
    onOpenEditor,
    onDeleteIdea,
    onToggleFavorite,
    onChangeStatus,
  } = useOutletContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Sync from URL search params if changed externally
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat !== null) setCategoryFilter(cat);
    const stat = searchParams.get('status');
    if (stat !== null) setStatusFilter(stat);
  }, [searchParams]);

  // Filter & Sort ideas
  const filteredIdeas = useMemo(() => {
    return ideas
      .filter((idea) => {
        // Search query filter (matches title, content, tags, category name)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (idea.title || '').toLowerCase().includes(q);
          const matchContent = (idea.content || '').toLowerCase().includes(q);
          const matchTags = Array.isArray(idea.tags) && idea.tags.some((t) => t.toLowerCase().includes(q));
          
          const cat = categories.find((c) => c.id === idea.category_id);
          const matchCategory = cat && cat.name.toLowerCase().includes(q);

          if (!matchTitle && !matchContent && !matchTags && !matchCategory) {
            return false;
          }
        }

        // Status filter
        if (statusFilter === 'favorites') {
          if (!idea.is_favorite) return false;
        } else if (statusFilter !== 'all') {
          if ((idea.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
            return false;
          }
        }

        // Category filter
        if (categoryFilter !== 'all') {
          if (categoryFilter === 'uncategorized') {
            if (idea.category_id) return false;
          } else if (idea.category_id !== categoryFilter) {
            return false;
          }
        }

        // Priority filter
        if (priorityFilter !== 'all') {
          if ((idea.priority || '').toLowerCase() !== priorityFilter.toLowerCase()) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        if (sortBy === 'priority') {
          const weights = { High: 3, Medium: 2, Low: 1 };
          return (weights[b.priority] || 2) - (weights[a.priority] || 2);
        }
        if (sortBy === 'alphabetical') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [ideas, categories, searchQuery, statusFilter, categoryFilter, priorityFilter, sortBy]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Idea Vault</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Showing {filteredIdeas.length} of {ideas.length} ideas
          </p>
        </div>

        <Button variant="mustard" icon={Plus} onClick={onQuickCapture}>
          Capture Idea
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Results */}
      {filteredIdeas.length === 0 ? (
        <EmptyState
          title={searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? 'No matching ideas' : 'Your vault is empty'}
          description={
            searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search terms or filters.'
              : 'Capture your first thought now. Never lose an idea.'
          }
          actionLabel={searchQuery ? 'Clear Filters' : '+ Capture Idea'}
          onAction={
            searchQuery
              ? () => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setPriorityFilter('all');
                }
              : onQuickCapture
          }
        />
      ) : (
        <div
          className={viewMode === 'grid' ? 'ideas-grid' : ''}
          style={
            viewMode === 'list'
              ? { display: 'flex', flexDirection: 'column', gap: '0.85rem' }
              : {}
          }
        >
          {filteredIdeas.map((idea) => {
            const cat = categories.find((c) => c.id === idea.category_id);
            return (
              <IdeaCard
                key={idea.id}
                idea={idea}
                category={cat}
                onEdit={onOpenEditor}
                onDelete={onDeleteIdea}
                onToggleFavorite={onToggleFavorite}
                onChangeStatus={onChangeStatus}
                onOpenDetail={(item) => navigate(`/ideas/${item.id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
