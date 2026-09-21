import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Layers,
  ChevronDown,
  FolderPlus,
  Check,
} from 'lucide-react';

export function ChecklistFolderTabs({
  folders = [],
  checklists = [],
  selectedFolderId,
  onSelectFolder,
  onOpenCreateFolder,
  onOpenEditFolder,
  onDeleteFolder,
}) {
  // Desktop options menu state
  const [activeMenu, setActiveMenu] = useState(null); // { folder, x, y }

  // Mobile dropdown states
  const [mobileFolderSelectOpen, setMobileFolderSelectOpen] = useState(false);
  const [mobileFolderSelectPos, setMobileFolderSelectPos] = useState({ x: 0, y: 0, width: 0 });
  const [mobileOptionsOpen, setMobileOptionsOpen] = useState(false);
  const [mobileOptionsPos, setMobileOptionsPos] = useState({ x: 0, y: 0 });

  // Compute checklist counts per folder
  const unfiledCount = checklists.filter((cl) => !cl.folder_id).length;
  const folderCounts = {};
  for (const cl of checklists) {
    if (cl.folder_id) {
      folderCounts[cl.folder_id] = (folderCounts[cl.folder_id] || 0) + 1;
    }
  }

  // Active folder details
  const activeFolder = folders.find((f) => f.id === selectedFolderId);
  const activeFolderTitle =
    selectedFolderId === 'all'
      ? 'All Checklists'
      : selectedFolderId === 'unfiled'
      ? 'Unfiled'
      : activeFolder?.name || 'Folder';
  const activeFolderIcon =
    selectedFolderId === 'all' ? (
      <Layers size={15} />
    ) : selectedFolderId === 'unfiled' ? (
      '📂'
    ) : (
      activeFolder?.icon || '📁'
    );
  const activeFolderCount =
    selectedFolderId === 'all'
      ? checklists.length
      : selectedFolderId === 'unfiled'
      ? unfiledCount
      : folderCounts[selectedFolderId] || 0;

  // Handler for Desktop 3-dots Menu
  const handleToggleDesktopMenu = (folder, triggerEl, e) => {
    e.stopPropagation();
    if (activeMenu && activeMenu.folder.id === folder.id) {
      setActiveMenu(null);
      return;
    }

    const rect = triggerEl.getBoundingClientRect();
    const menuWidth = 155;
    let x = rect.left;
    if (x + menuWidth > window.innerWidth - 12) {
      x = window.innerWidth - menuWidth - 12;
    }
    if (x < 12) x = 12;

    setActiveMenu({
      folder,
      x,
      y: rect.bottom + 6,
    });
  };

  // Handler for Mobile Folder Switcher
  const handleToggleMobileSelect = (e) => {
    e.stopPropagation();
    if (mobileFolderSelectOpen) {
      setMobileFolderSelectOpen(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMobileFolderSelectPos({
      x: Math.max(12, rect.left),
      y: rect.bottom + 6,
      width: Math.max(220, rect.width),
    });
    setMobileFolderSelectOpen(true);
    setMobileOptionsOpen(false);
  };

  // Handler for Mobile Separate Options Button
  const handleToggleMobileOptions = (e) => {
    e.stopPropagation();
    if (mobileOptionsOpen) {
      setMobileOptionsOpen(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 175;
    let x = rect.right - menuWidth;
    if (x < 12) x = 12;
    if (x + menuWidth > window.innerWidth - 12) {
      x = window.innerWidth - menuWidth - 12;
    }

    setMobileOptionsPos({
      x,
      y: rect.bottom + 6,
    });
    setMobileOptionsOpen(true);
    setMobileFolderSelectOpen(false);
  };

  // Close menus on resize or scroll
  useEffect(() => {
    if (!activeMenu && !mobileFolderSelectOpen && !mobileOptionsOpen) return;
    const handleClose = () => {
      setActiveMenu(null);
      setMobileFolderSelectOpen(false);
      setMobileOptionsOpen(false);
    };
    window.addEventListener('resize', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, [activeMenu, mobileFolderSelectOpen, mobileOptionsOpen]);

  return (
    <div className="checklist-folder-tabs-wrapper">
      {/* DESKTOP VIEW: Folder Tabs (Clean row without redundant "+ New Folder" chip) */}
      <div className="checklist-folder-tabs-desktop">
        {/* "All" Tab */}
        <button
          type="button"
          className={`folder-tab-chip ${selectedFolderId === 'all' ? 'active' : ''}`}
          onClick={() => onSelectFolder('all')}
        >
          <Layers size={14} />
          <span>All Checklists</span>
          <span className="folder-tab-badge">{checklists.length}</span>
        </button>

        {/* "Unfiled" Tab */}
        <button
          type="button"
          className={`folder-tab-chip ${selectedFolderId === 'unfiled' ? 'active' : ''}`}
          onClick={() => onSelectFolder('unfiled')}
        >
          <span>📂</span>
          <span>Unfiled</span>
          <span className="folder-tab-badge">{unfiledCount}</span>
        </button>

        {/* Custom Folders */}
        {folders.map((folder) => {
          const isSelected = selectedFolderId === folder.id;
          const count = folderCounts[folder.id] || 0;

          return (
            <div
              key={folder.id}
              className={`folder-tab-chip ${isSelected ? 'active' : ''}`}
              style={{
                borderLeft: isSelected ? `3px solid ${folder.color || 'var(--color-mustard)'}` : undefined,
              }}
            >
              <div
                className="folder-tab-content"
                onClick={() => onSelectFolder(folder.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectFolder(folder.id);
                  }
                }}
              >
                <span>{folder.icon || '📁'}</span>
                <span className="folder-tab-name">{folder.name}</span>
                <span className="folder-tab-badge">{count}</span>
              </div>

              {/* Folder quick settings menu icon */}
              <button
                type="button"
                className="folder-tab-settings-trigger"
                onClick={(e) => handleToggleDesktopMenu(folder, e.currentTarget, e)}
                title="Folder options"
                aria-label={`Options for folder ${folder.name}`}
              >
                <MoreHorizontal size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* MOBILE VIEW: Compact Folder Selection Bar + Separate Options Icon */}
      <div className="checklist-folder-tabs-mobile">
        {/* Folder Switcher Button */}
        <button
          type="button"
          className="mobile-folder-selector-btn"
          onClick={handleToggleMobileSelect}
          style={{
            borderLeft: activeFolder?.color ? `3px solid ${activeFolder.color}` : undefined,
          }}
        >
          <span className="mobile-folder-icon">{activeFolderIcon}</span>
          <span className="mobile-folder-title">{activeFolderTitle}</span>
          <span className="folder-tab-badge">{activeFolderCount}</span>
          <ChevronDown size={14} className="mobile-folder-chevron" />
        </button>

        {/* Separate Options Button */}
        <button
          type="button"
          className="mobile-folder-options-btn"
          onClick={handleToggleMobileOptions}
          title="Folder options"
          aria-label="Folder options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* MOBILE: Folder Switcher Dropdown (Portal) */}
      {mobileFolderSelectOpen &&
        createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
            <div
              style={{ position: 'fixed', inset: 0, cursor: 'default' }}
              onClick={() => setMobileFolderSelectOpen(false)}
            />
            <div
              className="checklist-dropdown-menu animate-fade-in"
              style={{
                position: 'fixed',
                top: `${mobileFolderSelectPos.y}px`,
                left: `${mobileFolderSelectPos.x}px`,
                width: `min(${mobileFolderSelectPos.width}px, calc(100vw - 24px))`,
                maxWidth: '300px',
                zIndex: 100000,
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 28px rgba(0, 0, 0, 0.55)',
                padding: '0.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                maxHeight: '320px',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  padding: '0.2rem 0.5rem 0.35rem 0.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  letterSpacing: '0.05em',
                }}
              >
                Select Folder
              </div>

              {/* All Checklists Option */}
              <button
                type="button"
                className={`dropdown-item ${selectedFolderId === 'all' ? 'active-dropdown-item' : ''}`}
                onClick={() => {
                  onSelectFolder('all');
                  setMobileFolderSelectOpen(false);
                }}
              >
                <Layers size={14} />
                <span style={{ flex: 1, textAlign: 'left' }}>All Checklists</span>
                <span className="folder-tab-badge">{checklists.length}</span>
                {selectedFolderId === 'all' && <Check size={13} className="mustard-text" />}
              </button>

              {/* Unfiled Option */}
              <button
                type="button"
                className={`dropdown-item ${selectedFolderId === 'unfiled' ? 'active-dropdown-item' : ''}`}
                onClick={() => {
                  onSelectFolder('unfiled');
                  setMobileFolderSelectOpen(false);
                }}
              >
                <span>📂</span>
                <span style={{ flex: 1, textAlign: 'left' }}>Unfiled</span>
                <span className="folder-tab-badge">{unfiledCount}</span>
                {selectedFolderId === 'unfiled' && <Check size={13} className="mustard-text" />}
              </button>

              {/* Custom Folders */}
              {folders.map((folder) => {
                const count = folderCounts[folder.id] || 0;
                const isSelected = selectedFolderId === folder.id;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    className={`dropdown-item ${isSelected ? 'active-dropdown-item' : ''}`}
                    onClick={() => {
                      onSelectFolder(folder.id);
                      setMobileFolderSelectOpen(false);
                    }}
                  >
                    <span>{folder.icon || '📁'}</span>
                    <span
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {folder.name}
                    </span>
                    <span className="folder-tab-badge">{count}</span>
                    {isSelected && <Check size={13} className="mustard-text" />}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}

      {/* MOBILE: Separate Options Menu (Portal) */}
      {mobileOptionsOpen &&
        createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
            <div
              style={{ position: 'fixed', inset: 0, cursor: 'default' }}
              onClick={() => setMobileOptionsOpen(false)}
            />
            <div
              className="checklist-dropdown-menu animate-fade-in"
              style={{
                position: 'fixed',
                top: `${mobileOptionsPos.y}px`,
                left: `${mobileOptionsPos.x}px`,
                zIndex: 100000,
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 28px rgba(0, 0, 0, 0.55)',
                padding: '0.4rem',
                minWidth: '175px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  padding: '0.2rem 0.5rem 0.35rem 0.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  letterSpacing: '0.05em',
                }}
              >
                Folder Options
              </div>

              {activeFolder ? (
                <>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setMobileOptionsOpen(false);
                      onOpenEditFolder(activeFolder);
                    }}
                  >
                    <Edit2 size={13} />
                    <span>Edit "{activeFolder.name}"</span>
                  </button>

                  <button
                    type="button"
                    className="dropdown-item dropdown-item-danger"
                    onClick={() => {
                      setMobileOptionsOpen(false);
                      if (
                        window.confirm(
                          `Delete folder "${activeFolder.name}"? Contained checklists will be unfiled.`
                        )
                      ) {
                        onDeleteFolder(activeFolder.id);
                        onSelectFolder('all');
                      }
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete Folder</span>
                  </button>
                </>
              ) : (
                <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No options for {activeFolderTitle}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* DESKTOP: Portaled Dropdown Menu */}
      {activeMenu &&
        createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
            <div
              style={{ position: 'fixed', inset: 0, cursor: 'default' }}
              onClick={() => setActiveMenu(null)}
            />
            <div
              className="checklist-dropdown-menu animate-fade-in"
              style={{
                position: 'fixed',
                top: `${activeMenu.y}px`,
                left: `${activeMenu.x}px`,
                zIndex: 100000,
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                padding: '0.35rem',
                minWidth: '155px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
              }}
            >
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  const targetFolder = activeMenu.folder;
                  setActiveMenu(null);
                  onOpenEditFolder(targetFolder);
                }}
              >
                <Edit2 size={13} />
                <span>Edit Folder</span>
              </button>

              <button
                type="button"
                className="dropdown-item dropdown-item-danger"
                onClick={() => {
                  const targetFolder = activeMenu.folder;
                  setActiveMenu(null);
                  if (
                    window.confirm(
                      `Delete folder "${targetFolder.name}"? Contained checklists will be unfiled.`
                    )
                  ) {
                    onDeleteFolder(targetFolder.id);
                  }
                }}
              >
                <Trash2 size={13} />
                <span>Delete Folder</span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
