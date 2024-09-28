import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Dropdown, ButtonGroup, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoupanDisplay from './LoupanDisplay';

function App() {
  const [loupans, setLoupans] = useState([]);
  const [sortedLoupans, setSortedLoupans] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [houseTypeOptions, setHouseTypeOptions] = useState([]);
  const [selectedHouseType, setSelectedHouseType] = useState('all');
  const [salesStatusOptions, setSalesStatusOptions] = useState([]);
  const [selectedSalesStatus, setSelectedSalesStatus] = useState('all');
  const [scrapeTime, setScrapeTime] = useState('');

  useEffect(() => {
    axios.get('/hanzhong_loupan_data.json')
      .then(response => {
        setLoupans(response.data.loupans);
        setSortedLoupans(response.data.loupans);
        setScrapeTime(response.data.scrape_time);
        
        // 提取所有可能的户型选项
        const houseTypes = new Set();
        // 提取所有可能的销售状态选项
        const salesStatuses = new Set();
        
        response.data.loupans.forEach(loupan => {
          loupan.house_types.forEach(house => {
            if (house.name) {
              houseTypes.add(house.name);
            }
          });
          if (loupan.status) {
            salesStatuses.add(loupan.status);
          }
        });
        
        setHouseTypeOptions(['all', ...Array.from(houseTypes)]);
        setSalesStatusOptions(['all', ...Array.from(salesStatuses)]);
      })
      .catch(error => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const sortLoupans = (criteria) => {
    let sorted = [...sortedLoupans];
    switch(criteria) {
      case 'price':
        sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'totalPrice':
        sorted.sort((a, b) => {
          const getNumber = (str) => parseFloat(str.replace(/[^0-9.-]+/g,""));
          return getNumber(a.total_price) - getNumber(b.total_price);
        });
        break;
      case 'openDate':
        sorted.sort((a, b) => new Date(b.latest_open_date) - new Date(a.latest_open_date));
        break;
      default:
        sorted = [...loupans];
    }
    setSortedLoupans(sorted);
    setSortBy(criteria);
  };

  const filterLoupans = useCallback(() => {
    let filtered = loupans;
    
    if (selectedHouseType !== 'all') {
      filtered = filtered.filter(loupan => 
        loupan.house_types.some(house => house.name === selectedHouseType)
      );
    }
    
    if (selectedSalesStatus !== 'all') {
      filtered = filtered.filter(loupan => loupan.status === selectedSalesStatus);
    }
    
    setSortedLoupans(filtered);
    setSortBy('default');
  }, [loupans, selectedHouseType, selectedSalesStatus]);

  useEffect(() => {
    filterLoupans();
  }, [filterLoupans]);

  return (
    <Container fluid>
      <h1 className="text-center my-4">汉中楼盘信息</h1>
      <p className="text-center text-muted">数据更新时间: {scrapeTime}</p>
      <div className="d-flex justify-content-between mb-3">
        <Form.Select 
          style={{width: 'auto'}}
          value={selectedHouseType}
          onChange={(e) => setSelectedHouseType(e.target.value)}
        >
          {houseTypeOptions.map((option, index) => (
            <option key={index} value={option}>
              {option === 'all' ? '所有户型' : option}
            </option>
          ))}
        </Form.Select>
        <Form.Select 
          style={{width: 'auto'}}
          value={selectedSalesStatus}
          onChange={(e) => setSelectedSalesStatus(e.target.value)}
        >
          {salesStatusOptions.map((option, index) => (
            <option key={index} value={option}>
              {option === 'all' ? '所有销售状态' : option}
            </option>
          ))}
        </Form.Select>
        <Dropdown as={ButtonGroup}>
          <Dropdown.Toggle variant="primary" id="dropdown-basic">
            排序方式: {sortBy === 'default' ? '默认' : 
                       sortBy === 'price' ? '价格' : 
                       sortBy === 'totalPrice' ? '总价' : '最新开盘时间'}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => sortLoupans('default')}>默认</Dropdown.Item>
            <Dropdown.Item onClick={() => sortLoupans('price')}>价格</Dropdown.Item>
            <Dropdown.Item onClick={() => sortLoupans('totalPrice')}>总价</Dropdown.Item>
            <Dropdown.Item onClick={() => sortLoupans('openDate')}>最新开盘时间</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <Row>
        {sortedLoupans.map((loupan, index) => (
          <Col key={index} md={6} lg={4} className="mb-4">
            <LoupanDisplay loupan={loupan} selectedHouseType={selectedHouseType} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default App;