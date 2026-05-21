import { useState, useEffect } from 'react'
import './ImageGallery.css'

const ImageGallery = () => {
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images')
      const data = await response.json()
      setImages(data.images || [])
    } catch (error) {
      console.error('Error fetching images:', error)
      // Use placeholder images
      setImages([
        { id: 1, url: '/placeholder1.jpg', name: 'Sailboat 1' },
        { id: 2, url: '/placeholder2.jpg', name: 'Sailboat 2' },
        { id: 3, url: '/placeholder3.jpg', name: 'Sailboat 3' }
      ])
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        fetchImages()
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    }
  }

  const openImageModal = (image) => {
    setSelectedImage(image)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  return (
    <div className="image-gallery-container">
      <div className="gallery-header">
        <h3 className="gallery-title">Media Gallery</h3>
      </div>
      <div className="gallery-scroll">
        {images.length === 0 ? (
          <div className="gallery-empty">
            <p>No images uploaded yet</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map((image) => (
              <div
                key={image.id}
                className="gallery-item"
                onClick={() => openImageModal(image)}
              >
                <div className="gallery-item-placeholder">
                  <div className="placeholder-sailboat-small">
                    <div className="sail-small"></div>
                    <div className="hull-small"></div>
                  </div>
                </div>
                <div className="gallery-item-overlay">
                  <span className="gallery-item-name">{image.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="upload-section">
        <label htmlFor="image-upload" className="upload-button">
          <span className="upload-icon">↑</span>
          <span>Upload Media</span>
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>
      {selectedImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeImageModal}>×</button>
            <div className="modal-image-placeholder">
              <div className="placeholder-sailboat-large">
                <div className="sail-large"></div>
                <div className="hull-large"></div>
              </div>
            </div>
            <p className="modal-image-name">{selectedImage.name}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageGallery