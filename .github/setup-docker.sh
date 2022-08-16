# expect `cwd` at repo root

# https://stackoverflow.com/questions/60171603/enable-experimental-features-on-github-workflow-images/60454218#60454218
echo '{ "experimental": true, "features": { "buildkit": true } }' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker

echo '"drjs/debian"' > source/debian11/BUILD_REPO.json
echo '"ghcr.io/dr-js/debian"' > source/debian11/BUILD_REPO_GHCR.json
echo '"drjs/debian"' > source/debian12/BUILD_REPO.json
echo '"ghcr.io/dr-js/debian"' > source/debian12/BUILD_REPO_GHCR.json
