#!/bin/bash

set -o errexit
set -o nounset

# Default verbosity (false = quiet, true = verbose)
VERBOSE=false
SYSTEM_ERROR=""

# Configuration
REPO="postman-cs/postman-clx"

# Function to print output
print_info() {
    if [ "$VERBOSE" = true ]; then
        printf "[INFO] %s\n" "$1" >&2
    fi
}

print_warning() {
    if [ "$VERBOSE" = true ]; then
        printf "[WARNING] %s\n" "$1" >&2
    fi
}

print_error() {
    printf "[ERROR] %s\n" "$1" >&2
}

print_success() {
    printf "%s\n" "$1" >&2
}

# Function to handle crashes
report_crash() {
    local error_message="$1"

    SYSTEM_ERROR="true"
    print_error "The Enhanced Postman CLI (pm-clx) couldn't be installed. $error_message"
    exit 1
}

# Function to parse command line arguments
parse_args() {
    while [ $# -gt 0 ]; do
        case $1 in
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                report_crash "Unknown option: $1"
                ;;
        esac
    done
}

# Function to show help
show_help() {
    cat << EOF
Enhanced Postman CLI (pm-clx) Unix Installer

USAGE:
    $0 [OPTIONS]

OPTIONS:
    -v, --verbose    Show detailed installation progress
    -h, --help       Show this help message

DESCRIPTION:
    This installer supports Linux (x64) and macOS systems.
    Installs the enhanced Postman CLI with governance reporting capabilities.
    For Windows installation, use install.ps1

EOF
}

# Function to detect OS and architecture
detect_platform() {
    local os_type=""
    local arch_type=""

    # Detect OS
    case "$(uname -s)" in
        Linux*)     os_type="linux" ;;
        Darwin*)    os_type="macos" ;;
        *)
            report_crash "Unsupported operating system: $(uname -s)"
            ;;
    esac

    # Detect architecture
    case "$(uname -m)" in
        x86_64|amd64)
            arch_type="amd64"
            ;;
        arm64|aarch64)
            if [ "$os_type" = "linux" ]; then
                report_crash "Only x64 is supported for Linux at this time"
            else
                arch_type="arm64"
            fi
            ;;
        *)
            if [ "$os_type" = "linux" ]; then
                report_crash "Only x64 is supported for Linux at this time"
            else
                report_crash "Unsupported architecture: $(uname -m)"
            fi
            ;;
    esac

    # Log individual components
    print_info "Detected OS: $os_type"
    print_info "Detected architecture: $arch_type"

    echo "${os_type}_${arch_type}"
}

# Function to get binary name based on platform
get_binary_name() {
    local platform="$1"
    case "$platform" in
        linux_amd64)    echo "pm-clx-linux64" ;;
        macos_amd64)    echo "pm-clx-osx_64" ;;
        macos_arm64)    echo "pm-clx-osx_arm64" ;;
        *)
            report_crash "Unsupported platform: $platform"
            ;;
    esac
}

