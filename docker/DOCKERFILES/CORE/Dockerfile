FROM node:18-alpine3.18

# Dependencies needed to retrieve metadata on files
RUN apk --update add perl pkgconfig

WORKDIR /app/apps/core

COPY ./package.json .
