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
        <Card.Body>
          <Card.Title>{loupan.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{loupan.location}</Card.Subtitle>
          <div className="d-flex flex-wrap mb-2">
            <Badge bg="primary" className="me-2 mb-1">{loupan.status}</Badge>
            <Badge bg="secondary" className="me-2 mb-1">{loupan.type}</Badge>
          </div>
          <p className="mb-1">价格: {loupan.price} {loupan.price_unit}</p>
          <p className="mb-1">总价: {loupan.total_price}</p>
          <p className="mb-1">最新开盘: {loupan.latest_open_date}</p>
          <p className="mb-1">绿化率: {loupan.green_ratio || 'N/A'}</p>
          <p className="mb-1">容积率: {loupan.plot_ratio || 'N/A'}</p>
          <p className="mb-3">物业费: {loupan.property_fee || 'N/A'}</p>
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
                      style={{ height: '250px', objectFit: 'cover', cursor: 'pointer' }}
                      src={houseType.local_image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(houseType.name)}`}
                      onError={handleImageError}
                      alt={houseType.name}
                      onClick={() => handleImageClick(houseType.local_image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(houseType.name)}`)}
                    />
                    <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-50 text-white">
                      <h6 className="mb-1">{houseType.name}</h6>
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