# Function to get latest release version
get_latest_version() {
    print_info "Fetching latest release information..."

    if command -v curl >/dev/null 2>&1; then
        local latest_url="https://api.github.com/repos/$REPO/releases/latest"
        local version=$(curl --silent --fail --location --retry 3 "$latest_url" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' 2>/dev/null || echo "")

        if [ -z "$version" ]; then
            report_crash "Failed to fetch latest version from GitHub"
        fi

        echo "$version"
    else
        report_crash "curl is required but not installed"
    fi
}

# Function to install on Unix-like systems (Linux/macOS)
install_unix() {
    local platform="$1"
    local binary_name="$2"
    local version="$3"

    print_info "Installing Enhanced Postman CLI (pm-clx) for $platform..."

    # Set installation prefix
    local prefix="/usr/local"

    # Create temporary directory
    local tmp_dir
    tmp_dir="$(mktemp -d)"
    cleanup() {
        if [ -n "${tmp_dir:-}" ] && [ -d "$tmp_dir" ]; then
            rm -rf "$tmp_dir"
        fi
    }
    trap cleanup EXIT

    # Build download URL
    local url="https://github.com/$REPO/releases/download/$version/$binary_name"
    print_info "Downloading from $url..."

    # Download the binary
    local binary_file="$tmp_dir/$binary_name"

    # Try curl first, then wget
    if command -v curl >/dev/null 2>&1; then
        # Always show download progress
        curl --location --retry 10 --output "$binary_file" "$url" || report_crash "Failed to download pm-clx binary"
    elif command -v wget >/dev/null 2>&1; then
        # Always show download progress
        wget --output-document "$binary_file" "$url" || report_crash "Failed to download pm-clx binary"
    else
        report_crash "You need either cURL or wget installed on your system"
    fi

    # Verify download
    if [ ! -f "$binary_file" ] || [ ! -s "$binary_file" ]; then
        report_crash "Downloaded file is empty or missing"
    fi

    # Check if we need sudo
    local run_cmd="sudo"
    if test -d "$prefix/bin" && test -w "$prefix/bin"; then
        run_cmd="eval"
    elif test -d "$prefix" && test -w "$prefix"; then
        run_cmd="eval"
    fi

    if [ "$run_cmd" = "sudo" ] && ! command -v sudo >/dev/null 2>&1; then
        report_crash "You do not have enough permissions to write to $prefix and sudo is not available"
    fi

    print_info "Installing to $prefix/bin/postman-clx..."

    # Create directory and install binary
    if [ "$run_cmd" = "sudo" ]; then
        # Combine both operations in single sudo call to avoid multiple password prompts
        if [ "$VERBOSE" = false ]; then
            "$run_cmd" sh -c "install -d \"$prefix/bin\" && install -m 0755 \"$binary_file\" \"$prefix/bin/postman-clx\"" 2>/dev/null || report_crash "Failed to install pm-clx to $prefix/bin"
        else
            "$run_cmd" sh -c "install -d \"$prefix/bin\" && install -m 0755 \"$binary_file\" \"$prefix/bin/postman-clx\"" || report_crash "Failed to install pm-clx to $prefix/bin"
        fi
    else
        # No sudo needed
        if [ "$VERBOSE" = false ]; then
            "$run_cmd" install -d "$prefix/bin" 2>/dev/null || report_crash "Failed to create $prefix/bin directory"
            "$run_cmd" install -m 0755 "$binary_file" "$prefix/bin/postman-clx" 2>/dev/null || report_crash "Failed to install pm-clx to $prefix/bin"
        else
            "$run_cmd" install -d "$prefix/bin" || report_crash "Failed to create $prefix/bin directory"
            "$run_cmd" install -m 0755 "$binary_file" "$prefix/bin/postman-clx" || report_crash "Failed to install pm-clx to $prefix/bin"
        fi
    fi

    print_info "The Enhanced Postman CLI (pm-clx) has been installed successfully!"
    print_info "You can now use the 'postman-clx' command."

    # Try to get and display the version
    local version_output=""
    if command -v postman-clx >/dev/null 2>&1; then
        version_output=$(postman-clx --version 2>/dev/null || echo "")
    elif [ -x "$prefix/bin/postman-clx" ]; then
        version_output=$("$prefix/bin/postman-clx" --version 2>/dev/null || echo "")
    fi

    if [ -n "$version_output" ]; then
        print_info "Installed version: $version_output"
    fi

    # Clear the trap and cleanup manually before function exits
    trap - EXIT
    cleanup
}

# Main installation function
main() {
    # Parse command line arguments
    parse_args "$@"

    # Detect platform
    local platform
    platform=$(detect_platform)
    print_info "Detected platform: $platform"

    # Get binary name for platform
    local binary_name
    binary_name=$(get_binary_name "$platform")

    # Get latest version
    local version
    version=$(get_latest_version)
    print_info "Latest version: $version"

    # Install binary
    install_unix "$platform" "$binary_name" "$version"

    # Always show success message if no system error occurred
    if [ -z "$SYSTEM_ERROR" ]; then
        # Get version for final success message
        local version_output=""
        if command -v postman-clx >/dev/null 2>&1; then
            version_output=$(postman-clx --version 2>/dev/null || echo "")
        fi

        if [ -n "$version_output" ]; then
            print_success "The Enhanced Postman CLI (pm-clx) $version_output has been installed successfully"
        else
            print_success "The Enhanced Postman CLI (pm-clx) has been installed successfully"
        fi

        print_info "Usage examples:"
        print_info "  postman-clx api lint ./spec.yaml -r json"
        print_info "  postman-clx api lint -d ./specs -r html"
        print_info "  postman-clx collection run collection-id"
    fi
}

# Run main function
main "$@"