FROM node:18-alpine3.18

RUN echo "------------------------ START PREBUILD ---------------------------"

# Dependencies needed to retrieve metadata
RUN apk --update add alpine-sdk perl pkgconfig poppler poppler-dev poppler-utils

WORKDIR /app

COPY . /app

RUN yarn workspaces focus core && yarn workspace core build

# Install apps
CMD ["sh", "/app/scripts/apps_install.sh"]

RUN echo "------------------------ END PREBUILD ---------------------------"
