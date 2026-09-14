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
    <div className="fmc-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="fmc-modal">
        <div className="fmc-modal-header">
          <div className="fmc-modal-icon-danger">
            <i className="bi bi-exclamation-triangle" />
          </div>
          <h3 id="delete-modal-title">Delete Found Item Report</h3>
        </div>

        <div className="fmc-modal-body">
          <p>
            Are you sure you want to delete the report for <strong>"{itemName}"</strong>? This
            action cannot be undone and will remove this report from campus searches and smart matches.
          </p>
        </div>

        <div className="fmc-modal-actions">
          <button
            type="button"
            className="button secondary small"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button danger small"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="loader-spinner light" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              <>
                <i className="bi bi-trash3" />
                Delete Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
