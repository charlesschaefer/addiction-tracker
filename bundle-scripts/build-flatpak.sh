#!/bin/bash
CURL=$(which curl)
FLATPAK_BUILDER=$(which flatpak-builder)
GIT=$(which git)

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

# $CURL --location -o latest "https://github.com/charlesschaefer/addiction-tracker/releases/latest"
# if [ $? -ne 0 ]; then
#     error_and_exit "Failed to fetch the latest release information."
#     exit 1
# fi
# export VERSION=$(cat latest | sed -n -e "/App v/ {s/.*App v\([[:digit:]]\+.[[:digit:]]\+.[[:digit:]]\+\).*/\1/gp;q}");
# info "Current version of the app is $VERSION"
# info "Downloading the latest release Addiction.Tracker_"$VERSION"_amd64.deb file"
# $CURL --location -o addictiontracker.deb "https://github.com/charlesschaefer/addiction-tracker/releases/download/app-v"$VERSION"/Addiction.Tracker_"$VERSION"_amd64.deb"
# if [ $? -ne 0 ]; then
#     error_and_exit "Failed to download the Addiction Tracker .deb file."
#     exit 1
# fi

info "Installing flathub shared-modules from github"
$GIT submodule add --force https://github.com/flathub/shared-modules.git 
if [ $? -ne 0 ]; then
    error_and_exit "Failed to add the flathub shared-modules submodule."
    exit 1
fi

info "Calling flatpak-builder to build the flatpak"
$FLATPAK_BUILDER --arch="x86_64" --delete-build-dirs --force-clean --sandbox --user --install --install-deps-from=flathub --ccache --repo=local_repo build-dir net.charlesschaefer.addictiontracker.yml
if [ $? -ne 0 ]; then
    error "Failed to build the flatpak!"
    info "Fix the errors described above and try again by running the following command:"
    info "\t$FLATPAK_BUILDER --arch=\"x86_64\" --delete-build-dirs --force-clean --sandbox --user --install --install-deps-from=flathub --ccache --repo=local_repo build-dir net.charlesschaefer.addictiontracker.yml"
    exit 1
fi

success "Flatpak build completed successfully."