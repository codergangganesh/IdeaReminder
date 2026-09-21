import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { QuickCaptureModal } from '../ideas/QuickCaptureModal';
import { IdeaEditorModal } from '../ideas/IdeaEditorModal';
import { useIdeas } from '../../hooks/useIdeas';
import { useCategories } from '../../hooks/useCategories';
import { useChecklists } from '../../hooks/useChecklists';

export function AppShell() {
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [editorIdea, setEditorIdea] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const { ideas, addIdea, editIdea, deleteIdea, toggleFavorite, changeStatus } = useIdeas();
  const { categories, addCategory } = useCategories();
  const {
    folders,
    checklists,
    loading: checklistsLoading,
    addFolder,
    editFolder,
    deleteFolder,
    addChecklist,
    editChecklist,
    deleteChecklist,
    togglePinChecklist,
    addItem,
    editItem,
    deleteItem,
    toggleItem,
    clearCompleted,
  } = useChecklists();

  const handleOpenEditor = (idea) => {
    setEditorIdea(idea);
    setEditorOpen(true);
  };

  const favoritesCount = ideas.filter((i) => i.is_favorite).length;

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <Sidebar
        ideasCount={ideas.length}
        checklistsCount={checklists.length}
        favoritesCount={favoritesCount}
        onQuickCapture={() => setQuickCaptureOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <TopBar onQuickCapture={() => setQuickCaptureOpen(true)} />

        <main className="content-body">
          {/* Provide ideas, categories, and checklists to child routes via context */}
          <Outlet
            context={{
              ideas,
              categories,
              onQuickCapture: () => setQuickCaptureOpen(true),
              onOpenEditor: handleOpenEditor,
              onAddIdea: addIdea,
              onEditIdea: editIdea,
              onDeleteIdea: deleteIdea,
              onToggleFavorite: toggleFavorite,
              onChangeStatus: changeStatus,
              onAddCategory: addCategory,
              // Checklists & Folders Context
              folders,
              checklists,
              checklistsLoading,
              onAddFolder: addFolder,
              onEditFolder: editFolder,
              onDeleteFolder: deleteFolder,
              onAddChecklist: addChecklist,
              onEditChecklist: editChecklist,
              onDeleteChecklist: deleteChecklist,
              onTogglePinChecklist: togglePinChecklist,
              onAddItem: addItem,
              onEditItem: editItem,
              onDeleteItem: deleteItem,
              onToggleItem: toggleItem,
              onClearCompleted: clearCompleted,
            }}
          />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onQuickCapture={() => setQuickCaptureOpen(true)} />

      {/* Global Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        categories={categories}
        onSave={addIdea}
      />

      {/* Global Detailed Editor Modal */}
      {editorOpen && (
        <IdeaEditorModal
          isOpen={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setEditorIdea(null);
          }}
          idea={editorIdea}
          categories={categories}
          onSave={editIdea}
          onDelete={deleteIdea}
        />
      )}
    </div>
  );
}
