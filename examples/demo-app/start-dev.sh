#!/bin/bash

# 修复 icu4c 依赖问题的启动脚本

echo "🔧 正在修复 icu4c 依赖..."

# 创建临时符号链接目录
ICU_LIB_DIR="/tmp/icu4c-compat"
mkdir -p "$ICU_LIB_DIR"

# 创建符号链接
ln -sf /opt/homebrew/Cellar/icu4c@77/77.1/lib/libicui18n.77.1.dylib "$ICU_LIB_DIR/libicui18n.74.dylib"
ln -sf /opt/homebrew/Cellar/icu4c@77/77.1/lib/libicuuc.77.1.dylib "$ICU_LIB_DIR/libicuuc.74.dylib"
ln -sf /opt/homebrew/Cellar/icu4c@77/77.1/lib/libicudata.77.1.dylib "$ICU_LIB_DIR/libicudata.74.dylib"

echo "✅ 符号链接已创建"
echo "📦 准备启动开发服务器..."

# 使用环境变量启动
export DYLD_FALLBACK_LIBRARY_PATH="/tmp/icu4c-compat:/opt/homebrew/Cellar/icu4c@77/77.1/lib:$DYLD_FALLBACK_LIBRARY_PATH"

echo "🚀 启动中..."
pnpm dev


