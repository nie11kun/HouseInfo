import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoupanDisplay from './LoupanDisplay';

function App() {
  const [loupans, setLoupans] = useState([]);

  useEffect(() => {
    axios.get('/hanzhong_loupan_data.json')
      .then(response => {
        setLoupans(response.data);
      })
      .catch(error => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  return (
    <Container fluid>
      <h1 className="text-center my-4">汉中楼盘信息</h1>
      <Row>
        {loupans.map((loupan, index) => (
          <Col key={index} md={6} lg={4} className="mb-4">
            <LoupanDisplay loupan={loupan} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default App;