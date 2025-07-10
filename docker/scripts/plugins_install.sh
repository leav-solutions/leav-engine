pluginsFolder=/app/apps/core/dist/plugins

# By default, that should be yarn@1 in base nodejs docker image
yarn --version

find $pluginsFolder -name package.json -not -path "*/node_modules/*" -exec sh -c '
  echo "🚧 Install dependencies for plugin $(basename $(dirname {}))"
  (cd $(dirname {}) && touch yarn.lock && yarn install --production --non-interactive)
' \;

yarn cache clean
