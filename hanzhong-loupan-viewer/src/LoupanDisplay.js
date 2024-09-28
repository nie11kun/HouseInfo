import React from 'react';
import { Card, Badge, Carousel } from 'react-bootstrap';

const LoupanDisplay = ({ loupan }) => {
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title>{loupan.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {loupan.location}
        </Card.Subtitle>
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
                  src={houseType.local_image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(houseType.name)}`}
                  onError={handleImageError}
                  alt={houseType.name}
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
  );
};

export default LoupanDisplay;