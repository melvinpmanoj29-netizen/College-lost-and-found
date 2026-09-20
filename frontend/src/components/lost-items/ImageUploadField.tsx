import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react'
import { uploadLostItemImage } from '../../services/lostItemService'
import { getErrorMessage } from '../../services/api'

interface ImageUploadFieldProps {
  initialImageUrl?: string | null
  onImageUploaded: (url: string | null) => void
  onUploadingChange?: (isUploading: boolean) => void
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ImageUploadField({
  initialImageUrl,
  onImageUploaded,
  onUploadingChange,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Revoke object URL on change or unmount
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  const previewUrl = selectedFile
    ? objectUrl
    : !removed
    ? initialImageUrl || null
    : null

  const isExisting = !selectedFile && Boolean(previewUrl)
  const status: UploadStatus = selectedFile
    ? uploadStatus
    : isExisting
    ? 'success'
    : 'idle'

  const validateFile = (file: File): string | null => {
    const fileType = file.type.toLowerCase()
    if (!ALLOWED_TYPES.includes(fileType)) {
      return 'Please select a valid image file (JPEG, PNG, or WEBP).'
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'Image must be smaller than 5 MB.'
    }
    return null
  }

  const handleUpload = async (file: File) => {
    setUploadStatus('uploading')
    setErrorMessage(null)
    onUploadingChange?.(true)

    try {
      const response = await uploadLostItemImage(file)
      setUploadStatus('success')
      onImageUploaded(response.imageUrl)
    } catch (err) {
      setUploadStatus('error')
      setErrorMessage(getErrorMessage(err) || 'Image upload failed. Please try again.')
      onImageUploaded(null)
    } finally {
      onUploadingChange?.(false)
    }
  }

  const processSelectedFile = (file: File) => {
    const error = validateFile(file)
    if (error) {
      setErrorMessage(error)
      setUploadStatus('error')
      return
    }

    const newUrl = URL.createObjectURL(file)
    setObjectUrl(newUrl)

    setSelectedFile(file)
    setRemoved(false)
    setErrorMessage(null)

    // Trigger Cloudinary upload immediately
    handleUpload(file)
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processSelectedFile(files[0])
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleRemove = () => {
    setObjectUrl(null)
    setSelectedFile(null)
    setRemoved(true)
    setUploadStatus('idle')
    setErrorMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageUploaded(null)
    onUploadingChange?.(false)
  }

  const handleRetry = () => {
    if (selectedFile) {
      handleUpload(selectedFile)
    }
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="image-upload-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        id="lost-item-image-input"
        aria-label="Upload photo"
      />

      {/* When no image is selected / no preview */}
      {!previewUrl && (
        <div
          className={`image-upload-dropzone ${isDragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openFilePicker()
            }
          }}
          aria-label="Drop photo here or click to browse"
        >
          <div className="dropzone-icon">
            <i className="bi bi-cloud-arrow-up" />
          </div>
          <div className="dropzone-content">
            <p className="dropzone-title">
              <strong>Click to upload photo</strong> or drag and drop
            </p>
            <p className="dropzone-hint">JPEG, PNG, or WEBP (Max 5 MB • Cloudinary)</p>
          </div>
        </div>
      )}

      {/* When image preview is active */}
      {previewUrl && (
        <div className="image-upload-preview-card">
          <div className="preview-image-container">
            <img
              src={previewUrl}
              alt="Lost item preview"
              className="preview-image-thumbnail"
              onError={() => {
                setObjectUrl(null)
                setSelectedFile(null)
                setRemoved(true)
                setErrorMessage('Unable to load image preview.')
              }}
            />
            {status === 'uploading' && (
              <div className="preview-uploading-overlay">
                <span className="loader-spinner light" />
                <span>Uploading to Cloudinary…</span>
              </div>
            )}
          </div>

          <div className="preview-meta-and-actions">
            <div className="preview-file-info">
              <span className="preview-file-name" title={selectedFile?.name || 'Uploaded photo'}>
                <i className="bi bi-file-earmark-image" />{' '}
                {selectedFile?.name || (isExisting ? 'Current photo' : 'Uploaded photo')}
              </span>
              {selectedFile && (
                <span className="preview-file-size">
                  {formatFileSize(selectedFile.size)}
                </span>
              )}
            </div>

            {/* Status indicator */}
            <div className="preview-status-row">
              {status === 'success' && (
                <span className="upload-status-badge success">
                  <i className="bi bi-check-circle-fill" /> Image uploaded
                </span>
              )}

              {status === 'uploading' && (
                <span className="upload-status-badge uploading">
                  <i className="bi bi-arrow-repeat spin" /> Uploading image…
                </span>
              )}

              {status === 'error' && (
                <span className="upload-status-badge error">
                  <i className="bi bi-exclamation-triangle-fill" /> Upload failed
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="preview-actions">
              <button
                type="button"
                className="button secondary small"
                onClick={openFilePicker}
                disabled={status === 'uploading'}
              >
                <i className="bi bi-arrow-repeat" /> Change image
              </button>

              {status === 'error' && selectedFile && (
                <button
                  type="button"
                  className="button primary small"
                  onClick={handleRetry}
                >
                  <i className="bi bi-arrow-clockwise" /> Retry
                </button>
              )}

              <button
                type="button"
                className="button secondary small text-danger"
                onClick={handleRemove}
                disabled={status === 'uploading'}
              >
                <i className="bi bi-trash" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Human-readable error banner */}
      {errorMessage && (
        <div className="upload-error-banner" role="alert">
          <i className="bi bi-exclamation-circle" />
          <span>{errorMessage}</span>
          {status === 'error' && selectedFile && (
            <button
              type="button"
              className="retry-inline-button"
              onClick={handleRetry}
            >
              Retry upload
            </button>
          )}
        </div>
      )}

      <span className="auth-hint">
        Add a photo if you have one. Photos make reports much easier to recognize on campus.
      </span>
    </div>
  )
}
