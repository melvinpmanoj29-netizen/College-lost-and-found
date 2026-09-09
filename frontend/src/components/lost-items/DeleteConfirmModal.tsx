interface DeleteConfirmModalProps {
  isOpen: boolean
  itemName: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({
  isOpen,
  itemName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
        <div className="modal-header">
          <div className="modal-icon-danger">
            <i className="bi bi-exclamation-triangle" />
          </div>
          <div>
            <h2 id="delete-dialog-title">Delete report?</h2>
            <p>
              Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="button secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="loader-spinner light" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              <>
                <i className="bi bi-trash" /> Delete permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
