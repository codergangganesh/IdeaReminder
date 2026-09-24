import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { IdeaCard } from '../components/ideas/IdeaCard';
import { EmptyState } from '../components/common/EmptyState';
import { ChecklistCard } from '../components/checklists/ChecklistCard';
import { ChecklistModal } from '../components/checklists/ChecklistModal';
import { FolderModal } from '../components/checklists/FolderModal';
import { ChecklistDetailModal } from '../components/checklists/ChecklistDetailModal';
import { ideaService } from '../services/ideaService';
import { checklistService } from '../services/checklistService';
import {
  Plus,
  Lightbulb,
  Calendar,
  Star,
  Activity,
  ArrowRight,
  ListTodo,
  CheckCircle2,
  FolderPlus,
} from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard() {
  const {
    ideas,
    categories,
    onQuickCapture,
    onOpenEditor,
    onDeleteIdea,
    onToggleFavorite,
    onChangeStatus,
    // Checklists & Folders Context
    folders = [],
    checklists = [],
    onAddFolder,
    onEditFolder,
    onDeleteFolder,
    onAddChecklist,
    onEditChecklist,
    onDeleteChecklist,
    onTogglePinChecklist,
    onAddItem,
    onEditItem,
    onDeleteItem,
    onToggleItem,
    onClearCompleted,
  } = useOutletContext();

  const { user } = useAuth();
  const navigate = useNavigate();

  // Local modal state for creating/editing checklists directly from dashboard
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailChecklist, setDetailChecklist] = useState(null);

  const displayName =
    user?.name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'there';

  const stats = ideaService.calculateStats(ideas, categories);
  const clStats = checklistService.calculateStats(checklists);
  const recentIdeas = ideas.slice(0, 6);

  // Top 3 active or pinned checklists to display on dashboard
  const dashboardChecklists = checklists.slice(0, 3);

  const handleOpenCreateChecklist = () => {
    setSelectedChecklist(null);
    setChecklistModalOpen(true);
  };

  const handleOpenEditChecklist = (cl) => {
    setSelectedChecklist(cl);
    setChecklistModalOpen(true);
  };

  const handleOpenDetail = (cl) => {
    setDetailChecklist(cl);
    setDetailModalOpen(true);
  };

  const handleSaveChecklist = async (data) => {
    if (selectedChecklist) {
      await onEditChecklist(selectedChecklist.id, data);
    } else {
      await onAddChecklist(data);
    }
  };

  const handleSaveFolder = async (data) => {
    await onAddFolder(data);
  };

  const currentDetailChecklist = detailChecklist
    ? checklists.find((cl) => cl.id === detailChecklist.id) || null
    : null;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Hero Welcome Header */}
      <div className="dashboard-hero-card">
        <div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-mustard)',
            }}
          >
            Personal Knowledge Base
          </span>
          <h1 className="dashboard-hero-title">
            {getGreeting()}, {displayName} 👋
          </h1>
          <p
            style={{
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              marginTop: '0.35rem',
              maxWidth: '600px',
            }}
          >
            Capture your next idea before you forget it. Voice or text, anytime.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-metrics-grid">
        {/* Total Ideas */}
        <div className="iv-card metric-card-box" onClick={() => navigate('/ideas')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Total Ideas
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-mustard-subtle)',
                color: 'var(--color-mustard)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lightbulb size={15} />
            </div>
          </div>
          <div className="metric-card-number" style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {stats.total}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Stored in InsForge
          </span>
        </div>

        {/* This Week */}
        <div className="iv-card metric-card-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              This Week
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={15} />
            </div>
          </div>
          <div className="metric-card-number" style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {stats.thisWeek}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
            Active pace
          </span>
        </div>

        {/* Favorites */}
        <div className="iv-card metric-card-box" onClick={() => navigate('/favorites')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Favorites
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-mustard-subtle)',
                color: 'var(--color-mustard)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Star size={15} fill="var(--color-mustard)" />
            </div>
          </div>
          <div className="metric-card-number" style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {stats.favorites}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Priority thoughts
          </span>
        </div>

        {/* In Progress */}
        <div className="iv-card metric-card-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              In Progress
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(14, 165, 233, 0.12)',
                color: '#0EA5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={15} />
            </div>
          </div>
          <div className="metric-card-number" style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {stats.inProgress}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#0EA5E9', fontWeight: 600 }}>
            Being executed
          </span>
        </div>
      </div>

      {/* Main Grid: Category Breakdown + Recent Ideas */}
      <div className="dashboard-split-grid" style={{ marginBottom: '2.5rem' }}>
        {/* Left Column: Ideas by Category */}
        <div
          className="iv-card"
          style={{
            height: 'fit-content',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ideas by Category</h3>
            <button
              type="button"
              onClick={() => navigate('/categories')}
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-mustard)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {stats.categoryBreakdown.slice(0, 6).map((cat) => {
              const pct = stats.total > 0 ? Math.round((cat.count / stats.total) * 100) : 0;
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/ideas?category=${cat.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 500 }}>
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {cat.count} ({pct}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: cat.color || 'var(--color-mustard)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width var(--transition-normal)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recent Ideas */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Ideas</h3>
            {ideas.length > 6 && (
              <button
                type="button"
                onClick={() => navigate('/ideas')}
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-mustard)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                All Ideas <ArrowRight size={14} />
              </button>
            )}
          </div>

          {recentIdeas.length === 0 ? (
            <EmptyState
              title="No ideas yet"
              description="Your next breakthrough idea starts here. Capture your first thought with voice or text."
              actionLabel="+ Capture Your First Idea"
              onAction={onQuickCapture}
            />
          ) : (
            <div className="ideas-grid">
              {recentIdeas.map((idea) => {
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
      </div>

      {/* --- NEW SECTION: Active Checklists & To-Do Lists --- */}
      <div className="dashboard-checklists-section" style={{ marginTop: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListTodo size={20} className="mustard-text" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                My Checklists & Tasks
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem', marginBottom: 0 }}>
              Track multi-step goals, projects, and actionable items across folders
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Button
              variant="mustard"
              size="sm"
              icon={Plus}
              onClick={handleOpenCreateChecklist}
              style={{ fontWeight: 700 }}
            >
              New Checklist
            </Button>

            <button
              type="button"
              onClick={() => navigate('/checklists')}
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-mustard)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: 'pointer',
              }}
            >
              All Checklists <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {checklists.length === 0 ? (
          <div
            className="iv-card"
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed var(--border-color)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-mustard-subtle)',
                color: 'var(--color-mustard)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <ListTodo size={24} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              No checklists created yet
            </h4>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                maxWidth: '440px',
                marginBottom: '1.25rem',
              }}
            >
              Not everything is just an idea. If you have tasks, actionable steps, or multi-item projects, organize them into a checklist!
            </p>
            <Button
              variant="mustard"
              icon={Plus}
              onClick={handleOpenCreateChecklist}
              style={{ fontWeight: 700 }}
            >
              Create Your First Checklist
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
              alignItems: 'start',
            }}
          >
            {dashboardChecklists.map((checklist) => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                folders={folders}
                onToggleItem={onToggleItem}
                onAddItem={onAddItem}
                onDeleteItem={onDeleteItem}
                onEditChecklist={handleOpenEditChecklist}
                onDeleteChecklist={onDeleteChecklist}
                onTogglePin={onTogglePinChecklist}
                onClearCompleted={onClearCompleted}
                onOpenDetail={handleOpenDetail}
              />
            ))}
          </div>
        )}
      </div>

      {/* Checklist Modal for Dashboard Quick Creation */}
      <ChecklistModal
        isOpen={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        checklist={selectedChecklist}
        folders={folders}
        onSave={handleSaveChecklist}
        onAddItem={onAddItem}
        onDeleteItem={onDeleteItem}
        onOpenCreateFolder={() => {
          setChecklistModalOpen(false);
          setFolderModalOpen(true);
        }}
      />

      {/* Folder Modal for Dashboard Quick Creation */}
      <FolderModal
        isOpen={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onSave={handleSaveFolder}
      />

      {/* Detail Modal */}
      {currentDetailChecklist && (
        <ChecklistDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setDetailChecklist(null);
          }}
          checklist={currentDetailChecklist}
          folders={folders}
          onToggleItem={onToggleItem}
          onAddItem={onAddItem}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onClearCompleted={onClearCompleted}
          onOpenEditChecklist={handleOpenEditChecklist}
        />
      )}
    </div>
  );
}
