FROM node:24-alpine3.21

# Dependencies needed to retrieve metadata on files
RUN apk --update add perl pkgconfig

WORKDIR /app/apps/core

COPY ./package.json .
