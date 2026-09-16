import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, LayoutGrid, List } from 'lucide-react';

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  categories = [],
  viewMode = 'grid',
  onViewModeChange,
}) {
  const statusOptions = [
    { id: 'all', label: 'All Ideas' },
    { id: 'favorites', label: '⭐ Favorites' },
    { id: 'New', label: '💭 New' },
    { id: 'Exploring', label: '🔍 Exploring' },
    { id: 'In Progress', label: '🚧 In Progress' },
    { id: 'Completed', label: '✅ Completed' },
    { id: 'Archived', label: '📦 Archived' },
  ];

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    priorityFilter !== 'all';

  const clearAllFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onCategoryChange('all');
    onPriorityChange('all');
  };

  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Top row: Search & Sorting & View mode */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '480px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            className="form-input-control"
            style={{
              paddingLeft: '2.4rem',
              paddingRight: searchQuery ? '2.4rem' : '0.85rem',
              borderRadius: 'var(--radius-full)',
              height: '40px',
            }}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ideas, keywords, #tags, or categories..."
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Secondary filters & Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Category Dropdown */}
          <select
            className="form-select-control"
            style={{ height: '40px', width: 'auto', paddingRight: '2rem', fontSize: '0.85rem' }}
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            className="form-select-control"
            style={{ height: '40px', width: 'auto', paddingRight: '2rem', fontSize: '0.85rem' }}
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>

          {/* Sort Dropdown */}
          <select
            className="form-select-control"
            style={{ height: '40px', width: 'auto', paddingRight: '2rem', fontSize: '0.85rem' }}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Highest Priority</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>

          {/* View toggle */}
          {onViewModeChange && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                style={{
                  padding: '0.4rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: viewMode === 'grid' ? 'var(--color-mustard-subtle)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--color-mustard)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                style={{
                  padding: '0.4rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: viewMode === 'list' ? 'var(--color-mustard-subtle)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--color-mustard)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-mustard)',
                fontWeight: 600,
                padding: '0.4rem 0.65rem',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Status Pills Filter */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
          scrollbarWidth: 'none',
        }}
      >
        {statusOptions.map((opt) => {
          const isActive = statusFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStatusChange(opt.id)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                whiteSpace: 'nowrap',
                backgroundColor: isActive ? 'var(--color-mustard)' : 'var(--bg-card)',
                color: isActive ? 'var(--color-mustard-contrast)' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--color-mustard)' : 'var(--border-color)'}`,
                boxShadow: isActive ? '0 2px 8px rgba(212, 167, 44, 0.3)' : 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
