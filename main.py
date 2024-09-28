import requests
from bs4 import BeautifulSoup
import json
import time
import os
from urllib.parse import urlparse
import datetime

def get_all_pages(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    page_links = soup.select('section.se-part .se-link-container a')
    max_page = max(int(link.text) for link in page_links if link.text.isdigit())
    
    return [f"{url}pg{i}/" for i in range(1, max_page + 1)]

def download_image(url, folder):
    if not url or url == 'N/A':
        return None
    
    # 获取文件名
    filename = os.path.basename(urlparse(url).path)
    
    # 构建保存路径
    save_path = os.path.join(folder, filename)
    
    # 下载图片
    response = requests.get(url)
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            f.write(response.content)
        return filename  # 返回文件名而不是完整路径
    return None

def get_loupan_details(detail_url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(detail_url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    details = {}
    
    # 获取最新开盘日期
    open_date_elem = soup.find('span', class_='title', string='最新开盘')
    if open_date_elem:
        open_date = open_date_elem.find_next('span', class_='content')
        details['latest_open_date'] = open_date.text.strip() if open_date else 'N/A'
    else:
        details['latest_open_date'] = 'N/A'
    
    # 获取户型信息
    details['house_types'] = []
    house_type_container = soup.find('div', class_='houselist frame-container carousel')
    if house_type_container:
        house_types = house_type_container.find_all('li', class_='item top-item')
        for house_type in house_types:
            type_info = {}
            
            # 获取户型名称
            content_title = house_type.find('div', class_='content-title')
            if content_title:
                type_info['name'] = content_title.text.strip()
            else:
                type_info['name'] = 'N/A'
            
            # 获取面积信息
            content_area = house_type.find('div', class_='content-area')
            if content_area:
                type_info['area'] = content_area.text.strip()
            else:
                type_info['area'] = 'N/A'
            
            # 获取价格信息
            content_price = house_type.find('div', class_='content-price')
            if content_price:
                type_info['price'] = content_price.text.strip()
            else:
                type_info['price'] = 'N/A'
            
            # 获取图片URL
            img_elem = house_type.find('img', class_='img')
            if img_elem and 'src' in img_elem.attrs:
                type_info['image_url'] = img_elem['src']
            else:
                type_info['image_url'] = 'N/A'
            
            details['house_types'].append(type_info)
    
    # 获取更多楼盘信息的链接
    more_info_link = soup.find('div', class_='more-building')
    if more_info_link and more_info_link.find('a'):
        more_info_url = 'https://hanzhong.fang.ke.com' + more_info_link.find('a')['href']
        more_info_response = requests.get(more_info_url, headers=headers)
        more_info_soup = BeautifulSoup(more_info_response.text, 'html.parser')
        
        # 提取绿化率、容积率和物业费信息
        info_boxes = more_info_soup.find_all('ul', class_='x-box')
        for box in info_boxes:
            items = box.find_all('li')
            for item in items:
                label = item.find('span', class_='label')
                value = item.find('span', class_='label-val')
                if label and value:
                    if '绿化率' in label.text:
                        details['green_ratio'] = value.text.strip()
                    elif '容积率' in label.text:
                        details['plot_ratio'] = value.text.strip()
                    elif '物业费' in label.text:
                        details['property_fee'] = value.text.strip()
        
    # 下载图片
    current_dir = os.path.dirname(os.path.abspath(__file__))
    react_public_dir = os.path.join(current_dir, 'hanzhong-loupan-viewer', 'public', 'images')
    os.makedirs(react_public_dir, exist_ok=True)
    
    for house_type in details['house_types']:
        if 'image_url' in house_type and house_type['image_url'] != 'N/A':
            local_image = download_image(house_type['image_url'], react_public_dir)
            house_type['local_image'] = f'/images/{local_image}' if local_image else None
    
    return details

def scrape_loupan(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    print(f"Scraping {url}")
    print(f"Status Code: {response.status_code}")
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    loupan_items = soup.find_all('div', class_='resblock-desc-wrapper')
    print(f"Number of items found on this page: {len(loupan_items)}")
    
    loupans = []
    for item in loupan_items:
        loupan = {}
        
        # 提取楼盘名称和详情页链接
        name_elem = item.find('a', class_='name')
        if name_elem:
            loupan['name'] = name_elem.text.strip()
            detail_url = 'https://hanzhong.fang.ke.com' + name_elem['href']
            loupan_details = get_loupan_details(detail_url)
            loupan.update(loupan_details)
        else:
            loupan['name'] = 'N/A'
            loupan['latest_open_date'] = 'N/A'
            loupan['house_types'] = []
        
        # 提取楼盘状态和类型
        status_spans = item.find_all('span', class_='resblock-type')
        loupan['status'] = status_spans[0].text if status_spans else 'N/A'
        loupan['type'] = status_spans[1].text if len(status_spans) > 1 else 'N/A'
        
        # 提取位置信息
        location = item.find('a', class_='resblock-location')
        loupan['location'] = location.text.strip() if location else 'N/A'
        
        # 提取户型和面积信息
        room_info = item.find('a', class_='resblock-room')
        if room_info:
            room_spans = room_info.find_all('span')
            loupan['room_types'] = '/'.join([span.text for span in room_spans if '室' in span.text])
            area = room_info.find('span', class_='area')
            loupan['area'] = area.text.strip() if area else 'N/A'
        else:
            loupan['room_types'] = 'N/A'
            loupan['area'] = 'N/A'
        
        # 提取标签
        tags = item.find('div', class_='resblock-tag')
        loupan['tags'] = ', '.join([span.text for span in tags.find_all('span')]) if tags else 'N/A'
        
        # 提取价格信息
        price_info = item.find('div', class_='resblock-price')
        if price_info:
            main_price = price_info.find('span', class_='number')
            loupan['price'] = main_price.text.strip() if main_price else 'N/A'
            
            price_desc = price_info.find('span', class_='desc')
            loupan['price_unit'] = price_desc.text.strip() if price_desc else 'N/A'
            
            second_price = price_info.find('div', class_='second')
            loupan['total_price'] = second_price.text.strip() if second_price else 'N/A'
        else:
            loupan['price'] = 'N/A'
            loupan['price_unit'] = 'N/A'
            loupan['total_price'] = 'N/A'
        
        loupans.append(loupan)
        time.sleep(1)  # 在每次请求详情页之间添加延时
    
    return loupans

def save_to_json(loupans, filename):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    react_public_dir = os.path.join(current_dir, 'hanzhong-loupan-viewer', 'public')
    os.makedirs(react_public_dir, exist_ok=True)
    file_path = os.path.join(react_public_dir, filename)
    
    # 添加爬取时间
    data = {
        "scrape_time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "loupans": loupans
    }
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print(f"Data saved to {file_path}")

# 主程序
base_url = 'https://hanzhong.fang.ke.com/loupan/hantaiqu/'
all_pages = get_all_pages(base_url)
all_loupans = []

for page_url in all_pages:
    loupans = scrape_loupan(page_url)
    all_loupans.extend(loupans)
    time.sleep(2)  # 在每次请求之间添加延时，以避免被网站封锁

if all_loupans:
    save_to_json(all_loupans, 'hanzhong_loupan_data.json')
    print(f"Scraped {len(all_loupans)} items from {len(all_pages)} pages.")
else:
    print("No data was scraped.")