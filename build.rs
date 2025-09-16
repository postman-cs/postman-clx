use std::fs;
use std::path::Path;

fn main() {
    let embedded_dir = Path::new("embedded");

    // Create embedded directory if it doesn't exist
    if !embedded_dir.exists() {
        fs::create_dir_all(embedded_dir).expect("Failed to create embedded directory");
    }

    // Tell cargo to rerun this script if any of these files change
    println!("cargo:rerun-if-changed=scripts/unified.js");
    println!("cargo:rerun-if-changed=scripts/cli-wrapper.js");
    println!("cargo:rerun-if-changed=embedded/postman-cli");
    println!("cargo:rerun-if-changed=build.rs");

    // Copy files to embedded directory if they exist
    let files_to_embed = [
        ("scripts/unified.js", "embedded/unified.js"),
        ("scripts/cli-wrapper.js", "embedded/cli-wrapper.js"),
    ];

    for (src, dest) in files_to_embed.iter() {
        if Path::new(src).exists() {
            fs::copy(src, dest).expect(&format!("Failed to copy {} to {}", src, dest));
            println!("Embedded: {} -> {}", src, dest);
        } else {
            println!("Warning: {} not found, skipping", src);
        }
    }

    // Check for postman-cli binary (will be created by the modified build script)
    if Path::new("embedded/postman-cli").exists() {
        println!("Embedded: postman-cli binary found");
    } else {
        println!("Warning: embedded/postman-cli not found - will be created by build script");
    }
}