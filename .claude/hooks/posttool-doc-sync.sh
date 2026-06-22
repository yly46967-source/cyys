#!/usr/bin/env bash
# ============================================
# PostToolUse Doc Sync Check Script
# ============================================
# 职责：检查代码变更是否需要同步模块文档
# 触发条件：Edit/Write 工具调用后
# 依赖：jq, git, python3
# ============================================

set -euo pipefail

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 输出函数
log_info() {
    echo -e "${GREEN}[POSTTOOL-DOC-SYNC]${NC} $1" >&2
}

log_warn() {
    echo -e "${YELLOW}[POSTTOOL-DOC-SYNC]${NC} $1" >&2
}

log_detail() {
    echo -e "${BLUE}  →${NC} $1" >&2
}

# 读取工具调用结果
TOOL_NAME="${CLAUDE_TOOL_NAME:-}"
FILE_PATH="${CLAUDE_FILE_PATH:-}"
EXIT_CODE="${CLAUDE_EXIT_CODE:-}"

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

# 检查工具是否成功执行
is_tool_success() {
    [[ "$EXIT_CODE" == "0" ]]
}

# 获取文件对应的模块文档路径
get_module_doc_path() {
    local file="$1"

    # 转换为相对于项目根目录的路径
    local rel_path="${file#$PROJECT_ROOT/}"
    rel_path="${rel_path#/}"

    # 模块目录映射
    case "$rel_path" in
        assets/css/*)
            echo "assets/css/CLAUDE.md"
            ;;
        assets/js/*)
            echo "assets/js/CLAUDE.md"
            ;;
        design/*)
            echo "design/CLAUDE.md"
            ;;
        设计文档/*)
            echo "设计文档/CLAUDE.md"
            ;;
        *.html)
            echo "CLAUDE.md"
            ;;
        *)
            echo ""
            ;;
    esac
}

# 检查模块文档是否存在
module_doc_exists() {
    local doc_path="$1"
    [[ -n "$doc_path" && -f "$PROJECT_ROOT/$doc_path" ]]
}

# 判断是否需要文档同步
needs_doc_sync() {
    local file="$1"
    local tool="$2"

    # 跳过文档文件本身
    if [[ "$file" =~ \.md$ ]]; then
        return 1
    fi

    # 跳过白名单文件
    local whitelist_exts=(
        "\\.json$"
        "\\.txt$"
        "\\.sh$"
        "\\.png$"
        "\\.jpg$"
        "\\.svg$"
        "\\.ico$"
        "\\.woff.*$"
    )

    for ext in "${whitelist_exts[@]}"; do
        if [[ "$file" =~ $ext ]]; then
            return 1
        fi
    done

    # 核心源码文件需要文档同步
    local core_patterns=(
        "assets/css/.*\.css$"
        "assets/js/.*\.js$"
        "assets/data/.*\.json$"
        ".*\.html$"
    )

    for pattern in "${core_patterns[@]}"; do
        if [[ "$file" =~ $pattern ]]; then
            return 0
        fi
    done

    return 1
}

# 主函数
main() {
    # 只处理成功的写入操作
    if ! is_write_tool; then
        exit 0
    fi

    if ! is_tool_success; then
        exit 0
    fi

    # 检查文件路径
    if [[ -z "$FILE_PATH" ]]; then
        exit 0
    fi

    # 转换为绝对路径
    local abs_file_path="$FILE_PATH"
    if [[ ! "$abs_file_path" =~ ^/ ]]; then
        abs_file_path="$PROJECT_ROOT/$abs_file_path"
    fi

    # 检查是否需要文档同步
    if ! needs_doc_sync "$abs_file_path" "$TOOL_NAME"; then
        exit 0
    fi

    # 获取对应的模块文档路径
    local doc_path
    doc_path=$(get_module_doc_path "$abs_file_path")

    if [[ -z "$doc_path" ]]; then
        exit 0
    fi

    # 检查模块文档是否存在
    if ! module_doc_exists "$doc_path"; then
        log_warn "⚠️  模块文档不存在: $doc_path"
        log_detail "文件: $abs_file_path"
        log_detail "建议：创建模块文档以记录代码变更"
        exit 0
    fi

    # 输出文档同步提醒
    log_info "📋 可能需要同步模块文档"
    log_detail "修改文件: $abs_file_path"
    log_detail "对应文档: $doc_path"

    # 根据文件类型给出具体建议
    local rel_file="${abs_file_path#$PROJECT_ROOT/}"
    case "$rel_file" in
        assets/css/*)
            log_detail "CSS 变更可能需要更新："
            log_detail "  - 新增/删除 CSS 类 → 更新「文件成员清单」"
            log_detail "  - 修改 CSS 变量 → 更新「对外接口 (CSS 变量)」"
            log_detail "  - 新增组件样式 → 更新「样式组织结构」"
            ;;
        assets/js/*)
            log_detail "JS 变更可能需要更新："
            log_detail "  - 新增/删除函数 → 更新「对外接口」"
            log_detail "  - 新增/删除事件监听器 → 更新「事件监听器」表"
            log_detail "  - 修改函数签名 → 更新「函数签名」说明"
            ;;
        *.html)
            log_detail "HTML 变更可能需要更新："
            log_detail "  - 新增/删除页面 → 更新「目录地图」"
            log_detail "  - 修改页面结构 → 更新「模块职责」"
            ;;
    esac

    exit 0
}

main "$@"
