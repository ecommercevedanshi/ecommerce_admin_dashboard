import { useState } from "react";

import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";

import {
  useGetAllMediaQuery,
  useDeleteMediaMutation,
} from "../../features/media/mediaApiSlice";

import UploadMediaModal from "../../components/media/UploadMediaModal";
import ViewMediaModal from "../../components/media/ViewMediaModal";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";

const Media = () => {

  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editMedia, setEditMedia] = useState(null);

  const { data, isLoading } = useGetAllMediaQuery({
    page,
    limit: 10,
  });

  // console.log(selectedEntity)

  const [deleteMedia] = useDeleteMediaMutation();

  const columns = [
    "Preview",
    "Base Name",
    "Entity Type",
    "Category",
    "Alt",
    "Actions",
  ];

  console.log(editMedia)

  const rows =
  data?.data?.map((item) => {

    const primaryImage =
      item.images?.find((img) => img.isPrimary) ||
      item.images?.[0];
      // console.log(item.entityId)

    return [

      <img
        src={primaryImage?.url}
        alt={primaryImage?.altText}
        className="w-12 h-12 object-cover rounded"
      />,

      item.baseName,

      item.entityType,

      item.entityId || "-",

      primaryImage?.altText || "-",

      <div className="flex gap-2">

        <button
          className="btn-secondary text-xs"
          onClick={() => setSelectedEntity(item._id)}
        >
          View
        </button>

        <button
          className="btn-secondary text-xs"
          onClick={() => setEditMedia(item)}
        >
          Update
        </button>

        <button
          className="btn-secondary text-xs"
          onClick={() => setDeleteId(item._id)}
        >
          Delete
        </button>

      </div>,
    ];

  }) || [];

  if (isLoading) return <p>Loading...</p>;
  // console.log(selectedEntity)

  return (
    <div className="space-y-6">

      {/* Header */}

      <Card>

        <div className="flex justify-between items-center">

          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
            Media Library
          </h3>

          <button
            className="btn-primary"
            onClick={() => setShowUpload(true)}
          >
            Upload Media
          </button>

        </div>

      </Card>

      {/* Table */}

      <Card>

        <DataTable columns={columns} data={rows} />

      </Card>

      {/* Upload Modal */}

      {(showUpload || editMedia) && (
  <UploadMediaModal
    media={editMedia}
    close={() => {
      setShowUpload(false);
      setEditMedia(null);
    }}
  />
)}

      {selectedEntity && (
  <ViewMediaModal
    entityId={selectedEntity}
    close={() => setSelectedEntity(null)}
  />
)}

{deleteId && (
  <ConfirmDeleteModal
    title="Delete Media"
  message="Are you sure you want to delete this media folder?"
  confirmText="Delete"
    onCancel={() => setDeleteId(null)}
    onConfirm={async () => {
      await deleteMedia(deleteId).unwrap();
      setDeleteId(null);
    }}
  />
)}
    </div>
  );
};

export default Media;