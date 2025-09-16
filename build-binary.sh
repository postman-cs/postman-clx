#!/bin/bash

# Enhanced Postman CLI Build Script with Governance Capabilities (Rust-based)
#
# Usage: ./build-binary.sh [options]
#
# Options:
#   -a, --arch <arch>     Target architecture: linux64, osx_64, osx_arm64, win64, all (default: all)
#   -c, --canary          Use canary (beta) channel instead of stable
#   -h, --help            Show this help message

set -e  # Exit on any error

# Default options
ARCH="all"
CANARY=false
HELP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--arch)
            ARCH="$2"
            shift 2
            ;;
        -c|--canary)
            CANARY=true
            shift
            ;;
        -h|--help)
            HELP=true
            shift
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

if [[ "$HELP" == "true" ]]; then
    cat << 'EOF'
Enhanced Postman CLI Build Script

Usage: ./build-binary.sh [options]

Options:
  -a, --arch <arch>     Target architecture: linux64, osx_64, osx_arm64, win64, all (default: all)
  -c, --canary          Use canary (beta) channel instead of stable
  -h, --help            Show this help message

Examples:
  ./build-binary.sh                          # Build all architectures (stable)
  ./build-binary.sh -a osx_arm64             # Build macOS ARM64 only (stable)
  ./build-binary.sh -a win64                 # Build Windows x64 only (stable)
  ./build-binary.sh -c                       # Build all architectures (canary)
  ./build-binary.sh -a linux64 -c            # Build Linux x64 (canary)
EOF
    exit 0
fi

echo "Building Enhanced Postman CLI with Governance Reporting..."
echo

# Paths
CLI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$CLI_DIR/dist"
TEMP_DIR="$CLI_DIR/temp"
EMBEDDED_DIR="$CLI_DIR/embedded"
SCRIPTS_DIR="$CLI_DIR/scripts"

# Create directories
mkdir -p "$DIST_DIR" "$TEMP_DIR" "$EMBEDDED_DIR"

# Architecture mapping functions
get_rust_target() {
    case "$1" in
        linux64) echo "x86_64-unknown-linux-musl" ;;
        osx_64) echo "x86_64-apple-darwin" ;;
        osx_arm64) echo "aarch64-apple-darwin" ;;
        win64) echo "x86_64-pc-windows-gnu" ;;
        *) echo "" ;;
    esac
}

get_download_url() {
    case "$1" in
        linux64) echo "linux64" ;;
        osx_64) echo "osx_64" ;;
        osx_arm64) echo "osx_arm64" ;;
        win64) echo "win64" ;;
        *) echo "" ;;
    esac
}

# Configuration
CHANNEL=$([ "$CANARY" == "true" ] && echo "canary" || echo "stable")
CHANNEL_PARAM=$([ "$CANARY" == "true" ] && echo "?channel=canary" || echo "")

echo "Build Configuration:"
echo "   CLI Directory: $CLI_DIR"
echo "   Scripts Directory: $SCRIPTS_DIR"
echo "   Embedded Directory: $EMBEDDED_DIR"
echo "   Output Directory: $DIST_DIR"
echo "   Channel: $CHANNEL"
echo "   Architecture: $ARCH"
echo

# Check required files
REQUIRED_FILES=(
    "$SCRIPTS_DIR/unified.js"
    "$SCRIPTS_DIR/cli-wrapper.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "ERROR: Required file not found: $file" >&2
        exit 1
    fi
done

# Function to download and extract Postman CLI
download_and_extract() {
    local url="$1"
    local arch_temp_dir="$2"

    echo "   Downloading: $url"
    local temp_file="$arch_temp_dir/postman-cli.tmp"

    if ! curl -L "$url" -o "$temp_file"; then
        echo "ERROR: Failed to download $url" >&2
        return 1
    fi

    echo "   Downloaded: $(basename "$temp_file") ($(stat -f%z "$temp_file" 2>/dev/null || stat -c%s "$temp_file") bytes)"

    local target_binary="$arch_temp_dir/postman-original"
    local file_type
    file_type=$(file "$temp_file")

    case "$file_type" in
        *gzip*)
            echo "   Extracting gzipped binary..."
            gunzip -c "$temp_file" > "$target_binary"
            ;;
        *Zip*)
            echo "   Extracting ZIP archive..."
            unzip -o "$temp_file" -d "$arch_temp_dir"
            # Find the extracted binary (usually called postman-cli or postman-cli.exe for Windows)
            if [[ -f "$arch_temp_dir/postman-cli" ]]; then
                mv "$arch_temp_dir/postman-cli" "$target_binary"
            elif [[ -f "$arch_temp_dir/postman-cli.exe" ]]; then
                mv "$arch_temp_dir/postman-cli.exe" "$target_binary"
            else
                echo "ERROR: postman-cli binary not found in ZIP archive" >&2
                return 1
            fi
            ;;
        *)
            echo "   Binary already uncompressed, copying..."
            cp "$temp_file" "$target_binary"
            ;;
    esac

    if [[ -f "$target_binary" ]]; then
        chmod 755 "$target_binary"
        echo "   Ready: postman-cli binary"
        rm -f "$temp_file"
        return 0
    else
        echo "ERROR: Failed to prepare postman-cli binary" >&2
        return 1
    fi
}

