import React, { useState } from 'react';
import { Card, Badge, Carousel } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';

const LoupanDisplay = ({ loupan }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
  };

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowModal(true);
  };

  return (
    <>
      <Card className="h-100">
        <Card.Body>
          <Card.Title>{loupan.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{loupan.location}</Card.Subtitle>
          <Card.Text>
            <Badge bg="primary" className="me-2">{loupan.status}</Badge>
            <Badge bg="secondary" className="me-2">{loupan.type}</Badge>
            <p className="mt-2">价格: {loupan.price} {loupan.price_unit}</p>
            <p>总价: {loupan.total_price}</p>
            <p>最新开盘: {loupan.latest_open_date}</p>
          </Card.Text>
          {loupan.house_types.length > 0 && (
            <Carousel>
              {loupan.house_types.map((houseType, hIndex) => (
                <Carousel.Item key={hIndex}>
                  <img
                    className="d-block w-100"
                    style={{ maxHeight: '200px', objectFit: 'cover', cursor: 'pointer' }} // 合并 style 属性
                    src={houseType.local_image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(houseType.name)}`}
                    onError={handleImageError}
                    alt={houseType.name}
                    onClick={() => handleImageClick(houseType.local_image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(houseType.name)}`)}
                  />
                  <Carousel.Caption className="bg-dark bg-opacity-50">
                    <h5>{houseType.name}</h5>
                    <p>{houseType.area}</p>
                    <p>{houseType.price}</p>
                  </Carousel.Caption>
                </Carousel.Item>
              ))}
            </Carousel>
          )}
        </Card.Body>
      </Card>

      {/* Modal for image enlargement */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Body>
          <img src={selectedImage} alt="Enlarged view" className="w-100" />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LoupanDisplay;
