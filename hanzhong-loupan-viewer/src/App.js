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
        
        const houseTypes = new Set();
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

  const parseNumber = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const number = parseFloat(value.replace(/[^0-9.-]+/g,""));
      return isNaN(number) ? -Infinity : number;
    }
    return -Infinity;
  };

  const sortLoupans = (criteria) => {
    let sorted = [...sortedLoupans];
    switch(criteria) {
      case 'price':
        sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'totalPrice':
        sorted.sort((a, b) => parseNumber(a.total_price) - parseNumber(b.total_price));
        break;
      case 'openDate':
        sorted.sort((a, b) => new Date(b.latest_open_date) - new Date(a.latest_open_date));
        break;
      case 'greenRatio':
        sorted.sort((a, b) => parseNumber(b.green_ratio) - parseNumber(a.green_ratio));
        break;
      case 'plotRatio':
        sorted.sort((a, b) => parseNumber(a.plot_ratio) - parseNumber(b.plot_ratio));
        break;
      case 'propertyFee':
        sorted.sort((a, b) => parseNumber(a.property_fee) - parseNumber(b.property_fee));
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

  const getSortByText = (sortBy) => {
    const sortOptions = {
      'default': '默认',
      'price': '价格',
      'totalPrice': '总价',
      'openDate': '最新开盘时间',
      'greenRatio': '绿化率',
      'plotRatio': '容积率',
      'propertyFee': '物业费'
    };
    return sortOptions[sortBy] || '默认';
  };

  return (
    <Container fluid className="px-3 px-md-4">
      <h1 className="text-center my-4">汉中楼盘信息</h1>
      <p className="text-center text-muted">数据更新时间: {scrapeTime}</p>
      <Row className="mb-3 g-2">
        <Col xs={12} sm={6} md={4}>
          <Form.Select 
            value={selectedHouseType}
            onChange={(e) => setSelectedHouseType(e.target.value)}
            className="w-100"
          >
            {houseTypeOptions.map((option, index) => (
              <option key={index} value={option}>
                {option === 'all' ? '所有户型' : option}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Form.Select 
            value={selectedSalesStatus}
            onChange={(e) => setSelectedSalesStatus(e.target.value)}
            className="w-100"
          >
            {salesStatusOptions.map((option, index) => (
              <option key={index} value={option}>
                {option === 'all' ? '所有销售状态' : option}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={4}>
          <Dropdown as={ButtonGroup} className="w-100">
            <Dropdown.Toggle variant="primary" id="dropdown-basic" className="w-100">
              排序方式: {getSortByText(sortBy)}
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100">
              <Dropdown.Item onClick={() => sortLoupans('default')}>默认</Dropdown.Item>
              <Dropdown.Item onClick={() => sortLoupans('price')}>价格</Dropdown.Item>
              <Dropdown.Item onClick={() => sortLoupans('totalPrice')}>总价</Dropdown.Item>
              <Dropdown.Item onClick={() => sortLoupans('openDate')}>最新开盘时间</Dropdown.Item>
              <Dropdown.Item onClick={() => sortLoupans('greenRatio')}>绿化率</Dropdown.Item>
              <Dropdown.Item onClick={() => sortLoupans('plotRatio')}>容积率</Dropdown.Item>
              <Dropdown.Item onClick={() => sortLoupans('propertyFee')}>物业费</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      <Row>
        {sortedLoupans.map((loupan, index) => (
          <Col key={index} xs={12} md={6} lg={4} className="mb-4">
            <LoupanDisplay loupan={loupan} selectedHouseType={selectedHouseType} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default App;