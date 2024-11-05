pluginsFolder=/app/apps/core/dist/plugins

find $pluginsFolder -name package.json -not -path "*/node_modules/*" -exec sh -c '
  echo "🚧 Install dependencies for plugin $(basename $(dirname {}))"
  (cd $(dirname {}) && touch "$plugin"yarn.lock && yarn install)
' \;