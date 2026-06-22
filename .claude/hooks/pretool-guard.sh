#!/usr/bin/env bash
# ============================================
# PreToolUse Guard Script
# ============================================
# 职责：阻断对受保护目录的写入操作
# 触发条件：Edit/Write 工具调用前
# 依赖：jq, git
# ============================================

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录（自动检测）
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RULES_FILE="$PROJECT_ROOT/.claude/hooks/patterns/project-rules.md"

# 读取工具调用参数
TOOL_NAME="${CLAUDE_TOOL_NAME:-}"
FILE_PATH="${CLAUDE_FILE_PATH:-}"

# 日志函数
log_block() {
    echo -e "${RED}[PRETOOL-GUARD]${NC} $1" >&2
}

log_warn() {
    echo -e "${YELLOW}[PRETOOL-GUARD]${NC} $1" >&2
}

# 检查是否是写入类工具
is_write_tool() {
    case "$TOOL_NAME" in
        Edit|Write)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# 检查路径是否受保护
is_protected_path() {
    local path="$1"

    # 转换为绝对路径
    if [[ ! "$path" =~ ^/ ]]; then
        path="$PROJECT_ROOT/$path"
    fi

    # 归一化路径
    path=$(realpath "$path" 2>/dev/null || echo "$path")

    # 受保护目录列表
    local protected_dirs=(
        ".git/"
        "dist/"
        "build/"
        "migrations/"
        "node_modules/"
    )

    # 检查是否在受保护目录下
    for dir in "${protected_dirs[@]}"; do
        if [[ "$path" == "$PROJECT_ROOT/$dir"* ]]; then
            return 0
        fi
    done

    return 1
}

# 检查是否是白名单文件
is_whitelisted() {
    local file="$1"

    # 白名单扩展名
    local whitelist_exts=(
        "\\.json$"
        "\\.md$"
        "\\.txt$"
        "\\.sh$"
        "\\.png$"
        "\\.jpg$"
        "\\.jpeg$"
        "\\.svg$"
        "\\.ico$"
        "\\.woff.*$"
    )

    for ext in "${whitelist_exts[@]}"; do
        if [[ "$file" =~ $ext ]]; then
            return 0
        fi
    done

    # 白名单文件名
    local whitelist_names=(
        "README"
        "LICENSE"
        ".gitignore"
    )

    for name in "${whitelist_names[@]}"; do
        if [[ "$(basename "$file")" == "$name" ]]; then
            return 0
        fi
    done

    return 1
}

# 检查是否是核心源码文件
is_core_source_file() {
    local file="$1"

    # 核心源码目录
    local core_dirs=(
        "assets/css/"
        "assets/js/"
        "assets/data/"
    )

    # 根目录的 HTML 文件
    if [[ "$file" =~ ^[^/]+\.html$ ]]; then
        return 0
    fi

    # 核心源码目录下的文件
    for dir in "${core_dirs[@]}"; do
        if [[ "$file" == "$dir"* ]]; then
            return 0
        fi
    done

    return 1
}

# 检查 L3 文件头
check_l3_headers() {
    local file="$1"

    # 只检查核心源码文件
    if ! is_core_source_file "$file"; then
        return 0
    fi

    # 跳过不存在的文件（新文件）
    if [[ ! -f "$file" ]]; then
        # 新文件需要检查内容中是否包含 L3 文件头
        # 这个检查在 Write 工具调用时可能无法获取内容
        # 这里只做路径检查，实际内容检查在 PostToolUse 中完成
        return 0
    fi

    # 读取文件前 50 行
    local content
    content=$(head -n 50 "$file" 2>/dev/null || echo "")

    # 必需的 L3 字段
    local required_fields=(
        "\[FILE\]"
        "\[POS\]"
        "\[IN\]"
        "\[OUT\]"
        "\[DEP\]"
        "\[SIDE EFFECT\]"
        "\[TEST\]"
    )

    # 检查是否包含所有必需字段
    for field in "${required_fields[@]}"; do
        if ! echo "$content" | grep -q "$field"; then
            log_block "❌ 文件缺少 L3 文件头字段: $field"
            log_block "   文件: $file"
            log_block ""
            log_block "核心源码文件必须包含完整的 L3 文件头："
            log_block "  [FILE]    文件名称和简要说明"
            log_block "  [POS]     职责定位"
            log_block "  [IN]      输入"
            log_block "  [OUT]     输出"
            log_block "  [DEP]     依赖项"
            log_block "  [SIDE EFFECT] 副作用"
            log_block "  [TEST]    测试方式"
            return 1
        fi
    done

    return 0
}

# 主函数
main() {
    # 只处理写入类工具
    if ! is_write_tool; then
        exit 0
    fi

    # 检查文件路径是否提供
    if [[ -z "$FILE_PATH" ]]; then
        exit 0
    fi

    # 检查是否是受保护路径
    if is_protected_path "$FILE_PATH"; then
        log_block "🚫 阻断：受保护目录禁止写入"
        log_block "   工具: $TOOL_NAME"
        log_block "   路径: $FILE_PATH"
        log_block ""
        log_block "受保护目录：.git/, dist/, build/, migrations/, node_modules/"
        exit 1
    fi

    # 检查 L3 文件头（仅对核心源码文件）
    # 对于 Edit 工具，检查现有文件
    # 对于 Write 工具，暂时跳过（内容检查在 PostToolUse 中完成）
    if [[ "$TOOL_NAME" == "Edit" ]]; then
        if ! check_l3_headers "$FILE_PATH"; then
            log_block "💡 建议：请先添加 L3 文件头，或使用白名单文件扩展名"
            exit 1
        fi
    fi

    exit 0
}

main "$@"
