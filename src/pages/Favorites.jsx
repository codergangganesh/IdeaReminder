import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { IdeaCard } from '../components/ideas/IdeaCard';
import { EmptyState } from '../components/common/EmptyState';
import { Star } from 'lucide-react';

export function Favorites() {
  const {
    ideas,
    categories,
    onQuickCapture,
    onOpenEditor,
    onDeleteIdea,
    onToggleFavorite,
    onChangeStatus,
  } = useOutletContext();

  const navigate = useNavigate();
  const favoriteIdeas = ideas.filter((i) => i.is_favorite);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Star size={24} fill="var(--color-mustard)" color="var(--color-mustard)" />
          Starred Favorites
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          {favoriteIdeas.length} marked {favoriteIdeas.length === 1 ? 'idea' : 'ideas'} for fast access
        </p>
      </div>

      {favoriteIdeas.length === 0 ? (
        <EmptyState
          emoji="⭐"
          title="No favorite ideas yet"
          description="Click the star icon on any idea to save it here for immediate access."
          actionLabel="Browse All Ideas"
          onAction={() => navigate('/ideas')}
        />
      ) : (
        <div className="ideas-grid">
          {favoriteIdeas.map((idea) => {
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
