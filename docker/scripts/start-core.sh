# Install dependencies
yarn install

# Install plugins dependencies
for plugin in ./src/plugins/*/; do
  yarn --cwd "$plugin" install
done

# Start the server
yarn run db:migrate:dev

# To avoid permissions issues later on, in particular during applications install
chown -R node:node /app

yarn run start:watch