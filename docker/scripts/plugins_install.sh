pluginsFolder=/app/apps/core/dist/plugins

if find "$pluginsFolder" -mindepth 1 -maxdepth 1 | read; then
    for plugin in "$pluginsFolder"/*/; do
  	echo "Install dependencies for $plugin"
        touch "$plugin"yarn.lock
        yarn --cwd "$plugin" install
    done
fi
