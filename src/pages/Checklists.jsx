import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChecklistCard } from '../components/checklists/ChecklistCard';
import { ChecklistFolderTabs } from '../components/checklists/ChecklistFolderTabs';
import { ChecklistModal } from '../components/checklists/ChecklistModal';
import { FolderModal } from '../components/checklists/FolderModal';
import { ChecklistDetailModal } from '../components/checklists/ChecklistDetailModal';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { checklistService } from '../services/checklistService';
import {
  Plus,
  Search,
  CheckSquare,
  ListTodo,
  CheckCircle2,
  Clock,
  FolderPlus,
} from 'lucide-react';

export function Checklists() {
  const {
    folders = [],
    checklists = [],
    loading,
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

  const [selectedFolderId, setSelectedFolderId] = useState('all'); // 'all' | 'unfiled' | folder.id
  const [searchQuery, setSearchQuery] = useState('');
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailChecklist, setDetailChecklist] = useState(null);

  // Compute stats
  const stats = useMemo(() => checklistService.calculateStats(checklists), [checklists]);

  // Filter checklists based on selected folder and search query
  const filteredChecklists = useMemo(() => {
    return checklists.filter((cl) => {
      // Folder filtering
      if (selectedFolderId === 'unfiled' && cl.folder_id) return false;
      if (selectedFolderId !== 'all' && selectedFolderId !== 'unfiled' && cl.folder_id !== selectedFolderId) {
        return false;
      }

      // Search query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = cl.title?.toLowerCase().includes(q);
        const matchesDesc = cl.description?.toLowerCase().includes(q);
        const matchesItem = (cl.items || []).some((it) => it.content?.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesItem) return false;
      }

      return true;
    });
  }, [checklists, selectedFolderId, searchQuery]);

  // Modals handlers
  const handleOpenCreateChecklist = (targetFolderId = null) => {
    setSelectedChecklist(null);
    setChecklistModalOpen(true);
  };

  const handleOpenEditChecklist = (cl) => {
    setSelectedChecklist(cl);
    setChecklistModalOpen(true);
  };

  const handleOpenCreateFolder = () => {
    setSelectedFolder(null);
    setFolderModalOpen(true);
  };

  const handleOpenEditFolder = (folder) => {
    setSelectedFolder(folder);
    setFolderModalOpen(true);
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
    if (selectedFolder) {
      await onEditFolder(selectedFolder.id, data);
    } else {
      const created = await onAddFolder(data);
      if (created?.id) {
        setSelectedFolderId(created.id);
      }
    }
  };

  // Synchronize detail checklist if live data changes
  const currentDetailChecklist = detailChecklist
    ? checklists.find((cl) => cl.id === detailChecklist.id) || null
    : null;

  const currentFolderName = useMemo(() => {
    if (selectedFolderId === 'all') return 'All Checklists';
    if (selectedFolderId === 'unfiled') return 'Unfiled Checklists';
    const f = folders.find((item) => item.id === selectedFolderId);
    return f ? `${f.icon || '📁'} ${f.name}` : 'Checklists';
  }, [selectedFolderId, folders]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Page Header */}
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
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <ListTodo className="mustard-text" size={26} />
            <span>Checklists & Tasks</span>
          </h1>
          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              marginTop: '0.2rem',
              marginBottom: 0,
            }}
          >
            Track multi-step goals, projects, and actionable to-do lists in organized folders
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Button
            variant="secondary"
            icon={FolderPlus}
            onClick={handleOpenCreateFolder}
            style={{ fontWeight: 600 }}
          >
            New Folder
          </Button>

          <Button
            variant="mustard"
            icon={Plus}
            onClick={() => handleOpenCreateChecklist(selectedFolderId !== 'all' && selectedFolderId !== 'unfiled' ? selectedFolderId : null)}
            style={{ fontWeight: 700, boxShadow: 'var(--shadow-mustard)' }}
          >
            New Checklist
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-metrics-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Total Checklists */}
        <div className="iv-card metric-card-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Total Checklists
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
              <CheckSquare size={15} />
            </div>
          </div>
          <div className="metric-card-number" style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {stats.totalChecklists}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across {folders.length} folder{folders.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Total Tasks */}
        <div className="iv-card metric-card-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Total Tasks
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
              <ListTodo size={15} />
            </div>
          </div>
          <div className="metric-card-number" style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {stats.totalItems}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#0EA5E9', fontWeight: 600 }}>
            {stats.pendingItems} remaining
          </span>
        </div>

        {/* Completed Tasks */}
        <div className="iv-card metric-card-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Completed Tasks
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
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="metric-card-number" style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {stats.completedItems}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
            {stats.completedChecklists} full lists done
          </span>
        </div>

        {/* Completion Pace */}
        <div className="iv-card metric-card-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Completion Rate
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
              <Clock size={15} />
            </div>
          </div>
          <div className="metric-card-number" style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {stats.completionRate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Stored in InsForge
          </span>
        </div>
      </div>

      {/* Folder Tabs Navigation & Search Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <ChecklistFolderTabs
          folders={folders}
          checklists={checklists}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onOpenCreateFolder={handleOpenCreateFolder}
          onOpenEditFolder={handleOpenEditFolder}
          onDeleteFolder={onDeleteFolder}
        />
      </div>

      {/* Filter / Search Bar */}
      <div className="checklist-filter-bar">
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {currentFolderName} ({filteredChecklists.length})
        </div>

        <div className="checklist-search-box-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="checklist-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search checklists or tasks..."
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Checklists Grid or Empty State */}
      {filteredChecklists.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching checklists' : 'No checklists here yet'}
          description={
            searchQuery
              ? `No checklists or tasks matched "${searchQuery}".`
              : selectedFolderId === 'all'
              ? 'Create your first checklist to organize multiple tasks, goals, or to-do items.'
              : 'This folder is currently empty. Add a checklist to start organizing tasks in this folder.'
          }
          actionLabel="+ Create Checklist"
          onAction={() => handleOpenCreateChecklist(selectedFolderId !== 'all' && selectedFolderId !== 'unfiled' ? selectedFolderId : null)}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
            alignItems: 'start',
          }}
        >
          {filteredChecklists.map((checklist) => (
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

      {/* Checklist Creation / Edit Modal */}
      <ChecklistModal
        isOpen={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        checklist={selectedChecklist}
        folders={folders}
        defaultFolderId={selectedFolderId !== 'all' && selectedFolderId !== 'unfiled' ? selectedFolderId : null}
        onSave={handleSaveChecklist}
        onOpenCreateFolder={() => {
          setChecklistModalOpen(false);
          handleOpenCreateFolder();
        }}
      />

      {/* Folder Creation / Edit Modal */}
      <FolderModal
        isOpen={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        folder={selectedFolder}
        onSave={handleSaveFolder}
      />

      {/* Detailed Checklist View Modal */}
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
