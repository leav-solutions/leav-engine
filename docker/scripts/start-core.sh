# Install dependencies
yarn install

# Start the server
yarn run db:migrate

# To avoid permissions issues later on, in particular during applications install
chown -R node:node /app

yarn run start:watch