import React, { useState, useRef, useEffect } from 'react';
import { Card, Badge, Carousel } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LoupanDisplay = ({ loupan, selectedHouseType }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef(null);

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
  };

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    carouselRef.current.touchStartX = touch.clientX;
  };

  const handleTouchMove = (e) => {
    if (!carouselRef.current.touchStartX) {
      return;
    }
    const touch = e.touches[0];
    const diff = carouselRef.current.touchStartX - touch.clientX;
    if (diff > 50) {
      carouselRef.current.next();
    } else if (diff < -50) {
      carouselRef.current.prev();
    }
    carouselRef.current.touchStartX = null;
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

  return (
    <>
      <Card className="h-100">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <Card.Title className="mb-0">{loupan.name}</Card.Title>
              <Card.Subtitle className="text-muted small">{loupan.location}</Card.Subtitle>
            </div>
            <div className="d-flex">
              <Badge bg="primary" className="me-1">{loupan.status}</Badge>
              <Badge bg="secondary">{loupan.type}</Badge>
            </div>
          </div>
          
          <div className="row g-2 mb-3">
            <div className="col-6">
              <small className="text-muted">价格:</small> {loupan.price} {loupan.price_unit}
            </div>
            <div className="col-6">
              <small className="text-muted">绿化率:</small> {loupan.green_ratio || 'N/A'}
            </div>
            <div className="col-6">
              <small className="text-muted">总价:</small> {loupan.total_price}
            </div>
            <div className="col-6">
              <small className="text-muted">容积率:</small> {loupan.plot_ratio || 'N/A'}
            </div>
            <div className="col-6">
              <small className="text-muted">最新开盘:</small> {loupan.latest_open_date}
            </div>
            <div className="col-6">
              <small className="text-muted">物业费:</small> {loupan.property_fee || 'N/A'}
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
                prevIcon={<ChevronLeft className="text-primary" size={24} />}
                nextIcon={<ChevronRight className="text-primary" size={24} />}
                indicators={false}
                interval={null}
              >
                {filteredHouseTypes.map((houseType, hIndex) => (
                  <Carousel.Item key={hIndex}>
                    <img
                      className="d-block w-100"
                      style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                      src={houseType.local_image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(houseType.name)}`}
                      onError={handleImageError}
                      alt={houseType.name}
                      onClick={() => handleImageClick(houseType.local_image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(houseType.name)}`)}
                    />
                    <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-50 text-white">
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

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Body className="p-0">
          <img src={selectedImage} alt="Enlarged view" className="w-100" />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LoupanDisplay;