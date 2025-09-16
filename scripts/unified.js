#!/usr/bin/env node
const { exec, spawn } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const execPromise = util.promisify(exec);
POSTMAN_LOGO_SVG = `<svg preserveAspectRatio="xMidYMid" style="" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="m255 144.3c9-70.1-40.6-134.2-110.6-143.2s-134.4 40.6-143.3 110.6c-9 70 40.6 134.2 110.6 143.3 70.1 9 134.2-40.6 143.3-110.7" style="fill:#fff"/><path d="m174.2 82.2-54 54-15.2-15.2c53.1-53.1 58.4-48.5 69.2-38.8" style="fill:#ff6c37"/><path d="m120.2 137.5c-.4 0-.6-.1-.9-.4l-15.4-15.2a1.2 1.2 0 010-1.8c54-54 59.6-48.9 71-38.6.3.3.4.5.4.9s-.1.6-.4.9l-54 53.9c-.1.3-.5.4-.8.4m-13.4-16.5 13.4 13.4 52.1-52.1c-9.5-8.4-15.9-11-65.5 38.7" style="fill:#fff"/><path d="m135.7 151.7-14.7-14.7 54-54c14.5 14.6-7.2 38.3-39.3 68.7" style="fill:#ff6c37"/><path d="m135.7 153c-.4 0-.6-.1-.9-.4l-14.7-14.7c-.3-.3-.3-.5-.3-.9s.1-.6.4-.9l54-54a1.2 1.2 0 011.8 0 15.6 15.6 0 015 11.9c-.3 14.2-16.4 32.3-44.3 58.6-.4.3-.8.4-1 .4m-12.9-16c8.2 8.3 11.6 11.6 12.9 12.9 21.5-20.5 42.4-41.5 42.5-55.9.1-3.3-1.2-6.7-3.3-9.2z" style="fill:#fff"/><path d="m105.2 121.3 10.9 10.9q.4.4 0 .8c-.1.1-.1.1-.3.1l-22.5 4.9c-1.2.1-2.2-.6-2.4-1.8-.1-.6.1-1.3.5-1.7l13.1-13.1c.3-.3.6-.4.8-.1" style="fill:#ff6c37"/><path d="m92.9 139.3c-1.9 0-3.3-1.5-3.3-3.5 0-.9.4-1.8 1-2.4l13.1-13.1c.8-.6 1.8-.6 2.6 0l10.9 10.9c.8.6.8 1.8 0 2.6-.3.3-.5.4-.9.5l-22.5 4.9c-.3 0-.5.1-.8.1m11.9-16.5-12.5 12.5c-.3.3-.4.6-.1 1 .1.4.5.5.9.4l21.1-4.6z" style="fill:#fff"/><path d="m202.7 52.2c-8.2-7.9-21.4-7.7-29.3.6s-7.7 21.4.6 29.3a20.7 20.7 0 0025.1 2.8l-14.6-14.6z" style="fill:#ff6c37"/><path d="m188.4 89.2c-12.2 0-22-9.9-22-22s9.9-22 22-22c5.6 0 11.1 2.2 15.2 6.1.3.3.4.5.4.9s-.1.6-.4.9l-17.3 17.3 13.6 13.6c.5.5.5 1.3 0 1.8l-.3.3c-3.3 2-7.3 3.2-11.3 3.2m0-41.3c-10.8 0-19.5 8.7-19.3 19.5 0 10.8 8.7 19.5 19.5 19.3 2.9 0 5.9-.6 8.6-2l-13.4-13.3c-.3-.3-.4-.5-.4-.9s.1-.6.4-.9l17.1-17.2c-3.5-2.9-7.8-4.5-12.4-4.5" style="fill:#fff"/><path d="m203.1 52.6-.3-.3-18.3 18 14.5 14.5c1.4-.9 2.8-1.9 4-3.1a20.5 20.5 0 00.1-29.2" style="fill:#ff6c37"/><path d="m199.2 86.3c-.4 0-.6-.1-.9-.4l-14.6-14.6c-.3-.3-.4-.5-.4-.9s.1-.6.4-.9l18.2-18.2a1.2 1.2 0 011.8 0l.4.3c8.6 8.6 8.6 22.4.1 31.1-1.3 1.3-2.7 2.4-4.2 3.3-.4.1-.6.3-.8.3m-12.8-15.9 12.9 12.9c1-.6 2-1.5 2.8-2.3 7.3-7.3 7.7-19.2.6-26.9z" style="fill:#fff"/><path d="m176.4 84.5a7.9 7.9 0 00-11.1 0l-48.2 48.2 8.1 8.1 51.1-44.8c3.3-2.8 3.6-7.8.8-11.1-.3-.1-.4-.3-.5-.4" style="fill:#ff6c37"/><path d="m124.9 142.1c-.4 0-.6-.1-.9-.4l-8.1-8.1a1.2 1.2 0 010-1.8l48.2-48.2a9.1 9.1 0 0112.9 0 9.1 9.1 0 010 12.9l-.4.4-51.1 44.8q-.2.4-.8.4m-6.1-9.3 6.3 6.3 50.2-44c2.8-2.3 3.1-6.5.8-9.3s-6.5-3.1-9.3-.8c-.1.1-.3.3-.5.4z" style="fill:#fff"/><path d="m80 187.6c-.5.3-.8.8-.6 1.3l2.2 9.2c.5 1.3-.3 2.8-1.7 3.2-1 .4-2.2 0-2.8-.8l-14.1-14 45.9-45.9 15.9.3 10.8 10.8c-2.6 2.2-18 17.1-55.5 36" style="fill:#ff6c37"/><path d="m79 202.6c-1 0-2-.4-2.7-1.2l-14-14c-.3-.3-.4-.5-.4-.9s.1-.6.4-.9l45.9-45.9c.3-.3.6-.4.9-.4l15.9.3c.4 0 .6.1.9.4l10.8 10.8c.3.3.4.6.4 1s-.1.6-.5.9l-.9.8c-13.6 11.9-32 23.8-54.9 35.2l2.2 9.1c.4 1.7-.4 3.5-1.9 4.4-.8.4-1.4.5-2 .5m-14.1-16 13.2 13.1c.4.6 1.2.9 1.8.5s.9-1.2.5-1.8l-2.2-9.2c-.3-1.2.3-2.2 1.3-2.7 22.7-11.4 41-23.2 54.4-34.8l-9.5-9.5-14.7-.3z" style="fill:#fff"/><path d="m52.1 197.6 11-11 16.4 16.4-26.1-1.8c-1.2-.1-1.9-1.2-1.8-2.3 0-.5.1-1 .5-1.3" style="fill:#ff6c37"/><path d="m79.5 204.1-26.2-1.8c-1.9-.1-3.2-1.8-3.1-3.7.1-.8.4-1.5 1-2l11-11a1.2 1.2 0 011.8 0l16.4 16.4c.4.4.5.9.3 1.4q-.4.8-1.2.8m-16.4-15.7-10.1 10.1c-.4.3-.4.9 0 1.2.1.1.3.3.5.3l22.7 1.5zm41.3-41.8c-.8 0-1.3-.6-1.3-1.3 0-.4.1-.6.4-.9l12.4-12.4a1.2 1.2 0 011.8 0l8.1 8.1c.4.4.5.8.4 1.3-.1.4-.5.8-1 .9l-20.5 4.4zm12.4-11.9-8.4 8.4 13.8-2.9z" style="fill:#fff"/><path d="m124.8 140.9-14.1 3.1c-1 .3-2-.4-2.3-1.4-.1-.6 0-1.3.5-1.8l7.8-7.8z" style="fill:#ff6c37"/><path d="m110.5 145.3a3.2 3.2 0 01-3.2-3.2c0-.9.4-1.7.9-2.3l7.8-7.8a1.2 1.2 0 011.8 0l8.1 8.1c.4.4.5.8.4 1.3-.1.4-.5.8-1 .9l-14.1 3.1zm6.4-10.6-6.9 6.9c-.3.3-.3.5-.1.8q.2.4.8.4l11.8-2.6zm86.4-69.7c-.3-.8-1.2-1.2-1.9-.9-.8.3-1.2 1.2-.9 1.9 0 .1.1.3.1.4.8 1.5.5 3.5-.5 4.9-.5.6-.4 1.5.1 2 .6.5 1.5.4 2-.3 1.9-2.4 2.3-5.5 1-8.1" style="fill:#fff"/></svg>`

// Using external template for HTML generation

