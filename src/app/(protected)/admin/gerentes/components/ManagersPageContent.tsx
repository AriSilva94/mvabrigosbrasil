"use client";

import { useState } from "react";
import type { JSX } from "react";

import ManagersList from "./ManagersList";
import EditSheltersModal from "./EditSheltersModal";
import type { AdminManager } from "@/modules/admin/adminApi";

export default function ManagersPageContent(): JSX.Element {
  const [editingManager, setEditingManager] = useState<AdminManager | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (manager: AdminManager) => {
    setEditingManager(manager);
  };

  const handleClose = () => {
    setEditingManager(null);
  };

  const handleSave = () => {
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
