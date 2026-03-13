const ConfirmDeleteModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete"
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="surface p-6 rounded-lg w-[360px] space-y-4">

        <h3 className="text-lg font-semibold">
          {title || "Confirm Delete"}
        </h3>

        <p className="text-sm text-[var(--text-secondary)]">
          {message || "Are you sure you want to delete this item?"}
        </p>

        <div className="flex justify-end gap-3">

          <button
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="btn-primary"
            onClick={onConfirm}
          >
            {confirmText}
          </button>

        </div>

      </div>

    </div>
  );
};

export default ConfirmDeleteModal;