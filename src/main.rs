use std::env;
use std::fs;
use std::path::Path;
use std::process::{Command, exit};
use tempfile::TempDir;

// Embed the JavaScript files and original binary at compile time
// These will be populated by the build script
static UNIFIED_JS: &[u8] = include_bytes!("../embedded/unified.js");
static CLI_WRAPPER_JS: &[u8] = include_bytes!("../embedded/cli-wrapper.js");
static ORIGINAL_BINARY: &[u8] = include_bytes!("../embedded/postman-cli");

fn main() {
    let args: Vec<String> = env::args().collect();

    // Check if this is a lint command with -r flag for governance reporting
    let is_governance_mode = args.contains(&"lint".to_string()) && args.contains(&"-r".to_string());

    if is_governance_mode {
        run_governance_mode(&args[1..]);
    } else {
        run_original_cli(&args[1..]);
    }
}

fn run_governance_mode(args: &[String]) {
    // Create temporary directory for extracted files
    let temp_dir = match TempDir::new() {
        Ok(dir) => dir,
        Err(e) => {
            eprintln!("Failed to create temporary directory: {}", e);
            exit(1);
        }
    };

    // Create the directory structure expected by the wrapper
    let cli_dir = temp_dir.path().join("cli");
    if let Err(e) = fs::create_dir_all(&cli_dir) {
        eprintln!("Failed to create cli directory: {}", e);
        exit(1);
    }

    // Extract Postman CLI to expected location (cli/postman)
    let postman_binary_path = cli_dir.join("postman");
    if let Err(e) = fs::write(&postman_binary_path, ORIGINAL_BINARY) {
        eprintln!("Failed to extract Postman CLI binary: {}", e);
        exit(1);
    }

    // Make the binary executable
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if let Err(e) = fs::set_permissions(&postman_binary_path, fs::Permissions::from_mode(0o755)) {
            eprintln!("Failed to make Postman CLI executable: {}", e);
            exit(1);
        }
    }

    // Extract JavaScript files to temp directory
    let unified_path = temp_dir.path().join("unified.js");
    let wrapper_path = temp_dir.path().join("cli-wrapper.js");

    if let Err(e) = fs::write(&unified_path, UNIFIED_JS) {
        eprintln!("Failed to extract unified.js: {}", e);
        exit(1);
    }

    if let Err(e) = fs::write(&wrapper_path, CLI_WRAPPER_JS) {
        eprintln!("Failed to extract cli-wrapper.js: {}", e);
        exit(1);
    }

    // Find Node.js executable
    let node_cmd = match which::which("node") {
        Ok(path) => path,
        Err(_) => {
            eprintln!("Error: Node.js not found in PATH. Please install Node.js to use governance features.");
            exit(1);
        }
    };

    // Capture user's original working directory before changing
    let original_working_dir = env::current_dir().unwrap_or_else(|_| Path::new("/").to_path_buf());

    // Run the governance wrapper
    let mut cmd = Command::new(node_cmd);
    cmd.arg(wrapper_path.to_str().unwrap());
    cmd.args(args);
    cmd.current_dir(temp_dir.path());

    // Set environment variables
    cmd.env("POSTMAN_ENHANCED_TEMP", temp_dir.path());
    cmd.env("USER_WORKING_DIR", original_working_dir);

    match cmd.status() {
        Ok(status) => {
            if let Some(code) = status.code() {
                exit(code);
            } else {
                exit(1);
            }
        }
        Err(e) => {
            eprintln!("Failed to execute governance wrapper: {}", e);
            exit(1);
        }
    }

    // temp_dir is automatically cleaned up when it goes out of scope
}

fn run_original_cli(args: &[String]) {
    // Create temporary directory for extracted binary
    let temp_dir = match TempDir::new() {
        Ok(dir) => dir,
        Err(e) => {
            eprintln!("Failed to create temporary directory: {}", e);
            exit(1);
        }
    };

    // Extract original Postman CLI binary
    let binary_path = temp_dir.path().join("postman-cli");

    if let Err(e) = fs::write(&binary_path, ORIGINAL_BINARY) {
        eprintln!("Failed to extract original binary: {}", e);
        exit(1);
    }

    // Make the binary executable (Unix systems)
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if let Err(e) = fs::set_permissions(&binary_path, fs::Permissions::from_mode(0o755)) {
            eprintln!("Failed to make binary executable: {}", e);
            exit(1);
        }
    }

    // Execute the original Postman CLI
    let mut cmd = Command::new(&binary_path);
    cmd.args(args);
    cmd.current_dir(env::current_dir().unwrap_or_else(|_| Path::new("/").to_path_buf()));

    match cmd.status() {
        Ok(status) => {
            if let Some(code) = status.code() {
                exit(code);
            } else {
                exit(1);
            }
        }
        Err(e) => {
            eprintln!("Failed to execute Postman CLI: {}", e);
            exit(1);
        }
    }

    // temp_dir is automatically cleaned up when it goes out of scope
}