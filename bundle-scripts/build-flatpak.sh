#!/bin/bash
CURL=$(which curl)
FLATPAK_BUILDER=$(which flatpak-builder)
GIT=$(which git)
PYTHON=$(which python3)
PIP=$(which pip3)

error() {
    echo -e "\033[31m$1\033[0m" # Print the message in red
}

error_and_exit() {
    error "$1"
    exit 1
}

info() {
    echo -e "\033[34m$1\033[0m" # Print the message in blue
}

success() {
    echo -e "\033[32m$1\033[0m" # Print the message in green
}

dbg() {
    first_word=$(echo "$1" | cut -d"_" -f1)
    if [ $(echo "$1" | cut -c1) != "[" ] && [ "$first_word" != "error" ] && [ "$first_word" != "info" ] && [ "$first_word" != "success" ]; then
        echo -e "\033[90mRunning: $1\033[0m" # Print the message in gray
    fi
}

# Generates debug messages for each command executed
trap 'dbg "$BASH_COMMAND"; this_command=$BASH_COMMAND' DEBUG

if [ -z "$CURL" ]; then
    error_and_exit "curl is not installed. Please install curl to proceed."
    exit 1
fi
if [ -z "$FLATPAK_BUILDER" ]; then
    error_and_exit "flatpak-builder is not installed. Please install flatpak-builder to proceed."
    exit 1
fi
if [ -z "$GIT" ]; then
    error_and_exit "git is not installed. Please install git to proceed."
    exit 1
fi
if [ -z "$PYTHON" ]; then
    error_and_exit "python3 is not installed. Please install python3 to proceed."
    exit 1
fi
if [ -z "$PIP" ]; then
    error_and_exit "pip3 is not installed. Please install pip3 to proceed."
    exit 1
fi


info "Downloading flatpak-cargo-generator.py script from flatpak-builder-tools repository..."
$CURL --location -o flatpak-cargo-generator.py "https://raw.githubusercontent.com/flatpak/flatpak-builder-tools/refs/heads/master/cargo/flatpak-cargo-generator.py"
if [ $? -ne 0 ]; then
    error_and_exit "Failed to download flatpak-cargo-generator.py."
    exit 1
else 
    success "flatpak-cargo-generator.py downloaded successfully."
fi


info "Installing flatpak_node_generator scripts from flatpak-builder-tools repository..."
$PIP install "git+https://github.com/flatpak/flatpak-builder-tools.git#subdirectory=node"
if [ $? -ne 0 ]; then
    error_and_exit "Failed to install flatpak_node_generator."
    exit 1
else 
    success "flatpak_node_generator installed successfully."
fi

info "Generating cargo-sources.json from Cargo.lock..."
$PYTHON ./flatpak-cargo-generator.py ../src-tauri/Cargo.lock -o cargo-sources.json 
if [ $? -ne 0 ]; then
    error_and_exit "Failed to generate cargo-sources.json."
    exit 1
else
    success "cargo-sources.json generated successfully."
fi

info "Generating node-sources.json from package-lock.json..."
$PYTHON -m flatpak_node_generator --output="npm-sources.json" --no-trim-index -s npm ../package-lock.json
if [ $? -ne 0 ]; then
    error_and_exit "Failed to generate node-sources.json."
    exit 1
else
    success "node-sources.json generated successfully."
fi

# info "Calling flatpak-builder to build the flatpak"
# $FLATPAK_BUILDER --arch="x86_64" --delete-build-dirs --force-clean --sandbox --user --install --install-deps-from=flathub --mirror-screenshots-url=https://dl.flathub.org/media/ --ccache --repo=local_repo build-dir net.charlesschaefer.addictiontracker.yml
# if [ $? -ne 0 ]; then
#     error "Failed to build the flatpak!"
#     info "Fix the errors described above and try again by running the following command:"
#     info "\t$FLATPAK_BUILDER --arch=\"x86_64\" --delete-build-dirs --force-clean --sandbox --user --install --install-deps-from=flathub --ccache --repo=local_repo build-dir net.charlesschaefer.addictiontracker.yml"
#     exit 1
# fi

info "Copying the flatpak files to the flathub directory"
cp cargo-sources.json npm-sources.0.json net.charlesschaefer.addictiontracker.yml ../../flathub/
if [ $? -ne 0 ]; then
    error_and_exit "Failed to copy the flatpak files to the flathub directory."
    exit 1
else
    success "Flatpak files copied successfully to the flathub directory."
fi

success "Flatpak build completed successfully."
