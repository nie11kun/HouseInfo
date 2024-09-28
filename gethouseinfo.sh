#!/bin/bash

# 设置主目录路径
MAIN_DIR="/home/script/HouseInfo"  # 请替换为实际的主目录路径

# 切换到主目录
echo "Changing to main directory: $MAIN_DIR"
cd "$MAIN_DIR" || { echo "Error: Failed to change to main directory."; exit 1; }

# 运行 main.py
echo "Running main.py..."
python3 main.py

# 检查 Python 脚本的退出状态
if [ $? -ne 0 ]; then
    echo "Error: main.py failed to execute successfully."
    exit 1
fi

# 切换到 hanzhong-loupan-viewer 目录
VIEWER_DIR="$MAIN_DIR/hanzhong-loupan-viewer"
echo "Changing to hanzhong-loupan-viewer directory: $VIEWER_DIR"
cd "$VIEWER_DIR" || { echo "Error: Failed to change to hanzhong-loupan-viewer directory."; exit 1; }

# 运行 npm run build
echo "Running npm run build in hanzhong-loupan-viewer..."
npm run build

# 检查 npm 命令的退出状态
if [ $? -ne 0 ]; then
    echo "Error: npm run build failed to execute successfully."
    exit 1
fi

echo "All tasks completed successfully."