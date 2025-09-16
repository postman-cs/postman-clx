# Enhanced Postman CLI with Governance Reporting

Drop-in replacement for the Postman CLI that adds comprehensive API governance analysis. Get JSON reports for CI/CD automation or interactive HTML dashboards for team reviews. Works on full workspaces (via id) or individual specs (via id) for both Spec Hub and API Builder; also works on local directories and spec files.

## Quick Start

```bash
# Install (Unix/Linux/macOS)
curl -sSL https://raw.githubusercontent.com/postman-cs/postman-clx/master/install.sh | bash

# Install (Windows PowerShell)
iwr -useb https://raw.githubusercontent.com/postman-cs/postman-clx/master/install.ps1 | iex

# Analyze API specs in a directory
postman-clx api lint -d ./specs -r html

# Get JSON report for CI/CD pipeline
postman-clx api lint ./my-api.yaml -r json
```

## What This Solves

API governance at scale requires consistent analysis across teams, repositories, and deployment pipelines. The standard Postman CLI provides excellent linting, but customers typically build custom scripts for reporting. So -- why not just build it into the CLI itself?

This enhanced CLI bridges that gap by adding detailed governance reporting while maintaining complete compatibility with existing Postman CLI workflows.

## Core Capabilities

**Governance Reporting**: Add `-r json` or `-r html` to any lint command to generate detailed governance analysis beyond standard CLI output.

**Full Compatibility**: Every existing Postman CLI command works unchanged. This is a true drop-in replacement that adds functionality without breaking existing scripts or workflows.

**Cross-Platform**: Native binaries for Linux, macOS (Intel/ARM), and Windows. No dependencies, runtime requirements, or container orchestration needed.

## Usage Examples

### Directory Analysis
```bash
# Analyze all API specs in a directory
postman-clx api lint -d ./api-specs -r html

# Get machine-readable output for CI/CD
postman-clx api lint -d ./specs -r json
```

### Single File Analysis
```bash
# Interactive dashboard for manual review
postman-clx api lint ./petstore-api.yaml -r html

# JSON output for automated processing
postman-clx api lint ./user-service.json -r json
```

### Workspace Integration
```bash
# Analyze all APIs in a Postman workspace
postman-clx api lint -w workspace-id -r json

# Generate reports for specific specs
postman-clx spec lint spec-id -r html
```

### CI/CD Integration
```bash
# GitHub Actions / GitLab CI example
postman-clx api lint -d ./api-specs -r json
if [ $? -ne 0 ]; then
  echo "API governance check failed"
  exit 1
fi
```

## Report Formats

### JSON Reports
Machine-readable governance data perfect for automation, CI/CD pipelines, and programmatic analysis. Contains detailed issue breakdowns, scoring metrics, and metadata for integration with your tool of choice.

**File Output**: `governance-report-[timestamp].json`

**Use Cases**:
- CI/CD pipeline integration
- Automated quality gates
- Metrics collection and trending
- Integration with monitoring systems

### HTML Dashboards
Interactive web-based dashboards with filtering, search, and visual analysis capabilities. Designed for manual review, team collaboration, and executive reporting.

**File Output**: `governance-report-[timestamp].html`

**Features**:
- Interactive issue filtering by severity
- Per-API drill-down analysis
- Visual scoring and trend indicators
- Shareable reports for team reviews

## Standard CLI Functionality

All standard Postman CLI commands work exactly as documented:

```bash
# Collection runs
postman-clx collection run collection-id

# Standard linting (without governance reports)
postman-clx api lint ./spec.yaml
postman-clx spec lint spec-id
```

The `-r` flag only affects lint commands. Everything else operates as standard Postman CLI.

## Installation and Distribution

### Automated Installation

**Unix/Linux/macOS:**
```bash
curl -sSL https://raw.githubusercontent.com/postman-cs/postman-clx/master/install.sh | bash
```

**Windows PowerShell:**
```powershell
iwr -useb https://raw.githubusercontent.com/postman-cs/postman-clx/master/install.ps1 | iex
```

Installation scripts automatically detect platform, download the appropriate compressed binary, extract it, and install to system PATH as `postman-clx`.

### Manual Download

Pre-built binaries are available as [GitHub releases](https://github.com/postman-cs/postman-clx/releases):

**Stable Channel:**
- **pm-clx-linux64.tar.gz** - Linux x86_64 (~32MB)
- **pm-clx-osx_64.zip** - macOS Intel (~30MB)
- **pm-clx-osx_arm64.zip** - macOS Apple Silicon (~28MB)
- **pm-clx-win64.zip** - Windows x86_64 (~27MB)

**Canary Channel:**
- **pm-clx-linux64-canary.tar.gz** - Beta features (~32MB)
- **pm-clx-osx_64-canary.zip** - Beta features (~30MB)
- **pm-clx-osx_arm64-canary.zip** - Beta features (~29MB)
- **pm-clx-win64-canary.zip** - Beta features (~27MB)

Extract and place the binary in your PATH as `postman-clx`.

## Development Setup

### Prerequisites
- Rust toolchain (for building enhanced wrapper)
- Postman API key (for workspace operations)

### Build Process
```bash
# Build all architectures (stable channel)
./build-binary.sh

# Build specific architecture
./build-binary.sh --arch osx_arm64

# Build canary channel versions
./build-binary.sh --canary
```

### Architecture Overview
The enhanced CLI consists of three components:

1. **Rust Wrapper**: Cross-platform binary that embeds the original Postman CLI and governance scripts
2. **CLI Wrapper**: JavaScript layer that intercepts lint commands and manages governance reporting
3. **Governance Analysis**: Unified reporting engine that generates JSON and HTML outputs

## Technical Implementation

### Command Interception
The wrapper detects lint commands with `-r` flags and executes both the original Postman CLI operation and governance analysis. Standard commands pass through unchanged.

### Report Generation
Governance analysis uses the Postman CLI's structured output to generate reports with scoring, issue categorization, and actionable recommendations.

### Output Management
Reports are generated in the working directory with timestamped filenames. The wrapper ensures clean separation between CLI output and governance reports.

## Integration Patterns

### CI/CD Pipelines
```yaml
# Example GitHub Actions workflow
- name: Install Enhanced Postman CLI
  run: curl -sSL https://raw.githubusercontent.com/postman-cs/postman-clx/master/install.sh | bash

- name: API Governance Check
  run: |
    postman-clx api lint -d ./specs -r json
    # Process governance-report-*.json for quality gates
```

### Team Workflows
```bash
# Development workflow
postman-clx api lint -d ./specs -r html
# Review governance-report-*.html in browser
# Share report with team
```

### Automation Scripts
```bash
# Automated analysis with custom processing -- pipe it into Datadog or other tools
REPORT_FILE=$(postman-clx api lint ./spec.yaml -r json | grep "JSON report saved" | awk '{print $5}')
jq '.aggregatedStats.error' "$REPORT_FILE"
```

## Support and Development

This project extends the official Postman CLI with governance capabilities while maintaining full compatibility. For standard CLI issues, consult Postman's official documentation. For governance-specific functionality, refer to the examples and patterns documented here.
