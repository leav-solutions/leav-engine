# Install dependencies
echo "Install apps dependencies"
yarn install

# Install plugins dependencies
for plugin in ./src/plugins/*/; do
  echo "Install dependencies for $plugin"
  yarn --cwd "$plugin" install
done

yarn run db:migrate:dev

# Start the server
yarn run start:watch