# Main build function
main() {
    # Determine target architectures
    if [[ "$ARCH" == "all" ]]; then
        TARGET_ARCHS=(linux64 osx_64 osx_arm64 win64)
    else
        TARGET_ARCHS=("$ARCH")
    fi

    echo
    echo "Building for architectures: ${TARGET_ARCHS[*]}"
    echo

    # Build for each architecture
    for arch in "${TARGET_ARCHS[@]}"; do
        local rust_target
        rust_target=$(get_rust_target "$arch")
        if [[ -z "$rust_target" ]]; then
            echo "ERROR: Unknown architecture: $arch" >&2
            continue
        fi

        local url_suffix
        url_suffix=$(get_download_url "$arch")
        local download_url="https://dl-cli.pstmn.io/download/latest/${url_suffix}${CHANNEL_PARAM}"

        # Create architecture-specific temp directory
        local arch_temp_dir="$TEMP_DIR/$arch"
        mkdir -p "$arch_temp_dir"

        echo "Building for $arch ($CHANNEL)..."

        # Download and extract original binary
        if ! download_and_extract "$download_url" "$arch_temp_dir"; then
            echo "ERROR: Failed to download/extract for $arch" >&2
            continue
        fi

        # Copy original binary to embedded directory
        cp "$arch_temp_dir/postman-original" "$EMBEDDED_DIR/postman-cli"

        # Copy JS files to embedded directory
        cp "$SCRIPTS_DIR/unified.js" "$EMBEDDED_DIR/"
        cp "$SCRIPTS_DIR/cli-wrapper.js" "$EMBEDDED_DIR/"

        echo "   Embedded JS files and binary for $arch"

        # Build Rust binary
        local output_name="pm-clx-${arch}$([ "$CANARY" == "true" ] && echo "-canary" || echo "")"
        # Add .exe extension for Windows
        if [[ "$arch" == "win64" ]]; then
            output_name="${output_name}.exe"
        fi
        local output_path="$DIST_DIR/$output_name"

        echo "   Compiling Rust binary for $rust_target..."

        # Add Rust target
        echo "   Installing Rust target $rust_target..."
        if ! rustup target add "$rust_target" 2>/dev/null; then
            echo "   Warning: Could not install target $rust_target"
        fi

        # Build with Rust
        echo "   Running: cargo build --release --target $rust_target --bin postman-clx"
        if cargo build --release --target "$rust_target" --bin postman-clx; then
            # Copy the built binary to dist
            local built_binary_name="postman-clx"
            if [[ "$arch" == "win64" ]]; then
                built_binary_name="${built_binary_name}.exe"
            fi
            local built_binary_path="$CLI_DIR/target/$rust_target/release/$built_binary_name"
            if [[ -f "$built_binary_path" ]]; then
                cp "$built_binary_path" "$output_path"
                chmod 755 "$output_path"
                echo "   Built: $output_name"
            else
                echo "   Failed: Binary not found at $built_binary_path" >&2
            fi
        else
            echo "   Failed to build $arch" >&2
        fi
    done

    # Create README
    local readme="$DIST_DIR/README.md"
    cat > "$readme" << EOF
# Enhanced Postman CLI with Governance Reporting

Built on: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Channel: $CHANNEL
Architectures: ${TARGET_ARCHS[*]}

## Usage

These binaries include the full Postman CLI functionality plus enhanced governance
reporting when using lint commands with the \`-r\` flag.

### Examples

\`\`\`bash
# Enhanced governance reporting (shows detailed analysis + generates reports)
./pm-clx-osx_arm64 api lint specs/my-api.json -r
./pm-clx-linux64 api lint -d specs -r

# Standard Postman CLI functionality (unchanged)
./pm-clx-osx_arm64 collection run my-collection
./pm-clx-linux64 api lint specs/my-api.json
\`\`\`

## Files

EOF

    # Add file list
    for file in "$DIST_DIR"/pm-clx-*; do
        if [[ -f "$file" && ! "$file" =~ \.md$ ]]; then
            echo "- \`$(basename "$file")\` - Enhanced CLI" >> "$readme"
        fi
    done

    cat >> "$readme" << 'EOF'

## Architecture Guide

- `pm-clx-linux64` - Linux x86_64
- `pm-clx-osx_64` - macOS Intel
- `pm-clx-osx_arm64` - macOS Apple Silicon (M1/M2)
- `pm-clx-win64` - Windows x86_64

Add `-canary` suffix for beta channel builds.
EOF

    # Clean up build artifacts
    rm -rf "$TEMP_DIR"
    rm -rf "$EMBEDDED_DIR"

    echo
    echo "Build completed successfully!"
    echo
    echo "Distribution files:"
    for file in "$DIST_DIR"/*; do
        if [[ -f "$file" ]]; then
            local size
            size=$(du -h "$file" | cut -f1)
            echo "   $(basename "$file") ($size)"
        fi
    done

    echo
    echo "Usage examples:"
    local first_binary
    first_binary=$(find "$DIST_DIR" -name "pm-clx-*" -not -name "*.md" | head -n1)
    if [[ -n "$first_binary" ]]; then
        echo "   ./$(basename "$first_binary") api lint -d ../specs -r"
    fi
}

# Run main function
main "$@"
