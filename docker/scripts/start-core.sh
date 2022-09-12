# Install dependencies
yarn install

# To avoid permissions issues later on, in particular during applications install
chown -R node:node /app

# Start the server
yarn run db:migrate
yarn run start:watch