#!/bin/bash

##############################################################################
# 此脚本已废弃，请使用新的 start.sh 脚本
# 
# 新脚本支持更多环境和功能，使用方式：
#   ./start.sh mock      # Mock 模式（仅前端）
#   ./start.sh local     # 本地开发模式（前端 + 后端）
#   ./start.sh test      # 测试环境
#   ./start.sh staging   # Staging 环境
#   ./start.sh prod      # 生产环境
##############################################################################

echo ""
echo "⚠️  此脚本已废弃"
echo ""
echo "请使用新的统一启动脚本: ./start.sh"
echo ""
echo "使用方式："
echo "  ./start.sh mock      # 仅前端，Mock 数据"
echo "  ./start.sh local     # 前端 + 本地后端"
echo "  ./start.sh test      # 前端 + 测试环境后端"
echo "  ./start.sh staging   # 前端 + Staging 环境后端"
echo "  ./start.sh prod      # 前端 + 生产环境后端"
echo ""

# 提供快捷方式
read -p "是否要使用 mock 模式启动? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    ./start.sh mock
fi


