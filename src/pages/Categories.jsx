import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CategoryCard } from '../components/categories/CategoryCard';
import { CategoryModal } from '../components/categories/CategoryModal';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Plus } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

export function Categories() {
  const { ideas } = useOutletContext();
  const { categories, addCategory, editCategory, deleteCategory } = useCategories();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  const handleOpenCreate = () => {
    setSelectedCat(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setSelectedCat(cat);
    setModalOpen(true);
  };

  const handleSaveCategory = async (catData) => {
    if (selectedCat) {
      await editCategory(selectedCat.id, catData);
    } else {
      await addCategory(catData);
    }
  };

  // Count ideas per category
  const ideaCountMap = {};
  for (const idea of ideas) {
    if (idea.category_id) {
      ideaCountMap[idea.category_id] = (ideaCountMap[idea.category_id] || 0) + 1;
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header with single-line New Category button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'nowrap',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
            }}
          >
            Categories
          </h1>
          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              marginTop: '0.2rem',
              marginBottom: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Organize and classify your thoughts into distinct areas
          </p>
        </div>

        <Button
          variant="mustard"
          icon={Plus}
          onClick={handleOpenCreate}
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          New Category
        </Button>
      </div>

      {/* Categories Grid or Empty State */}
      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create your first category to organize and classify your ideas into distinct areas."
          actionLabel="+ New Category"
          onAction={handleOpenCreate}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              ideaCount={ideaCountMap[cat.id] || 0}
              onSelect={() => navigate(`/ideas?category=${cat.id}`)}
              onEdit={handleOpenEdit}
              onDelete={deleteCategory}
            />
          ))}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCat}
        onSave={handleSaveCategory}
      />
    </div>
  );
}
