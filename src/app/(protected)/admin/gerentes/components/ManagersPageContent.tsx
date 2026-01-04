"use client";

import { useState } from "react";
import type { JSX } from "react";

import ManagersList from "./ManagersList";
import EditSheltersModal from "./EditSheltersModal";

type Manager = {
  id: string;
  email: string | null;
  wp_user_id: number | null;
  created_at: string;
  shelters: Array<{
    id: string;
    name: string;
    wp_post_id: number;
  }>;
};

export default function ManagersPageContent(): JSX.Element {
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (manager: Manager) => {
    setEditingManager(manager);
  };

  const handleClose = () => {
    setEditingManager(null);
  };

  const handleSave = () => {
    // Forçar atualização da lista
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <div key={refreshKey}>
        <ManagersList onEdit={handleEdit} />
      </div>

      {editingManager && (
        <EditSheltersModal
          manager={editingManager}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </>
  );
}
