import React, { useState, useRef, useEffect } from 'react';
import { Card, Badge, Carousel } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Home, DollarSign, Droplets, TreePine } from 'lucide-react';

const LoupanDisplay = ({ loupan, selectedHouseType }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef(null);
  const imageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const [modalSize, setModalSize] = useState('lg');

  const filteredHouseTypes = selectedHouseType === 'all' 
    ? loupan.house_types 
    : loupan.house_types.filter(house => house.name === selectedHouseType);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
  };

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowModal(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setModalSize('lg');
  };

  const handleModalImageClick = (e) => {
    if (scale === 1) {
      setShowModal(false);
    }
  };

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const updateModalSize = (newScale) => {
    if (newScale <= 1) {
      setModalSize('lg');
    } else if (newScale <= 2) {
      setModalSize('xl');
    } else {
      setModalSize('fullscreen');
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(1, scale + delta), 3);
    setScale(newScale);
    updateModalSize(newScale);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      imageRef.current.dataset.initialPinchDistance = distance;
      imageRef.current.dataset.initialScale = scale;
    } else if (e.touches.length === 1) {
      setPanning(true);
      lastPositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const initialDistance = parseFloat(imageRef.current.dataset.initialPinchDistance);
      const initialScale = parseFloat(imageRef.current.dataset.initialScale);
      const newScale = Math.min(Math.max(1, initialScale * (distance / initialDistance)), 3);
      setScale(newScale);
      updateModalSize(newScale);
    } else if (e.touches.length === 1 && panning) {
      const deltaX = e.touches[0].clientX - lastPositionRef.current.x;
      const deltaY = e.touches[0].clientY - lastPositionRef.current.y;
      setPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      lastPositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    setPanning(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isHovering) {
        if (e.key === 'ArrowLeft') {
          carouselRef.current.prev();
        } else if (e.key === 'ArrowRight') {
          carouselRef.current.next();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHovering]);

  // 获取地理位置的最后一部分
  const getLastLocationPart = (location) => {
    const parts = location.split('/');
    return parts[parts.length - 1].trim();
  };

  return (
    <>
      <Card className="h-100 shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <Card.Title className="h5 mb-2">{loupan.name}</Card.Title>
              <Card.Subtitle className="text-muted small d-flex align-items-center mb-2">
                <MapPin size={14} className="me-1 text-primary" />
                <span title={loupan.location}>{getLastLocationPart(loupan.location)}</span>
              </Card.Subtitle>
              <div>
                <Badge bg="primary" className="me-1">{loupan.status}</Badge>
                <Badge bg="secondary">{loupan.type}</Badge>
              </div>
            </div>
          </div>
          
          <div className="row g-2 mb-3">
            <div className="col-6">
              <InfoItem icon={<DollarSign size={14} />} label="价格" value={`${loupan.price} ${loupan.price_unit}`} />
            </div>
            <div className="col-6">
              <InfoItem icon={<TreePine size={14} />} label="绿化率" value={loupan.green_ratio || 'N/A'} />
            </div>
            <div className="col-6">
              <InfoItem icon={<Home size={14} />} label="总价" value={loupan.total_price} />
            </div>
            <div className="col-6">
              <InfoItem icon={<Droplets size={14} />} label="容积率" value={loupan.plot_ratio || 'N/A'} />
            </div>
            <div className="col-6">
              <InfoItem icon={<Calendar size={14} />} label="最新开盘" value={loupan.latest_open_date} />
            </div>
            <div className="col-6">
              <InfoItem icon={<DollarSign size={14} />} label="物业费" value={loupan.property_fee || 'N/A'} />
            </div>
          </div>

          {filteredHouseTypes.length > 0 && (
            <div className="position-relative" 
                 onTouchStart={handleTouchStart} 
                 onTouchMove={handleTouchMove}
                 onMouseEnter={() => setIsHovering(true)}
                 onMouseLeave={() => setIsHovering(false)}>
              <Carousel
                ref={carouselRef}
                activeIndex={index}
                onSelect={handleSelect}
                prevIcon={<ChevronLeft className="carousel-control-icon" size={24} />}
                nextIcon={<ChevronRight className="carousel-control-icon" size={24} />}
                indicators={false}
                interval={null}
              >
                {filteredHouseTypes.map((houseType, hIndex) => (
                  <Carousel.Item key={hIndex}>
                    <img
                      className="d-block w-100 rounded"
                      style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                      src={houseType.local_image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(houseType.name)}`}
                      onError={handleImageError}
                      alt={houseType.name}
                      onClick={() => handleImageClick(houseType.local_image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(houseType.name)}`)}
                    />
                    <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-75 text-white rounded-bottom">
                      <h6 className="mb-0">{houseType.name}</h6>
                      <p className="mb-0 small">{houseType.area} | {houseType.price}</p>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered 
        size={modalSize}
        className="image-modal"
      >
        <Modal.Body className="p-0" style={{ overflow: 'hidden' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              touchAction: 'none'
            }}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img 
              ref={imageRef}
              src={selectedImage} 
              alt="Enlarged view" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                cursor: scale === 1 ? 'pointer' : 'move',
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transition: 'transform 0.1s ease-out'
              }}
              onClick={handleModalImageClick}
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="d-flex align-items-center">
    <span className="text-muted me-1">{icon}</span>
    <small className="text-muted me-1">{label}:</small>
    <span className="small">{value}</span>
  </div>
);

export default LoupanDisplay;