// Helper function to get API key from postmanrc
function getPostmanApiKey() {
    // Read from ~/.postman/postmanrc
    const os = require('os');
    const postmanrcPath = path.join(os.homedir(), '.postman', 'postmanrc');

    try {
        if (fs.existsSync(postmanrcPath)) {
            const config = JSON.parse(fs.readFileSync(postmanrcPath, 'utf8'));
            if (config.login && config.login._profiles && config.login._profiles.length > 0) {
                // Get the default profile or first profile
                const profile = config.login._profiles.find(p => p.alias === 'default') || config.login._profiles[0];
                if (profile && profile.postmanApiKey) {
                    return profile.postmanApiKey;
                }
            }
        }
    } catch (error) {
        // Failed to read postmanrc, will return null
    }

    return null;
}

/**
 * Postman API Governance Scorer
 * Analyzes API specifications for governance compliance
 *
 * This script is embedded within the enhanced Postman CLI binary built by build-binary.sh
 *
 * Usage (via enhanced CLI binary):
 * ./postman-osx_arm64 api lint specs/my-api.json -r json
 * ./postman-osx_arm64 api lint specs/my-api.json -r html
 * ./postman-linux64 api lint -d specs -r json
 * ./postman-linux64 api lint -d specs -r html
 *
 * Output formats:
 * - json: Detailed governance data in JSON format
 * - html: Interactive dashboard with visualization
 */

