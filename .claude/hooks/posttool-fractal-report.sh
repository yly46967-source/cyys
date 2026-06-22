#!/usr/bin/env bash
# ============================================
# PostToolUse Fractal Doc Report Script
# ============================================
# 职责：生成分形文档回环检查报告
# 触发条件：Edit/Write 工具调用后
# 依赖：jq, git, python3
# ============================================

set -euo pipefail

# 颜色定义
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RULES_FILE="$PROJECT_ROOT/.claude/hooks/patterns/project-rules.md"

# 输出函数
print_header() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}  分形文档回环检查报告${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_section() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_item() {
    local status="$1"
    local message="$2"

    case "$status" in
        "✅")
            echo -e "${GREEN}  $status${NC} $message"
            ;;
        "⚠️")
            echo -e "${YELLOW}  $status${NC} $message"
            ;;
        "❌")
            echo -e "${RED}  $status${NC} $message"
            ;;
        "📝")
            echo -e "${CYAN}  $status${NC} $message"
            ;;
        *)
            echo "    $message"
            ;;
    esac
}

# 读取工具调用信息
TOOL_NAME="${CLAUDE_TOOL_NAME:-}"
FILE_PATH="${CLAUDE_FILE_PATH:-}"
EXIT_CODE="${CLAUDE_EXIT_CODE:-}"

# 报告数据
HIT_MODULES=()
CHANGED_FILES=()
HIT_PROTECTED=false
MISSING_L3=false
NEED_DOC_SYNC=false
SUGGESTIONS=()

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

# 检查工具是否成功
is_tool_success() {
    [[ "$EXIT_CODE" == "0" ]]
}

# 检查是否命中受保护路径
check_protected_path() {
    local file="$1"

    # 受保护目录
    local protected_dirs=(
        ".git/"
        "dist/"
        "build/"
        "migrations/"
        "node_modules/"
    )

    for dir in "${protected_dirs[@]}"; do
        if [[ "$file" == *"$dir"* ]]; then
            HIT_PROTECTED=true
            SUGGESTIONS+=("避免修改受保护目录: $dir")
            return
        fi
    done
}

# 检查 L3 文件头
check_l3_headers() {
    local file="$1"

    # 只检查核心源码文件
    local core_patterns=(
        "assets/css/.*\.css$"
        "assets/js/.*\.js$"
        ".*\.html$"
    )

    local is_core=false
    for pattern in "${core_patterns[@]}"; do
        if [[ "$file" =~ $pattern ]]; then
            is_core=true
            break
        fi
    done

    if [[ "$is_core" == "false" ]]; then
        return
    fi

    # 检查文件是否存在
    if [[ ! -f "$file" ]]; then
        # 新文件，需要在内容中检查（这里无法获取）
        return
    fi

    # 读取文件前 50 行
    local content
    content=$(head -n 50 "$file" 2>/dev/null || echo "")

    # 检查必需字段
    local required_fields=(
        "\[FILE\]"
        "\[POS\]"
        "\[IN\]"
        "\[OUT\]"
        "\[DEP\]"
        "\[SIDE EFFECT\]"
        "\[TEST\]"
    )

    for field in "${required_fields[@]}"; do
        if ! echo "$content" | grep -q "$field"; then
            MISSING_L3=true
            SUGGESTIONS+=("文件缺少 L3 文件头字段: $field")
            break
        fi
    done
}

# 获取文件所属模块
get_file_module() {
    local file="$1"

    case "$file" in
        assets/css/*)
            echo "CSS 样式系统模块"
            ;;
        assets/js/*)
            echo "JavaScript 交互模块"
            ;;
        assets/data/*)
            echo "数据模块"
            ;;
        design/*)
            echo "设计文档模块 (英文)"
            ;;
        设计文档/*)
            echo "设计文档模块 (中文)"
            ;;
        *)
            echo "根目录模块"
            ;;
    esac
}

# 检查是否需要文档同步
check_doc_sync_needed() {
    local file="$1"

    # 核心源码文件通常需要文档同步
    local core_patterns=(
        "assets/css/.*\.css$"
        "assets/js/.*\.js$"
        ".*\.html$"
    )

    for pattern in "${core_patterns[@]}"; do
        if [[ "$file" =~ $pattern ]]; then
            NEED_DOC_SYNC=true
            local module
            module=$(get_file_module "$file")
            SUGGESTIONS+=("检查是否需要更新 $module 的 CLAUDE.md")
            break
        fi
    done
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

    # 转换为相对路径
    local rel_file_path="${abs_file_path#$PROJECT_ROOT/}"
    rel_file_path="${rel_file_path#/}"

    # 执行检查
    check_protected_path "$abs_file_path"
    check_l3_headers "$abs_file_path"
    check_doc_sync_needed "$abs_file_path"

    # 收集数据
    CHANGED_FILES+=("$rel_file_path")

    local module
    module=$(get_file_module "$abs_file_path")
    if [[ ! " ${HIT_MODULES[@]} " =~ " ${module} " ]]; then
        HIT_MODULES+=("$module")
    fi

    # 如果没有任何问题，不输出报告
    if [[ "$HIT_PROTECTED" == "false" ]] && \
       [[ "$MISSING_L3" == "false" ]] && \
       [[ "$NEED_DOC_SYNC" == "false" ]]; then
        exit 0
    fi

    # 生成报告
    print_header

    # 基本信息
    echo "工具: $TOOL_NAME"
    echo "文件: $rel_file_path"
    echo "状态: $([[ "$EXIT_CODE" == "0" ]] && echo "成功" || echo "失败")"
    echo ""

    # 命中的模块
    if [[ ${#HIT_MODULES[@]} -gt 0 ]]; then
        print_section "命中的模块"
        for module in "${HIT_MODULES[@]}"; do
            print_item "📦" "$module"
        done
        echo ""
    fi

    # 改动的文件
    print_section "改动的文件"
    print_item "📄" "$rel_file_path"
    echo ""

    # 检查结果
    print_section "检查结果"

    if [[ "$HIT_PROTECTED" == "true" ]]; then
        print_item "❌" "命中受保护路径"
    fi

    if [[ "$MISSING_L3" == "true" ]]; then
        print_item "❌" "缺失 L3 文件头"
    fi

    if [[ "$NEED_DOC_SYNC" == "true" ]]; then
        print_item "⚠️" "可能需要同步模块文档"
    fi

    echo ""

    # 建议补充或人工复核项
    if [[ ${#SUGGESTIONS[@]} -gt 0 ]]; then
        print_section "建议补充或人工复核项"
        for suggestion in "${SUGGESTIONS[@]}"; do
            print_item "📝" "$suggestion"
        done
        echo ""
    fi

    # 报告尾
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    exit 0
}

main "$@"
