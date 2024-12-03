FROM node:18-alpine3.18

RUN echo "------------------------ START PREBUILD ---------------------------"

# Dependencies needed to retrieve metadata on files
RUN apk --update add perl pkgconfig

WORKDIR /app

COPY . /app

RUN yarn workspaces focus core && yarn workspace core build

# Install apps
CMD ["sh", "/app/scripts/apps_install.sh"]

RUN echo "------------------------ END PREBUILD ---------------------------"
