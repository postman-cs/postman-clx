#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Postman CLI Governance Wrapper
 *
 * Transparent wrapper that adds governance reporting to lint commands with -r json|html flag.
 * All output remains exactly the same as original CLI, plus governance reports.
 */

class PostmanGovernanceWrapper {
    constructor() {
        // When packaged with pkg, __dirname changes, so we need to find the actual paths
        const isPackaged = process.pkg !== undefined;
        
        this.isPackaged = isPackaged;
        this.tempBinaryPath = null;
        
        if (isPackaged) {
            // When packaged, we need to extract the embedded binary to temp location
            // The original binary is embedded as an asset
            this.embeddedBinaryPath = path.join(__dirname, 'postman-original');
            // Use unified.js for all governance functionality
            this.unifiedScript = path.join(__dirname, 'unified.js');
        } else {
            // Development mode - use relative paths
            this.postmanCliPath = path.join(__dirname, 'cli', 'postman');
            // Use unified.js for all governance functionality
            this.unifiedScript = path.join(__dirname, 'unified.js');
        }
    }

    /**
     * Extract the embedded binary to a temporary location for execution
     */
    extractEmbeddedBinary() {
        if (!this.isPackaged) {
            return this.postmanCliPath;
        }

        if (this.tempBinaryPath && fs.existsSync(this.tempBinaryPath)) {
            return this.tempBinaryPath;
        }

        const os = require('os');
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'postman-'));
        this.tempBinaryPath = path.join(tempDir, 'postman-original');
        
        try {
            // Copy the embedded binary to temp location
            fs.copyFileSync(this.embeddedBinaryPath, this.tempBinaryPath);
            fs.chmodSync(this.tempBinaryPath, '755');
            
            // Clean up on process exit
            process.on('exit', () => this.cleanup());
            process.on('SIGINT', () => {
                this.cleanup();
                process.exit(1);
            });
            process.on('SIGTERM', () => {
                this.cleanup();
                process.exit(1);
            });
            
            return this.tempBinaryPath;
        } catch (error) {
            throw new Error(`Failed to extract embedded binary: ${error.message}`);
        }
    }

    /**
     * Clean up temporary files
     */
    cleanup() {
        if (this.tempBinaryPath && fs.existsSync(this.tempBinaryPath)) {
            try {
                fs.unlinkSync(this.tempBinaryPath);
                const tempDir = path.dirname(this.tempBinaryPath);
                fs.rmdirSync(tempDir);
            } catch (error) {
                // Ignore cleanup errors
            }
        }
    }

    /**
     * Check if this is a lint command with -r json|html flag that should trigger governance reporting
     */
    shouldAddGovernanceReporting(args) {
        const isApiLint = args.includes('api') && args.includes('lint');
        const isSpecLint = args.includes('spec') && args.includes('lint');
        const rIndex = args.indexOf('-r');
        const hasValidReporting = rIndex !== -1 && rIndex + 1 < args.length &&
            (args[rIndex + 1] === 'json' || args[rIndex + 1] === 'html');

        return (isApiLint || isSpecLint) && hasValidReporting;
    }

    /**
     * Check if this is a directory operation with -r format that should only run governance (not postman CLI)
     */
    isDirectoryOperation(args) {
        const isApiLint = args.includes('api') && args.includes('lint');
        const hasDirectory = args.includes('-d');
        const rIndex = args.indexOf('-r');
        const hasValidReporting = rIndex !== -1 && rIndex + 1 < args.length &&
            (args[rIndex + 1] === 'json' || args[rIndex + 1] === 'html');

        return isApiLint && hasDirectory && hasValidReporting;
    }

    /**
     * Determine which governance script to run based on the command
     */
    getGovernanceCommand(args) {
        const isSpecLint = args.includes('spec') && args.includes('lint');
        const hasWorkspace = args.includes('-w');
        const hasDirectory = args.includes('-d');

        // Extract report format from -r flag
        const rIndex = args.indexOf('-r');
        const reportFormat = rIndex !== -1 && rIndex + 1 < args.length ? args[rIndex + 1] : null;

        if (!reportFormat || (reportFormat !== 'json' && reportFormat !== 'html')) {
            return null;
        }

        // Use unified.js for all governance operations
        if (isSpecLint) {
            if (hasWorkspace) {
                const workspaceIndex = args.indexOf('-w') + 1;
                const workspace = args[workspaceIndex];
                return {
                    script: this.unifiedScript,
                    args: ['--type', 'spec', '--workspace', workspace, '-r', reportFormat]
                };
            } else {
                // spec lint only works with spec IDs, not local files
                const specId = args.find(arg => !arg.startsWith('-') &&
                    arg !== 'spec' && arg !== 'lint' && arg !== reportFormat);
                if (specId) {
                    return {
                        script: this.unifiedScript,
                        args: ['--type', 'spec', '--spec', specId, '-r', reportFormat]
                    };
                } else {
                    return {
                        script: this.unifiedScript,
                        args: ['--type', 'spec', '-r', reportFormat]
                    };
                }
            }
        } else {
            if (hasWorkspace) {
                const workspaceIndex = args.indexOf('-w') + 1;
                const workspace = args[workspaceIndex];
                return {
                    script: this.unifiedScript,
                    args: ['--type', 'api', '--workspace', workspace, '-r', reportFormat]
                };
            } else if (hasDirectory) {
                const dirIndex = args.indexOf('-d') + 1;
                const directory = args[dirIndex];
                // Resolve to absolute path to ensure unified.js can find the directory
                const userWorkingDir = process.env.USER_WORKING_DIR || process.cwd();
                const absoluteDir = path.resolve(userWorkingDir, directory);
                return {
                    script: this.unifiedScript,
                    args: ['--type', 'local', '--dir', absoluteDir, '-r', reportFormat]
                };
            } else {
                const apiTarget = args.find(arg => !arg.startsWith('-') &&
                    arg !== 'api' && arg !== 'lint' && arg !== reportFormat);
                if (apiTarget) {
                    // Resolve to absolute path to ensure unified.js can find the file
                    const userWorkingDir = process.env.USER_WORKING_DIR || process.cwd();
                    const absolutePath = path.resolve(userWorkingDir, apiTarget);
                    return {
                        script: this.unifiedScript,
                        args: ['--type', 'local', '--api', absolutePath, '-r', reportFormat]
                    };
                } else {
                    return {
                        script: this.unifiedScript,
                        args: ['--type', 'local', '-r', reportFormat]
                    };
                }
            }
        }
    }

    /**
     * Execute the original Postman CLI command (strips -r flag and format since it's not supported)
     */
    async executePostmanCli(args) {
        const filteredArgs = [];
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-r' && i + 1 < args.length &&
                (args[i + 1] === 'json' || args[i + 1] === 'html')) {
                // Skip both -r and the format
                i++; // Skip the format argument too
            } else {
                let arg = args[i];
                // Resolve file paths to absolute paths for the original CLI
                if (!arg.startsWith('-') && arg !== 'api' && arg !== 'spec' && arg !== 'lint' &&
                    (arg.includes('/') || arg.includes('\\') || arg.includes('.'))) {
                    // This looks like a file path, resolve it to absolute using user's working directory
                    const userWorkingDir = process.env.USER_WORKING_DIR || process.cwd();
                    arg = path.resolve(userWorkingDir, arg);
                }
                filteredArgs.push(arg);
            }
        }
        const binaryPath = this.extractEmbeddedBinary();
        return new Promise((resolve, reject) => {
            const child = spawn(binaryPath, filteredArgs, {
                stdio: 'inherit',
                env: process.env
            });

            child.on('close', (code) => {
                resolve(code);
            });

            child.on('error', (error) => {
                reject(new Error(`Failed to start Postman CLI: ${error.message}`));
            });
        });
    }

    /**
     * Execute governance reporting script (packaged or development mode)
     */
    async executeGovernanceScript(scriptPath, args, userWorkingDir) {
        if (!scriptPath) {
            return;
        }

        if (this.isPackaged) {
            // In packaged mode, require the script and call its main function
            // Note: embedded scripts don't need fs.existsSync check
            try {
                const originalArgv = process.argv;
                const originalEnv = process.env.USER_WORKING_DIR;

                process.argv = ['node', scriptPath, ...args];
                process.env.USER_WORKING_DIR = userWorkingDir;

                // Clear module cache to ensure fresh execution
                delete require.cache[require.resolve(scriptPath)];

                // Require and execute the script
                const script = require(scriptPath);

                // Call the main function if it exists
                if (typeof script.main === 'function') {
                    await script.main();
                }

                // Restore original argv and env
                process.argv = originalArgv;
                if (originalEnv !== undefined) {
                    process.env.USER_WORKING_DIR = originalEnv;
                } else {
                    delete process.env.USER_WORKING_DIR;
                }

                return 0;
            } catch (error) {
                return 1;
            }
        } else {
            // Development mode - use spawn as before
            return new Promise((resolve) => {
                const envWithWorkingDir = { ...process.env, USER_WORKING_DIR: userWorkingDir };
                const child = spawn('node', [scriptPath, ...args], {
                    stdio: 'pipe', // Silent execution
                    env: envWithWorkingDir
                });

                child.on('close', (code) => {
                    resolve(code);
                });

                child.on('error', (error) => {
                    resolve(1);
                });
            });
        }
    }

    /**
     * Execute governance script for directory operations (with output)
     */
    async executeGovernanceScriptWithOutput(scriptPath, args, userWorkingDir) {
        if (!scriptPath) {
            return 1;
        }

        if (this.isPackaged) {
            // In packaged mode, require the script and call its main function
            // Note: embedded scripts don't need fs.existsSync check
            try {
                const originalArgv = process.argv;
                const originalEnv = process.env.USER_WORKING_DIR;

                process.argv = ['node', scriptPath, ...args];
                process.env.USER_WORKING_DIR = userWorkingDir;

                // Clear module cache to ensure fresh execution
                delete require.cache[require.resolve(scriptPath)];

                // Require and execute the script
                const script = require(scriptPath);

                // Call the main function if it exists
                if (typeof script.main === 'function') {
                    await script.main();
                }

                // Restore original argv and env
                process.argv = originalArgv;
                if (originalEnv !== undefined) {
                    process.env.USER_WORKING_DIR = originalEnv;
                } else {
                    delete process.env.USER_WORKING_DIR;
                }

                return 0;
            } catch (error) {
                console.error(`Error executing governance script: ${error.message}`);
                return 1;
            }
        } else {
            // Development mode - use spawn with inherited stdio
            return new Promise((resolve, reject) => {
                const envWithWorkingDir = { ...process.env, USER_WORKING_DIR: userWorkingDir };
                const child = spawn('node', [scriptPath, ...args], {
                    stdio: 'inherit',
                    env: envWithWorkingDir
                });

                child.on('close', (code) => {
                    resolve(code);
                });

                child.on('error', (error) => {
                    reject(error);
                });
            });
        }
    }

    /**
     * Main execution flow
     */
    async run() {
        try {
            const args = process.argv.slice(2);
            const userWorkingDir = process.env.USER_WORKING_DIR || process.cwd(); // Use environment variable from Rust binary

            // Show help if requested
            if (args.includes('--help') || args.includes('-h')) {
                // Check if this is a specific lint command help
                if (this.isLintCommandHelp(args)) {
                    await this.showLintHelp(args);
                } else {
                    await this.showHelp();
                }
                return;
            }

            // Check if this is a directory operation (which postman CLI doesn't support)
            if (this.isDirectoryOperation(args)) {
                const governanceCommand = this.getGovernanceCommand(args);
                if (governanceCommand) {
                    try {
                        const code = await this.executeGovernanceScriptWithOutput(
                            governanceCommand.script,
                            governanceCommand.args,
                            userWorkingDir
                        );
                        process.exit(code);
                    } catch (error) {
                        console.error(`Error: ${error.message}`);
                        process.exit(1);
                    }
                }
                return;
            }

            // Check if this is a lint command with -r flag
            const shouldAddGovernance = this.shouldAddGovernanceReporting(args);
            if (!shouldAddGovernance) {
                // Just pass through to postman CLI
                await this.executePostmanCli(args);
                return;
            }

            // Execute the original Postman CLI command first
            const cliResult = await this.executePostmanCli(args);

            // If the CLI command succeeded, add governance reporting silently
            if (cliResult === 0) {
                const governanceCommand = this.getGovernanceCommand(args);
                if (governanceCommand) {
                    await this.executeGovernanceScript(governanceCommand.script, governanceCommand.args, userWorkingDir);
                }
            }

        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * Check if this is a lint command help request
     */
    isLintCommandHelp(args) {
        const hasHelp = args.includes('--help') || args.includes('-h');
        const isApiLint = args.includes('api') && args.includes('lint');
        const isSpecLint = args.includes('spec') && args.includes('lint');

        return hasHelp && (isApiLint || isSpecLint);
    }

    /**
     * Show lint command help with governance extensions
     */
    async showLintHelp(args) {
        try {
            // First show the standard lint command help
            const binaryPath = this.extractEmbeddedBinary();

            // Filter out -r and its format value if present
            const filteredArgs = [];
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '-r' && i + 1 < args.length &&
                    (args[i + 1] === 'json' || args[i + 1] === 'html')) {
                    // Skip both -r and the format
                    i++; // Skip the format argument too
                } else {
                    filteredArgs.push(args[i]);
                }
            }

            await new Promise((resolve) => {
                const child = spawn(binaryPath, filteredArgs, {
                    stdio: 'inherit',
                    env: process.env
                });

                child.on('close', (code) => {
                    resolve(code);
                });

                child.on('error', () => {
                    console.error('Standard Postman CLI help not available');
                    resolve(1);
                });
            });

            // Then append the governance reporting option in the same style as original
            const extendedOptions = `  -r, --report <format>           Generate governance report. [choices: "json", "html"]`;

            console.log(extendedOptions);
        } catch (error) {
            // Fallback to just showing that -r option exists
            console.log('\nExtended Options:');
            console.log('  -r, --report <format>           Generate governance report. [choices: "json", "html"]');
        }
    }

    /**
     * Show help information
     */
    async showHelp() {
        try {
            // First show the standard Postman CLI help
            const binaryPath = this.extractEmbeddedBinary();

            await new Promise((resolve) => {
                const child = spawn(binaryPath, ['--help'], {
                    stdio: 'inherit',
                    env: process.env
                });

                child.on('close', (code) => {
                    resolve(code);
                });

                child.on('error', () => {
                    console.error('Standard Postman CLI help not available');
                    resolve(1);
                });
            });

            // Then append the governance reporting extensions
            const extendedHelp = `

EXTENDED GOVERNANCE REPORTING:
  lint <options> -r json     → Get JSON report for CI/CD pipelines and automation
  lint <options> -r html     → Get interactive dashboard for manual review and analysis

  # Lint all API specs in a directory
  postman-clx api lint -d ./specs -r html

  # Lint a specific API specification file
  postman-clx api lint ./specs/api.json -r json

  # Lint all APIs or specs in your Postman workspace
  postman-clx (api|spec) lint -w workspace-id -r (json|html)

  # Lint a specific API or spec in your Postman workspace
  postman-clx (api|spec) lint (api-id|spec-id) -r (json|html)
`;
            console.log(extendedHelp);
        } catch (error) {
            // Fallback to just showing extended help
            const fallbackHelp = `
Enhanced Postman CLI with Governance Reporting

EXTENDED GOVERNANCE REPORTING:
  lint <options> -r json     → Get JSON report for CI/CD pipelines and automation
  lint <options> -r html     → Get interactive dashboard for manual review and analysis

  # Lint all API specs in a directory
  postman-clx api lint -d ./specs -r html

  # Lint a specific API specification file
  postman-clx api lint ./specs/api.json -r json

  # Lint all APIs or specs in your Postman workspace
  postman-clx (api|spec) lint -w workspace-id -r (json|html)

  # Lint a specific API or spec in your Postman workspace
  postman-clx (api|spec) lint (api-id|spec-id) -r (json|html)
`;
            console.log(fallbackHelp);
        }
    }
}

// Run the wrapper
if (require.main === module) {
    const wrapper = new PostmanGovernanceWrapper();
    wrapper.run();
}

module.exports = PostmanGovernanceWrapper;