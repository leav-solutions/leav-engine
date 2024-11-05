# Install dependencies
echo "Install apps dependencies"
yarn install

# Install plugins dependencies
find ./src/plugins -name package.json -not -path "*/node_modules/*" -exec sh -c '
  echo "🚧 Install dependencies for plugin $(basename $(dirname {}))"
  (cd $(dirname {}) && yarn install)
' \;

yarn run db:migrate:dev

# Start the server
yarn run start:watch