class GovernanceScorer {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey;
        this.mode = options.mode || 'local';
        this.teamDomain = options.teamDomain || '';
        this.workspaceId = options.workspaceId || '';
    }

    /**
     * Determine the scoring mode and configuration
     */
    static detectMode(argv) {
        // Mode priority: explicit mode > API/spec IDs > directory/file paths
        if (argv.mode) {
            return {
                mode: argv.mode,
                teamDomain: argv['team-domain'] || '',
                workspaceId: argv['workspace-id'] || ''
            };
        }
        
        if (argv['api-ids'] || argv['api-id']) {
            return {
                mode: 'api',
                teamDomain: argv['team-domain'] || '',
                workspaceId: argv['workspace-id'] || ''
            };
        }
        
        if (argv['spec-ids'] || argv['spec-id']) {
            return {
                mode: 'spec',
                teamDomain: argv['team-domain'] || '',
                workspaceId: argv['workspace-id'] || ''
            };
        }
        
        return {
            mode: 'local',
            teamDomain: '',
            workspaceId: ''
        };
    }

    /**
     * Execute command by redirecting to temp file to avoid all truncation issues
     */
    async executeWithTempFile(command, args, apiKey) {
        const tempFile = path.join(require('os').tmpdir(), `postman-output-${Date.now()}.txt`);
        
        return new Promise((resolve, reject) => {
            // Redirect output to temp file to bypass all buffering/truncation
            const fullCommand = `POSTMAN_API_KEY="${apiKey}" ${command} ${args.join(' ')} > "${tempFile}" 2>&1`;
            
            const child = spawn('sh', ['-c', fullCommand], {
                stdio: ['ignore', 'inherit', 'inherit'],
                env: { ...process.env, POSTMAN_API_KEY: apiKey }
            });
            
            const timeout = setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error('Command timeout after 10 minutes'));
            }, 600000);
            
            child.on('close', (code) => {
                clearTimeout(timeout);
                
                try {
                    // Read the complete output from temp file
                    const stdout = fs.readFileSync(tempFile, 'utf8');
                    
                    // Clean up temp file
                    try {
                        fs.unlinkSync(tempFile);
                    } catch (cleanupError) {
                        console.warn(`Failed to cleanup temp file: ${cleanupError.message}`);
                    }
                    
                    resolve({ stdout, stderr: '', code });
                } catch (readError) {
                    reject(new Error(`Failed to read output file: ${readError.message}`));
                }
            });
            
            child.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    /**
     * Score an API by ID using Postman CLI
     */
    async scoreApiById(apiId, apiName = null) {
        try {
            let stdout = '';

            try {
                const result = await this.executeWithTempFile('postman', ['api', 'lint', apiId], this.apiKey);
                stdout = result.stdout;

                console.log(`API lint result for ${apiName || apiId}: stdout length=${stdout.length}, exit code=${result.code}`);
            } catch (error) {
                stdout = error.stdout || error.message || '';
                console.warn(`API lint failed for ${apiName || apiId}: ${error.message}`);
            }
            
            if (stdout.includes('Error:') && stdout.includes("not found")) {
                return { score: 0, error: `API ${apiId} not found` };
            }

            const { issues, summary } = this.parseStdoutToIssuesAndSummary(stdout);
            const score = this.computeScore(issues);
            
            return {
                id: apiId,
                score,
                violations: issues,
                violationCount: issues.length,
                issues,
                summary,
                api: apiName || apiId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { id: apiId, score: 0, error: error.message };
        }
    }

    /**
     * Score a spec by ID using Postman CLI
     */
    async scoreSpecById(specId, specName = null) {
        try {
            let stdout = '';

            try {
                const result = await this.executeWithTempFile('postman', ['spec', 'lint', specId], this.apiKey);
                stdout = result.stdout;

                console.log(`Spec lint result for ${specName || specId}: stdout length=${stdout.length}, exit code=${result.code}`);
            } catch (error) {
                stdout = error.stdout || error.message || '';
                console.warn(`Spec lint failed for ${specName || specId}: ${error.message}`);
            }
            
            if (stdout.includes('Error:') && stdout.includes("not found")) {
                return { score: 0, error: `Spec ${specId} not found` };
            }

            const { issues, summary } = this.parseStdoutToIssuesAndSummary(stdout);
            const score = this.computeScore(issues);
            
            return {
                id: specId,
                score,
                violations: issues,
                violationCount: issues.length,
                issues,
                summary,
                api: specName || specId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { id: specId, score: 0, error: error.message };
        }
    }

    /**
     * Score a spec file using Postman CLI governance linting with detailed issue extraction
     */
    async scoreSpecFile(specPath) {
        try {
            let stdout = '';

            try {
                // Use temp file approach to completely bypass any truncation issues
                const result = await this.executeWithTempFile('postman', ['api', 'lint', specPath], this.apiKey);
                stdout = result.stdout;

                console.log(`Temp file result for ${path.basename(specPath)}: stdout length=${stdout.length}, exit code=${result.code}`);
            } catch (error) {
                // Command failed, but check if we got any output
                stdout = error.stdout || error.message || '';
                console.warn(`Temp file approach failed for ${path.basename(specPath)}: ${error.message}`);
            }
            
            // Check if file not found or parsing error
            if (stdout.includes('Error:') && stdout.includes("Couldn't parse")) {
                return { score: 0, error: `Failed to parse API specification` };
            }

            // Parse detailed issues from table output
            const { issues, summary } = this.parseStdoutToIssuesAndSummary(stdout);
            const score = this.computeScore(issues);
            
            console.log(`Parsed ${issues.length} issues for ${path.basename(specPath)} (Score: ${score})`);
            
            return {
                score,
                violations: issues, // Keep for backward compatibility
                violationCount: issues.length,
                issues, // Detailed array for HTML template
                summary, // Summary counts for HTML template
                api: path.basename(specPath),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    /**
     * Normalize severity to consistent lowercase format expected by template
     */
    normalizeSeverity(severity) {
        if (!severity) return 'hint';
        const cleaned = severity.toString().toLowerCase().trim();
        
        // Map various input formats to template expectations
        switch (cleaned) {
            case 'error': 
            case 'errors': 
                return 'error';
            case 'warn':
            case 'warning': 
            case 'warnings':
                return 'warn';
            case 'info':
            case 'information':
                return 'info';
            case 'hint':
            case 'hints':
            default:
                return 'hint';
        }
    }

    /**
     * Parse stdout table format to extract detailed issues and summary
     * Handles multiple tables (Governance, Security, etc.)
     */
    parseStdoutToIssuesAndSummary(stdout) {
        const clean = stdout.replace(/\x1b\[[0-9;]*m/g, ''); // Remove ANSI codes
        const lines = clean.split('\n');
        const issues = [];
        let currentValidationType = 'governance';

        // Parse all table rows across multiple validation types
        for (const line of lines) {
            // Detect validation type headers
            if (line.includes('Validation Type:')) {
                const typeMatch = line.match(/Validation Type:\s*(\w+)/i);
                if (typeMatch) {
                    currentValidationType = typeMatch[1].toLowerCase();
                }
                continue;
            }
            
            if (!line.includes('│')) continue;
            
            const row = line.split('│').map(s => s.trim()).filter(Boolean);
            
            // Skip headers and separators
            if (row.some(cell => cell.includes('Range') || cell.includes('Severity') || cell.includes('─'))) {
                continue;
            }
            
            // Expected columns: Range, Severity, Description, Path (Path may be empty)
            if (row.length >= 3) {
                const [range, severity, description, pathStr = ''] = row;
                
                // Extract line and column from range (e.g., "4:12")
                let line = 0, column = 0;
                const rangeMatch = range.match(/^(\d+):(\d+)$/);
                if (rangeMatch) {
                    line = parseInt(rangeMatch[1]);
                    column = parseInt(rangeMatch[2]);
                }
                
                // Normalize severity to match template expectations
                const normalizedSeverity = this.normalizeSeverity(severity);
                
                issues.push({
                    severity: normalizedSeverity,
                    rule: `${currentValidationType}-rule`, // Include validation type in rule
                    message: description || '',
                    path: pathStr || '',
                    line: line,
                    column: column
                });
            }
        }

        // If table parsing failed, try to extract from summary line
        if (issues.length === 0) {
            const summaryRegex = /.*?(\d+)\s+problems?\s*\((\d+)\s+errors?,\s*(\d+)\s+warnings?,\s*(\d+)\s+infos?,\s*(\d+)\s+hints?\)/;
            const summaryMatch = clean.match(summaryRegex);
            if (summaryMatch) {
                const [, , errors, warnings, infos, hints] = summaryMatch;
                
                // Create generic issues based on counts
                for (let i = 0; i < parseInt(errors); i++) {
                    issues.push({ severity: this.normalizeSeverity('error'), rule: 'governance-rule', message: 'Governance error', path: '', line: 0, column: 0 });
                }
                for (let i = 0; i < parseInt(warnings); i++) {
                    issues.push({ severity: this.normalizeSeverity('warning'), rule: 'governance-rule', message: 'Governance warning', path: '', line: 0, column: 0 });
                }
                for (let i = 0; i < parseInt(infos); i++) {
                    issues.push({ severity: this.normalizeSeverity('info'), rule: 'governance-rule', message: 'Governance info', path: '', line: 0, column: 0 });
                }
                for (let i = 0; i < parseInt(hints); i++) {
                    issues.push({ severity: this.normalizeSeverity('hint'), rule: 'governance-rule', message: 'Governance hint', path: '', line: 0, column: 0 });
                }
            }
        }

        const summary = this.summarizeIssues(issues);
        return { issues, summary };
    }

    /**
     * Create summary counts from detailed issues
     */
    summarizeIssues(issues) {
        const summary = { total: issues.length, error: 0, warn: 0, info: 0, hint: 0 };
        for (const issue of issues) {
            // Use normalized severity for consistent counting
            const normalizedSeverity = this.normalizeSeverity(issue.severity);
            if (normalizedSeverity === 'error') summary.error++;
            else if (normalizedSeverity === 'warn') summary.warn++;
            else if (normalizedSeverity === 'info') summary.info++;
            else summary.hint++;
        }
        return summary;
    }

    /**
     * Compute score from detailed issues
     */
    computeScore(issues) {
        let score = 100;
        for (const issue of issues) {
            // Use normalized severity for consistent scoring
            const normalizedSeverity = this.normalizeSeverity(issue.severity);
            switch (normalizedSeverity) {
                case 'error': score -= 10; break;
                case 'warn': score -= 2.5; break;
                case 'info': score -= 0.5; break;
                default: score -= 0.05; // hint
            }
        }
        return Math.max(0, Math.round(score * 100) / 100);
    }

    /**
     * Get governance report for API IDs
     */
    async getApiIdsGovernanceReport(apiIds, threshold = 70) {
        const governanceReport = [];
        
        for (const apiId of apiIds) {
            try {
                const result = await this.scoreApiById(apiId);
                governanceReport.push({
                    name: result.api,
                    id: apiId,
                    path: '',
                    score: result.score,
                    violationsCount: result.violationCount || (result.issues?.length ?? 0),
                    status: result.score >= threshold ? 'PASS' : 'FAIL',
                    error: result.error,
                    issues: result.issues || [],
                    summary: result.summary || this.summarizeIssues(result.issues || []),
                    api: result.api,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.warn(`Failed to score API ${apiId}: ${error.message}`);
                governanceReport.push({
                    name: apiId,
                    id: apiId,
                    path: '',
                    score: 0,
                    violationsCount: 0,
                    status: 'FAIL',
                    error: `Failed to score: ${error.message}`
                });
            }
        }
        
        return governanceReport;
    }

    /**
     * Get governance report for Spec IDs
     */
    async getSpecIdsGovernanceReport(specIds, threshold = 70) {
        const governanceReport = [];
        
        for (const specId of specIds) {
            try {
                const result = await this.scoreSpecById(specId);
                governanceReport.push({
                    name: result.api,
                    id: specId,
                    path: '',
                    score: result.score,
                    violationsCount: result.violationCount || (result.issues?.length ?? 0),
                    status: result.score >= threshold ? 'PASS' : 'FAIL',
                    error: result.error,
                    issues: result.issues || [],
                    summary: result.summary || this.summarizeIssues(result.issues || []),
                    api: result.api,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.warn(`Failed to score Spec ${specId}: ${error.message}`);
                governanceReport.push({
                    name: specId,
                    id: specId,
                    path: '',
                    score: 0,
                    violationsCount: 0,
                    status: 'FAIL',
                    error: `Failed to score: ${error.message}`
                });
            }
        }
        
        return governanceReport;
    }

    /**
     * Get governance report for all specs in a directory
     */
    async getDirectoryGovernanceReport(dirPath, threshold = 70) {
        try {
            const specsDir = path.resolve(dirPath);
            
            if (!fs.existsSync(specsDir)) {
                throw new Error(`Directory not found: ${specsDir}`);
            }
            
            // Get all YAML and JSON files in the directory
            const files = fs.readdirSync(specsDir);
            const specFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ext === '.yaml' || ext === '.yml' || ext === '.json';
            });
            
            if (specFiles.length === 0) {
                throw new Error(`No spec files found in ${specsDir}`);
            }
            
            const governanceReport = [];
            
            for (const file of specFiles) {
                const specPath = path.join(specsDir, file);
                const specName = path.basename(file, path.extname(file));
                
                try {
                    const result = await this.scoreSpecFile(specPath);
                    governanceReport.push({
                        name: specName,
                        path: specPath,
                        score: result.score,
                        violationsCount: result.violationCount || (result.issues?.length ?? 0),
                        status: result.score >= threshold ? 'PASS' : 'FAIL',
                        error: result.error,
                        // New fields for per-API HTML:
                        issues: result.issues || [],
                        summary: result.summary || this.summarizeIssues(result.issues || []),
                        api: specName,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    console.warn(`Failed to score spec ${specName}: ${error.message}`);
                    governanceReport.push({
                        name: specName,
                        path: specPath,
                        score: 0,
                        violationsCount: 0,
                        status: 'FAIL',
                        error: `Failed to score: ${error.message}`
                    });
                }
            }
            
            return governanceReport;
        } catch (error) {
            throw new Error(`Failed to get directory governance report: ${error.message}`);
        }
    }


    /**
     * Generate multi-API HTML dashboard for governance report
     */
    generateDashboard(report) {
        const timestamp = new Date().toISOString();
        const passCount = report.filter(api => api.status === 'PASS').length;
        const failCount = report.filter(api => api.status === 'FAIL').length;
        const avgScore = report.length > 0 ? report.reduce((sum, api) => sum + api.score, 0) / report.length : 0;

        // Calculate aggregate stats across all APIs
        const aggregatedStats = {
            total: report.reduce((sum, api) => sum + (api.summary?.total || 0), 0),
            error: report.reduce((sum, api) => sum + (api.summary?.error || 0), 0),
            warn: report.reduce((sum, api) => sum + (api.summary?.warn || 0), 0),
            info: report.reduce((sum, api) => sum + (api.summary?.info || 0), 0),
            hint: report.reduce((sum, api) => sum + (api.summary?.hint || 0), 0)
        };

        // Prepare data structure for the multi-API template
        const templateData = {
            mode: this.mode,
            teamDomain: this.teamDomain,
            workspaceId: this.workspaceId,
            timestamp,
            totalApis: report.length,
            passCount,
            failCount,
            avgScore,
            aggregatedStats,
            apis: report,
            allIssues: report.flatMap(api => 
                (api.issues || []).map(issue => ({
                    ...issue,
                    apiName: api.name,
                    apiStatus: api.status
                }))
            )
        };

        return this.generateMultiApiHtmlTemplate(templateData);
    }

    /**
     * Get user info (stub implementation)
     */
    async getUserInfo() {
        return {
            teamDomain: this.teamDomain || 'postman'
        };
    }

    /**
     * Generate the multi-API HTML template using external template
     */
    async generateMultiApiHtmlTemplate(data) {
        // Get team domain for Postman URLs
        const userInfo = await this.getUserInfo();
        const teamDomain = userInfo?.teamDomain || 'postman';
        
        // Add teamDomain to data for use in template
        data.teamDomain = teamDomain;
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multi-API Governance Report</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-content-color: #212121;
            --secondary-content-color: #6B6B6B;
            --tertiary-content-color: #A6A6A6;
            
            --content-color-success: #007F31;
            --content-color-error: #8E1A10;
            --content-color-link: #0265D2;
            
            --border-color-default: #ededed;
            --border-secondary: #E6E6E6;
            
            --background-color-error: #ffebe7;
            --background-color-success: #E5FFF1;
            --background-color-secondary: #f9f9f9;
            --background-color-tertiary: #f2f2f2;
            
            --base-color-brand: #ff6c37;
            --base-color-error: #eb2013;
            --base-color-success: #0cbb52;
            
            --grey-10: #f2f2f2;
            --red-60: #b02016;
            --red-20: #fbc3ba;
            --red-30: #F79A8E;
            --green-30: #6bdd9a;
            
            --text-secondary: #6b6b6b;
            --text-muted: #929292;
            
            --font-weight-regular: 400;
            --font-weight-medium: 500;
            --font-weight-semibold: 600;
            
            --font-primary: Inter, serif;
            --font-secondary: IBM Plex Mono, monospace;
            
            --section-border: 1px solid var(--border-secondary);
            --border-radius: 8px;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: var(--font-primary);
            color: var(--primary-content-color);
        }
        
        html {
            height: 100vh;
            font-family: var(--font-primary);
            font-size: 16px;
        }
        
        body {
            margin: 0;
            padding: 0;
            height: 100%;
        }

        a {
            color: #0066cc;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        h3 {
            font-family: var(--font-primary);
            font-size: 16px;
            font-weight: 600;
            line-height: 20px;
            letter-spacing: -0.12px;
            text-align: left;
        }

        /* Header styling */
        .heading-content {
            display: flex;
            flex-direction: column;
            gap: 15px;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }

        .header-container, .content-container {
            padding: 24px 96px 0 96px;
            width: 100%;
            height: 100%;
        }

        .header-tab-container {
            width: 100%;
            border-bottom: 1px solid var(--border-color-default);
            position: sticky;
            top: 0;
            z-index: 10;
            padding: 0 96px;
        }

        .heading-content .heading {
            color: var(--secondary-content-color);
            font-weight: 500;
            text-transform: capitalize;
            letter-spacing: 2px;
            font-size: 12px;
        }

        .heading-content .report-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            max-width: 100%;
            margin-bottom: 20px;
        }

        .report-info .collection-name {
            color: var(--primary-content-color);
            font-weight: 600;
            font-size: 28px;
            letter-spacing: -0.4px;
            line-height: 1.3;
            min-height: 0;
        }

        .report-info .collection-time {
            color: var(--tertiary-content-color);
            font-weight: 400;
            font-size: 16px;
            letter-spacing: -0.4px;
            white-space: nowrap;
            flex-shrink: 0;
            line-height: 1.3;
        }

        /* Tab styling */
        .tab {
            display: flex;
            gap: 24px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .tab-button {
            display: inline-block;
            padding: 12px 0 12px 0;
            font-size: 16px;
            color: var(--tertiary-content-color);
            font-weight: 400;
            border: none;
            background: none;
            cursor: pointer;
        }

        .tab-button:hover {
            color: var(--secondary-content-color);
        }

        .tab-button.active {
            color: var(--primary-content-color);
            box-shadow: inset 0 -3px 0 var(--base-color-brand);
            font-weight: 500;
        }

        .tab-content {
            display: none;
        }

        .tab-content.tab-summary {
            display: block;
        }

        /* Content containers */
        .summary-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }

        .all-issues-content {
            display: flex;
            gap: 24px;
            flex-direction: column;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }

        /* Overview container */
        .overview-container {
            padding: 16px;
            border: var(--section-border);
            border-radius: var(--border-radius);
        }

        .run-info-container {
            display: grid;
            grid-template-columns: 25% 25% 25% 25%;
            gap: 4px;
        }

        .overview-container .overview-data-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .overview-data-container .overview-data-title {
            color: var(--tertiary-content-color);
            font-weight: 400;
            font-size: 12px;
        }

        .overview-data-container .overview-data-content {
            color: var(--primary-content-color);
            font-size: 14px;
            font-weight: 400;
            padding-right: 10px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            max-width: 200px;
        }

        /* Stats cards */
        .stats-container {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .stats-container .stats-data-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 16px 12px 16px 12px;
            width: 200px;
            gap: 20px;
            border-radius: 8px;
            border: 1px solid var(--border-color-default);
        }

        .stats-data-container .stats-data-title {
            font-size: 12px;
            font-weight: 400;
            line-height: 16px;
            text-align: left;
        }

        .stats-data-container .stats-data-content {
            font-family: IBM Plex Mono, serif;
            font-size: 54px;
            font-weight: 400;
            letter-spacing: -1.6px;
            text-align: left;
            line-height: 45px;
        }

        /* Issue summary table */
        #issue-summary-container {
            padding: 16px;
            border-radius: 8px;
            border: var(--section-border);
        }

        table#summary-table {
            width: 100%;
            border-spacing: 0 10px;
            table-layout: fixed;
            border-radius: 0 !important;
        }

        table#summary-table td, th {
            border-collapse: collapse;
            border-bottom: 1px solid #EDEDEDB2;
            padding: 4px 0;
            height: 40px;
            text-align: left;
            font-weight: 400;
            line-height: 1.5rem;
            word-wrap: break-word;
            word-break: break-word;
            max-height: 150px;
        }

        table#summary-table tr:last-child td, tr:last-child th {
            border-bottom: none;
        }

        table#summary-table .metric-heading {
            text-align: right;
            width: 136px;
        }

        table#summary-table td .content {
            display: inline-block;
            width: fit-content;
            padding: 0 12px;
            border-radius: 4px;
            min-width: 3rem;
            text-align: center;
        }

        table#summary-table th {
            color: var(--secondary-content-color);
        }

        /* Issue containers for All Issues tab */
        .issue-container {
            padding: 16px;
            border: var(--section-border);
            border-radius: var(--border-radius);
            margin-bottom: 12px;
            transition: background-color 0.2s ease;
        }

        .issue-container:hover {
            background: var(--background-color-tertiary);
        }

        .issue-container.error {
            border-color: var(--red-20);
            background: #FFF7F5;
        }

        .issue-container.warn {
            border-color: #FFD6A5;
            background: #FFF8F0;
        }

        .issue-container.info {
            border-color: #B3E5FC;
            background: #F8FDFF;
        }

        /* Filter button styling (MISSING from original) */
        .filter-button {
            background-color: var(--background-color-tertiary);
            border: none;
            text-align: center;
            border-radius: 30px;
            padding: 6px 12px;
            font-size: 11px;
            font-weight: 600;
            color: var(--secondary-content-color);
            cursor: pointer;
            line-height: 16px;
            max-height: 28px;
        }

        .filter-button:hover {
            background-color: var(--border-color-default);
        }

        .filter-button.selected {
            background-color: #2B2B2B;
            color: #FFF;
        }

        .issue-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }

        .severity-badge {
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: var(--font-weight-semibold);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .severity-badge.error {
            background-color: var(--base-color-error);
            color: white;
        }

        .severity-badge.warn {
            background-color: var(--base-color-brand);
            color: white;
        }

        .severity-badge.info {
            background-color: var(--content-color-link);
            color: white;
        }

        .severity-badge.hint {
            background-color: var(--tertiary-content-color);
            color: white;
        }

        .rule-name {
            font-family: var(--font-secondary);
            background: var(--grey-10);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            color: var(--text-secondary);
            font-weight: var(--font-weight-medium);
        }

        .issue-message {
            font-size: 15px;
            line-height: 1.5;
            color: var(--primary-content-color);
            margin-bottom: 8px;
        }

        .issue-location {
            font-family: var(--font-secondary);
            font-size: 12px;
            color: var(--text-muted);
            background: var(--background-color-tertiary);
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
        }

        /* Footer styling (exact copy from original) */
        .footer {
            background-color: var(--background-color-secondary);
            padding: 16px;
            border-radius: 8px;
            display: flex;
            gap: 23px;
            align-items: center;
        }

        .footer .footer-icon-container {
            padding: 0 10px;
        }

        .footer-icon-container .footer-icon {
            width: 122px;
            height: 118px;
        }

        .footer .footer-text-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 637px;
        }

        .footer .footer-title {
            letter-spacing: -0.12px;
            font-size: 16px;
            font-weight: 600;
        }

        .footer .footer-content {
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
        }

        /* Typography Utilities (MISSING FROM OUR VERSION!) */
        .text-xs { font-size: 11px; }
        .text-sm { font-size: 12px; }
        .text-base { font-size: 14px; }
        .text-lg { font-size: 16px; }

        .font-regular { font-weight: var(--font-weight-regular); }
        .font-medium { font-weight: var(--font-weight-medium); }
        .font-semibold { font-weight: var(--font-weight-semibold); }

        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-primary { font-family: var(--font-primary), serif; }

        /* Text Colors (MISSING!) */
        .text-primary { color: var(--primary-content-color); }
        .text-secondary { color: var(--secondary-content-color); }
        .text-tertiary { color: var(--tertiary-content-color); }
        .text-muted { color: var(--text-muted); }
        .text-error { color: var(--base-color-error); }
        .text-success { color: var(--base-color-success); }

        /* Background Colors (MISSING!) */
        .bg-white { background-color: white; }
        .bg-secondary { background-color: var(--background-color-secondary); }
        .bg-tertiary { background-color: var(--background-color-tertiary); }
        .bg-error { background-color: var(--background-color-error); }
        .bg-success-light { background-color: var(--green-30); }

        /* Layout Utilities (MISSING!) */
        .flex { display: flex; }
        .flex-col { display: flex; flex-direction: column; }
        .flex-row-wrap { display: flex; flex-wrap: wrap; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .full-width { width: 100%; }
        .hidden { visibility: hidden; }

        .gap-2 { gap: 2px; }
        .gap-4 { gap: 4px; }
        .gap-5 { gap: 5px; }
        .gap-8 { gap: 8px; }
        .gap-12 { gap: 12px; }
        .gap-16 { gap: 16px; }

        /* Spacing Utilities (MISSING!) */
        .p-1 { padding: 1px; }
        .p-2 { padding: 2px; }
        .p-3 { padding: 3px; }
        .p-4 { padding: 4px; }
        .p-8 { padding: 8px; }
        .p-12 { padding: 12px; }
        .p-16 { padding: 16px; }
        .p-20 { padding: 20px; }
        .p-24 { padding: 24px; }

        .px-12 { padding-left: 12px; padding-right: 12px; }
        .py-12 { padding-top: 12px; padding-bottom: 12px; }
        .py-16 { padding-top: 16px; padding-bottom: 16px; }

        .mt-16 { margin-top: 16px; }
        .mt-24 { margin-top: 24px; }
        .mb-8 { margin-bottom: 8px; }
        .mr-2 { margin-right: 2px; }

        /* Border Utilities (MISSING!) */
        .border { border: 1px solid; }
        .border-default { border-color: var(--border-color-default); }
        .border-secondary { border-color: var(--border-secondary); }
        .border-error { border-color: var(--red-20); }
        .border-success { border-color: var(--green-30); }

        .rounded { border-radius: 4px; }
        .rounded-lg { border-radius: 8px; }
        .rounded-full { border-radius: 9999px; }

        /* Postman Logo Button */
        .postman-logo-btn {
            background: #FF6C37;
            border: none;
            cursor: pointer;
            padding: 3px;
            border-radius: 4px;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            text-decoration: none;
        }
        
        .postman-logo-btn:hover {
            background: #E55A2B;
            box-shadow: 0 2px 6px rgba(255, 108, 55, 0.3);
        }
        
        .postman-logo-btn svg {
            width: 12px;
            height: 12px;
        }

        /* API Name Link Styling */
        .api-name-link {
            cursor: pointer;
            color: #212121 !important;
            text-decoration-line: underline;
            text-decoration-style: dotted;
            text-underline-offset: auto;
            text-decoration-color: #C6C6C6E3;
            text-decoration-thickness: 13.5%;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
            font-weight: 500;
        }
        
        .api-name-link:hover {
            text-decoration-color: #FF6C37;
        }

        /* Tooltip System (CRITICAL MISSING PIECE!) */
        .tooltip-cell {
            overflow: visible;
        }
        
        .tooltip-container {
            position: relative;
            width: fit-content;
        }
        
        .tooltip-trigger {
            font-size: 16px;
            font-weight: 400;
            text-align: left;
        }
        
        .tooltip-trigger.underline {
            text-decoration-line: underline;
            text-decoration-style: dotted;
            text-underline-offset: auto;
            text-decoration-color: #C6C6C6E3;
            text-decoration-thickness: 13.5%;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
        }
        
        .tooltip {
            visibility: hidden;
            position: absolute;
            opacity: 0;
            z-index: 11;
            transition: opacity 0.3s ease, visibility 0s linear 0.3s;
            width: max-content;
            white-space: wrap;
            max-width: 220px;
            top: calc(100% + 4px);
            left: 0;
            border-radius: 2px;
            background-color: var(--background-color-tertiary);
            border: 1px solid rgba(0, 0, 0, 0.08);
            padding: 6px 8px;
            font-size: 11px;
            line-height: 16px;
            font-weight: 400;
            word-wrap: break-word;
            color: var(--primary-content-color);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .tooltip .number {
            font-weight: 600;
        }
        
        .tooltip-container:hover .tooltip {
            visibility: visible;
            opacity: 1;
            transition-delay: 0.3s;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
            .header-container, .content-container {
                width: 100%;
                padding: 24px 8px 0 8px;
            }
            
            .heading-content {
                align-items: center;
            }
            
            .tab {
                justify-content: center;
            }
            
            .run-info-container {
                display: flex;
                flex-direction: column;
                gap: 20px;
                align-items: center;
            }
            
            .stats-container {
                display: grid;
                grid-template-columns: 49% 49%;
            }
            
            .footer {
                flex-direction: column;
            }
            
            .footer .footer-icon {
                width: 80px;
                height: 90px;
            }
            
            .footer .footer-text-container {
                width: 100%;
            }
        }
    </style>
</head>
<body>
<div>
    <!--Header-->
    <header class="header-container">
        <div class="heading-content">
            <span class="heading">API GOVERNANCE REPORT</span>
            <div class="report-info">
                <div class="tooltip-container text-overflow-tooltip">
                    <span class="collection-name tooltip-trigger">${data.totalApis} APIs Analyzed</span>
                    <div class="tooltip">${data.totalApis} API specifications</div>
                </div>
                <span class="collection-time">
                    ${new Date(data.timestamp).toLocaleString()}
                </span>
            </div>
        </div>
    </header>
    
    <div class="header-tab-container">
        <div class="tab bg-white">
            <button class="tab-button active">
                Summary
            </button>
            <button class="tab-button">
                All Issues
            </button>
        </div>
    </div>

    <!--Content-->
    <div class="content-container no-border">
        <!--Summary Tab-->
        <div class="tab-content tab-summary">
            <div class="summary-content">
                <!--Overview-->
                <div class="overview-container">
                    <div class="run-info-container">
                        <!-- APIs Count -->
                        <div class="overview-data-container">
                            <span class="overview-data-title">APIs</span>
                            <div class="tooltip-container text-overflow-tooltip flex">
                                <span class="overview-data-content tooltip-trigger">${data.totalApis} specifications</span>
                                <div class="tooltip">${data.totalApis} API specifications analyzed</div>
                            </div>
                        </div>
                        
                        <!-- Total Issues -->
                        <div class="overview-data-container">
                            <span class="overview-data-title">Total Issues</span>
                            <span class="overview-data-content font-mono">${data.aggregatedStats.total}</span>
                        </div>
                        
                        <!-- Passing/Failing -->
                        <div class="overview-data-container">
                            <span class="overview-data-title">Status</span>
                            <span class="overview-data-content font-mono">${data.passCount} Pass / ${data.failCount} Fail</span>
                        </div>
                        
                        <!-- Average Score -->
                        <div class="overview-data-container">
                            <span class="overview-data-title">Avg Score</span>
                            <span class="overview-data-content font-mono">${data.avgScore.toFixed(1)}/100</span>
                        </div>
                    </div>
                </div>

                <!--Stats Cards-->
                <div class="stats-container">
                    <div class="stats-data-container">
                        <div class="stats-data-title" style="color: var(--base-color-error);">
                            Errors
                        </div>
                        <div class="stats-data-content" style="color: var(--base-color-error);">
                            ${data.aggregatedStats.error}
                        </div>
                    </div>
                    
                    <div class="stats-data-container">
                        <div class="stats-data-title" style="color: var(--base-color-brand);">
                            Warnings
                        </div>
                        <div class="stats-data-content" style="color: var(--base-color-brand);">
                            ${data.aggregatedStats.warn}
                        </div>
                    </div>
                    
                    <div class="stats-data-container">
                        <div class="stats-data-title" style="color: var(--content-color-link);">
                            Info
                        </div>
                        <div class="stats-data-content" style="color: var(--content-color-link);">
                            ${data.aggregatedStats.info}
                        </div>
                    </div>
                    
                    <div class="stats-data-container">
                        <div class="stats-data-title" style="color: var(--tertiary-content-color);">
                            Hints
                        </div>
                        <div class="stats-data-content" style="color: var(--tertiary-content-color);">
                            ${data.aggregatedStats.hint}
                        </div>
                    </div>
                </div>

                <!--API Summary Table-->
                <div id="issue-summary-container">
                    <h3 style="margin-bottom: 8px;">
                        API Summary
                    </h3>
                    <table id="summary-table">
                        <tr>
                            <th>API</th>
                            <th class="metric-heading">Score</th>
                            <th class="metric-heading">Errors</th>
                            <th class="metric-heading">Warnings</th>
                            <th class="metric-heading">Info</th>
                            <th class="metric-heading">Hints</th>
                        </tr>
                        ${data.apis.map(api => `
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    ${api.id && data.workspaceId && data.teamDomain ? `
                                        <a href="https://${data.teamDomain}.postman.co/workspace/${data.workspaceId}/specification/${api.id}" target="_blank" class="postman-logo-btn" title="View ${api.name} in Postman">
                                            ${POSTMAN_LOGO_SVG}
                                        </a>
                                    ` : `
                                        <button class="postman-logo-btn" onclick="alert('Spec ID or workspace info not available')" title="View in Postman">
                                            ${POSTMAN_LOGO_SVG}
                                        </button>
                                    `}
                                    <span class="api-name-link" onclick="showApiIssues('${api.name}')">${api.name}</span>
                                </div>
                            </td>
                            <td style="text-align: right;">
                                <span class="content font-mono ${api.status === 'PASS' ? '' : 'text-error'}">${api.score}/100</span>
                            </td>
                            <td style="text-align: right;">
                                <span class="content font-mono" style="background: var(--background-color-error); color: var(--base-color-error);">${api.summary?.error || 0}</span>
                            </td>
                            <td style="text-align: right;">
                                <span class="content font-mono" style="background: #FFF8F0; color: var(--base-color-brand);">${api.summary?.warn || 0}</span>
                            </td>
                            <td style="text-align: right;">
                                <span class="content font-mono" style="background: #F8FDFF; color: var(--content-color-link);">${api.summary?.info || 0}</span>
                            </td>
                            <td style="text-align: right;">
                                <span class="content font-mono" style="background: var(--background-color-tertiary); color: var(--tertiary-content-color);">${api.summary?.hint || 0}</span>
                            </td>
                        </tr>
                        `).join('')}
                    </table>
                </div>
            </div>
        </div>

        <!--All Issues Tab-->
        <div class="tab-content">
            <div class="all-issues-content">
                <div class="border border-default rounded-lg py-12 px-12">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
                        <!-- Left side: API Filter -->
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <span class="text-sm text-tertiary">Filter by API</span>
                            <select id="api-filter" style="
                                padding: 6px 12px;
                                border: 1px solid var(--border-color-default);
                                border-radius: 6px;
                                background: white;
                                font-family: var(--font-primary);
                                font-size: 14px;
                                color: var(--primary-content-color);
                                min-width: 200px;
                                cursor: pointer;
                            ">
                                <option value="all">All APIs</option>
                                ${data.apis.map(api => `<option value="${api.name}">${api.name}</option>`).join('')}
                            </select>
                        </div>
                        
                        <!-- Right side: Issue Filter Buttons -->
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <span class="text-sm text-tertiary">Issues by Severity</span>
                            <div class="flex gap-4">
                                <button class="filter-button selected" data-severity="all">All Issues</button>
                                <button class="filter-button" data-severity="error">Errors Only</button>
                                <button class="filter-button" data-severity="warn">Warnings Only</button>
                                <button class="filter-button" data-severity="info">Info Only</button>
                                <button class="filter-button" data-severity="hint">Hints Only</button>
                            </div>
                        </div>
                    </div>
                        
                    <!-- Divider -->
                    <div style="height: 1px; background: var(--border-color-default); margin: 16px 0"></div>
                </div>
                
                <!-- Issues List -->
                <div class="flex-col gap-8" id="issues-container">
                    ${data.allIssues.map(issue => `
                    <div class="issue-container ${issue.severity}" data-severity="${issue.severity}" data-api="${issue.apiName}">
                        <div class="flex items-center gap-12">
                            <span class="severity-badge ${issue.severity}">
                                ${issue.severity.toUpperCase()}
                            </span>
                            <div class="flex-col gap-8 full-width">
                                <div class="flex items-center gap-8">
                                    <span class="rule-name">${issue.rule || 'governance-rule'}</span>
                                    <span class="api-badge" style="
                                        background: var(--background-color-tertiary);
                                        color: var(--secondary-content-color);
                                        padding: 2px 6px;
                                        border-radius: 12px;
                                        font-size: 10px;
                                        font-weight: 500;
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                    ">${issue.apiName}</span>
                                </div>
                                <div class="issue-message">${issue.message || 'Governance issue found'}</div>
                                <div class="issue-location">
                                    📍 ${issue.path || 'No path specified'} ${issue.line ? `(Line ${issue.line}${issue.column ? `, Column ${issue.column}` : ''})` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>

    <!--Buffer-->
    <div style="height: 100px"></div>
</div>



<script>
    /**
     * Add footer to each tab content (EXACT copy from original functionality)
     */
    function appendFooterToTabContent() {
        const tabContents = document.querySelectorAll('.tab-content');

        function createUniqueFooter(index) {
            return \`
                <div class="footer-icon-container">
                <svg style="fill:none" viewBox="0 0 122 118" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><linearGradient id="a" gradientUnits="userSpaceOnUse" style=""><stop offset="0" style="stop-color:#ff7002"/><stop offset=".2" style="stop-color:#fc7807"/><stop offset=".51" style="stop-color:#f78e18"/><stop offset=".89" style="stop-color:#eeb332"/><stop offset="1" style="stop-color:#ebc03b"/></linearGradient><linearGradient id="b" style="" x1="58" x2="67" xlink:href="#a" y1="39.7" y2="39.7"/><linearGradient id="c" gradientUnits="userSpaceOnUse" style="" x1="59.5" x2="59.5" y1="33.7" y2="36.1"><stop offset="0" style="stop-color:#ff6c37"/><stop offset="1" style="stop-color:#ffb400"/></linearGradient><linearGradient id="d" style="" x1="87.6" x2="93.9" xlink:href="#a" y1="28" y2="16.5"/><linearGradient id="e" style="" x1="72" x2="75.2" xlink:href="#a" y1="14.8" y2="8.9"/><clipPath id="f" style=""><path d="m.7.4h120.6v117.6h-120.6z" style=""/></clipPath><g style="clip-path:url(#f)"><path d="m55.3 43.7v-11.9c0-.9.7-1.6 1.6-1.6h7m5.8 5.3v8.5m-5.6-13.7 5.5 5-5.5-.2z" style="stroke:#686868;stroke-linecap:round;stroke-linejoin:round"/><path d="m67 38.6h-9.1v2.4h9.1z" style="fill-opacity:.7;fill:url(#b)"/><path d="m61 33.7h-3.1v2.4h3.1z" style="opacity:.7;fill:url(#c)"/><path d="m67 38.6h-9.1v2.4h9.1zm-6-4.8h-3.1v2.4h3.1z" style="stroke:#686868;stroke-linecap:round;stroke-linejoin:round"/><path d="m62 113.7c0 2.4-13.7 4.3-30.7 4.3s-30.7-1.9-30.7-4.3c0-1.2 2.7-2.3 8.2-3 1.1-.1 1.8 4.5 3.9 4.3 1.4-.1 1.8 1.8 5.4.7 7.7-2.3 5.9-6.5 6.7-6.5 2.9-.1 3.3.1 6.5.1h2.9c.7 0 1.4 3.8 2.7 4.7.9.6 3.6 1.4 6 1.3 2-.1 2.6-2 3.6-2.5.7-.4 1.8-3.4 2.6-3.3 8.7.8 12.8 2.7 12.8 4.2z" style="fill:#262626;opacity:.3"/><path d="m39.4 47.4c-1.9.7-4 1.2-6.1 1.4-.3 0-1.4-.1-1.7-.1m-12.1-3.9-.9-.8c-4.7-4.1-7.5-10.3-7-17.2.8-10.3 9.3-18.6 19.6-19.2 12-.7 21.9 8.9 21.9 20.8 0 1-.1 2.1-.3 3.2-.9 5.1-3.8 9.5-7.7 12.5" style="stroke:#686868;stroke-linecap:round;stroke-linejoin:round"/><path d="m18.9 8.6a3 3 0 100-5.9 3 3 0 000 5.9" style="fill:#ff6c37;opacity:.7"/><g style="stroke:#686868;stroke-linecap:round;stroke-linejoin:round"><path d="m18.9 8.6a3 3 0 100-5.9 3 3 0 000 5.9m1.6-.5 1.4 2.3m17.8 44.7-.5-2.1c-.2-1 .5-1.9 1.5-1.9h36.6c.9 0 1.6.8 1.5 1.7l-4.5 27.9c-.1.7-.7 1.3-1.5 1.3h-27.9a1.5 1.5 0 01-1.5-1.2l-2-9.5m7.3-31.5c-6.4-2.1-9.7-9.1-8.5-15.8.8-4.3 4-7.4 8.3-8.9m-21.3 18.4a3.1 3.1 0 100-6.2 3.1 3.1 0 000 6.2m5.6 52.5-2 .9a10.8 10.8 0 00-6.3 9.9l.1 11.6c0 3.9-3.2 7.1-7.1 7.1h-.9c-3.8 0-7-3.1-7.1-6.9l-.2-9.8c-.1-3.4-.2-10.1-.1-13.5.3-11.7 1.2-25.2 4.5-35.6l2.6-8.3" style=""/><path d="m28.6 65.2s-10.9 11.8-18.2 2.3m14.9-6s-8.7 8.7-14.2.7" style=""/><path d="m9.5 71.4-3.6-.4c-2.3-.2-4.1-2.2-4.1-4.6.1-8.7 3.3-18.8 5.5-24.6a3.5 3.5 0 014.6-2.1l4 1.6m29.4 40.5s1.3 13.2 3.9 23.8c1.2 4.9-2.5 9.7-7.6 9.7a7.8 7.8 0 01-7.8-6.7l-3.1-21.8m1.2-38.3s8.6 9.6 22.6 13.4c3.3.9 5.5 4.2 4.8 7.6-.7 3.6-4.3 6.2-7.8 5.1-9.5-3.2-21.8-6.7-26.1-13.5" style=""/><path d="m13.7 49.8s1.8-6.1 9.9-4.5c0 0 6.8 1.5 10 5m43.1-6h-36.5a.7.7 0 00-.7.7v2.5c0 .4.3.7.7.7h36.5a.7.7 0 00.7-.7v-2.5a.7.7 0 00-.7-.7" style=""/></g><path d="m96.3 17.8-4.8-2.6a1.8 1.8 0 00-1.8 0l-4.7 2.8c-.6.3-.9.9-.9 1.6l.1 5.5c0 .7.4 1.2.9 1.5l4.8 2.6c.6.3 1.3.3 1.8 0l4.7-2.8c.6-.3.9-.9.9-1.6l-.1-5.5a1.8 1.8 0 00-.9-1.5" style="fill-opacity:.8;fill:url(#d)"/><path d="m96.3 17.8-4.8-2.6a1.8 1.8 0 00-1.8 0l-4.7 2.8c-.6.3-.9.9-.9 1.6l.1 5.5c0 .7.4 1.2.9 1.5l4.8 2.6c.6.3 1.3.3 1.8 0l4.7-2.8c.6-.3.9-.9.9-1.6l-.1-5.5a1.8 1.8 0 00-.9-1.5" style="stroke:#686868;stroke-linecap:round;stroke-linejoin:round"/><path d="m76.5 9.6-2.5-1.4a.9.9 0 00-.9 0l-2.4 1.5a.9.9 0 00-.4.8l.1 2.8a.9.9 0 00.5.8l2.5 1.4c.3.2.7.2.9 0l2.4-1.5a.9.9 0 00.4-.8l-.1-2.8a.9.9 0 00-.5-.8" style="fill-opacity:.8;fill:url(#e)"/><g style="stroke:#686868;stroke-linecap:round;stroke-linejoin:round"><path d="m76.5 9.6-2.5-1.4a.9.9 0 00-.9 0l-2.4 1.5a.9.9 0 00-.4.8l.1 2.8a.9.9 0 00.5.8l2.5 1.4c.3.2.7.2.9 0l2.4-1.5a.9.9 0 00.4-.8l-.1-2.8a.9.9 0 00-.5-.8m-1.7 30.6s-1.5-9.2 6.6-13.6m-3.2 7.5c1-1.9 2.6-3.7 5.1-5.1m12 33.9c4.2 0 7.6-3.4 7.6-7.6s-3.4-7.6-7.6-7.6-7.6 3.4-7.6 7.6 3.4 7.6 7.6 7.6" style=""/><path d="m95.1 56.6c1.6 0 2.9-1.3 2.9-2.9s-1.3-2.9-2.9-2.9a2.9 2.9 0 00-2.9 2.9c0 1.6 1.3 2.9 2.9 2.9m-5 4.2c.4-2.3 2.4-4 4.8-4s4.6 1.9 4.9 4.3m13.4-45.1c4.2 0 7.6-3.4 7.6-7.6s-3.4-7.6-7.6-7.6-7.6 3.4-7.6 7.6 3.4 7.6 7.6 7.6" style=""/><path d="m113.1 9.6c1.6 0 2.9-1.3 2.9-2.9s-1.3-2.9-2.9-2.9a2.9 2.9 0 00-2.9 2.9c0 1.6 1.3 2.9 2.9 2.9m-5 4.2c.4-2.3 2.4-4 4.8-4s4.6 1.9 4.9 4.3m-76.3 34.4v2.5m71.2-13.5 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9.9-2.2z" style=""/></g><path d="m87.5 3.5 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8.7-1.8z" style="fill:#686868"/></g></svg>                </div> 
                <div class="footer-text-container">
                    <h4 class="footer-title">
                        View your API lint reports in Postman
                    </h4>
                    <p class="footer-content">
                        Debug faster and improve API quality by viewing lint reports in Postman. Share API analysis with your team and collaborate on fixes right from one place.
                        <a href="https://go.pstmn.io/view-postman-api-lint-results" target="_blank" rel="noopener noreferrer" 
                           style="font-size: 12px;text-decoration-line: underline;text-decoration-style: solid;text-underline-offset: auto;text-decoration-thickness: auto;text-underline-position: from-font;text-decoration-skip-ink: none;">
                            Learn more
                        </a>
                    </p>
                </div>
            \`;
        }

        // Add footer to each tab content (EXACT functionality from original)
        tabContents.forEach((content, index) => {
            const contentContainer = content.firstElementChild,
                  footerContainer = document.createElement('footer');

            footerContainer.classList.add('footer');
            footerContainer.innerHTML = createUniqueFooter(index);
            contentContainer.appendChild(footerContainer);
        });
    }

    /**
     * Update tooltip visibility (CRITICAL missing function from original)
     */
    function updateTooltipVisibility() {
        try {
            const containers = document.querySelectorAll('.tooltip-container.text-overflow-tooltip');

            containers.forEach((container) => {
                const trigger = container.querySelector('.tooltip-trigger');

                if (!trigger) {
                    return;
                }

                if (trigger.offsetParent !== null && trigger.offsetWidth >= trigger.scrollWidth) {
                    container.classList.remove('tooltip-container');
                }
            });
        }
        catch (err) {
            console.error('error managing tooltip visibility', err);
        }
    }

    /**
     * Tab switching functionality (exact copy from original)
     */
    function switchTab(tabIndex) {
        const tab_buttons = document.getElementsByClassName('tab-button'),
              tab_contents = document.getElementsByClassName('tab-content');

        for (let j = 0; j < tab_buttons.length; j++) {
            tab_buttons[j].classList.remove('active');
            tab_contents[j].style.display = 'none';
        }

        tab_buttons[tabIndex].classList.add('active');
        tab_contents[tabIndex].style.display = 'block';
        updateTooltipVisibility(); // CRITICAL: Update tooltips on tab switch
    }

    /**
     * Initialize tab navigation system (exact copy from original)
     */
    function initializeTabs() {
        const tab_buttons = document.getElementsByClassName('tab-button');

        // Activate first tab by default
        tab_buttons[0].classList.add('active');
        document.getElementsByClassName('tab-content')[0].style.display = 'block';

        for (let i = 0; i < tab_buttons.length; i++) {
            tab_buttons[i].addEventListener('click', () => { return switchTab(i); });
        }
    }

    /**
     * Enhanced filtering functionality for multi-API All Issues tab
     */
    function initializeIssueFilters() {
        const filterButtons = document.querySelectorAll('.filter-button');
        const apiFilter = document.getElementById('api-filter');
        const issues = document.querySelectorAll('[data-severity]');

        let currentSeverityFilter = 'all';
        let currentApiFilter = 'all';

        // Severity filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update button states
                filterButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                
                currentSeverityFilter = button.dataset.severity;
                applyFilters();
            });
        });

        // API dropdown filter
        if (apiFilter) {
            apiFilter.addEventListener('change', (e) => {
                currentApiFilter = e.target.value;
                applyFilters();
            });
        }

        // Apply both filters
        function applyFilters() {
            issues.forEach(issue => {
                if (issue.classList.contains('filter-button') || issue.classList.contains('api-filter')) return; // Skip filter elements
                
                const matchesSeverity = currentSeverityFilter === 'all' || issue.dataset.severity === currentSeverityFilter;
                const matchesApi = currentApiFilter === 'all' || issue.dataset.api === currentApiFilter;
                
                if (matchesSeverity && matchesApi) {
                    issue.style.display = 'block';
                } else {
                    issue.style.display = 'none';
                }
            });
        }

        // Expose function globally for API name clicks
        window.applyFilters = applyFilters;
        window.currentApiFilter = currentApiFilter;
        window.setApiFilter = function(apiName) {
            currentApiFilter = apiName;
            if (apiFilter) {
                apiFilter.value = apiName;
            }
            applyFilters();
        };
    }

    /**
     * Navigate to All Issues tab and filter by specific API
     */
    function showApiIssues(apiName) {
        // Switch to All Issues tab (tab index 1)
        switchTab(1);
        
        // Apply API filter
        window.setApiFilter(apiName);
    }

    // Initialize all functionality (EXACT pattern from original)
    document.addEventListener('DOMContentLoaded', () => {
        appendFooterToTabContent();
        initializeTabs();
        initializeIssueFilters();
        updateTooltipVisibility(); // CRITICAL: Initialize tooltips like the original
    });
    
    console.log('Multi-API Governance Report Data:', ${JSON.stringify(data, null, 2)});
</script>
</body>
</html>`;
    }
}

// Main function for command line execution
async function main() {
    const args = process.argv.slice(2);

    // Parse arguments
    const options = {};
    let reportFormat = null;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '-r' && i + 1 < args.length) {
            reportFormat = args[i + 1];
            i++; // Skip the next argument since it's the format value
        } else if (arg.startsWith('--')) {
            const key = arg.replace('--', '');
            const value = args[i + 1];
            options[key] = value;
            i++; // Skip the next argument since it's the value
        }
    }

    // Validate report format
    if (!reportFormat || (reportFormat !== 'json' && reportFormat !== 'html')) {
        console.error('Error: Report format must be specified with -r json or -r html');
        process.exit(1);
    }

    const apiKey = getPostmanApiKey();
    if (!apiKey) {
        console.error('Error: No Postman API key found. Please login with: postman login --with-api-key YOUR_KEY');
        process.exit(1);
    }

    const scorer = new GovernanceScorer(apiKey);

    try {
        let report = [];

        if (options.type === 'local') {
            if (options.dir) {
                report = await scorer.getDirectoryGovernanceReport(options.dir);
            } else if (options.api) {
                // For single file, create a report with one item
                const result = await scorer.scoreSpecFile(options.api);
                report = [{
                    name: require('path').basename(options.api),
                    path: options.api,
                    score: result.score,
                    violationsCount: result.violationCount || 0,
                    status: result.score >= 70 ? 'PASS' : 'FAIL',
                    error: result.error,
                    issues: result.issues || [],
                    summary: result.summary || scorer.summarizeIssues(result.issues || []),
                    api: require('path').basename(options.api),
                    timestamp: new Date().toISOString()
                }];
            } else {
                console.error('Error: Local analysis requires --dir or --api argument');
                process.exit(1);
            }
        } else if (options.type === 'api') {
            if (options.workspace) {
                console.error('Error: Workspace API analysis not implemented in unified.js');
                process.exit(1);
            } else {
                console.error('Error: API analysis requires --workspace argument');
                process.exit(1);
            }
        } else if (options.type === 'spec') {
            if (options.workspace) {
                console.error('Error: Workspace spec analysis not implemented in unified.js');
                process.exit(1);
            } else if (options.spec) {
                console.error('Error: Individual spec analysis not implemented in unified.js');
                process.exit(1);
            } else {
                console.error('Error: Spec analysis requires --workspace or --spec argument');
                process.exit(1);
            }
        } else {
            console.error('Error: Invalid type. Use --type local|api|spec');
            process.exit(1);
        }

        // Prepare report data for both JSON and HTML output
        const reportData = {
            mode: scorer.mode,
            teamDomain: scorer.teamDomain,
            workspaceId: scorer.workspaceId,
            timestamp: new Date().toISOString(),
            totalApis: report.length,
            passCount: report.filter(api => api.status === 'PASS').length,
            failCount: report.filter(api => api.status === 'FAIL').length,
            avgScore: report.length > 0 ? report.reduce((sum, api) => sum + api.score, 0) / report.length : 0,
            aggregatedStats: {
                total: report.reduce((sum, api) => sum + (api.summary?.total || 0), 0),
                error: report.reduce((sum, api) => sum + (api.summary?.error || 0), 0),
                warn: report.reduce((sum, api) => sum + (api.summary?.warn || 0), 0),
                info: report.reduce((sum, api) => sum + (api.summary?.info || 0), 0),
                hint: report.reduce((sum, api) => sum + (api.summary?.hint || 0), 0)
            },
            apis: report,
            allIssues: report.flatMap(api =>
                (api.issues || []).map(issue => ({
                    ...issue,
                    apiName: api.name,
                    apiStatus: api.status
                }))
            )
        };

        // Generate report in requested format
        const userWorkingDir = process.env.USER_WORKING_DIR || process.cwd();
        const timestamp = Date.now();

        if (reportFormat === 'json') {
            const outputFile = `governance-report-${timestamp}.json`;
            console.log(`\nGenerating JSON report to ${outputFile}...`);
            const outputPath = require('path').join(userWorkingDir, outputFile);
            require('fs').writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
            console.log(`JSON report saved to ${outputFile}`);
        } else if (reportFormat === 'html') {
            const outputFile = `governance-report-${timestamp}.html`;
            console.log(`\nGenerating HTML dashboard to ${outputFile}...`);
            const htmlContent = await scorer.generateMultiApiHtmlTemplate(reportData);
            const outputPath = require('path').join(userWorkingDir, outputFile);
            require('fs').writeFileSync(outputPath, htmlContent);
            console.log(`HTML dashboard saved to ${outputFile}`);
        }

        console.log(`\nReport summary: ${report.length} APIs analyzed, ${reportData.passCount} passed, ${reportData.failCount} failed`);

    } catch (error) {
        console.error('Governance analysis error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = GovernanceScorer;
module.exports.main = main;