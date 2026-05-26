FROM node:24.16.0-alpine3.23

# Dependencies needed to retrieve metadata on files
RUN apk --update add perl pkgconfig

WORKDIR /app/apps/core

COPY ./package.json .
