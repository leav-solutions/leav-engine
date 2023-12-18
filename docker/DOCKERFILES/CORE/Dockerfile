FROM node:18-alpine3.18

# Dependencies needed to retrieve metadata
RUN apk --update add alpine-sdk perl pkgconfig poppler poppler-dev poppler-utils

WORKDIR /app/apps/core

COPY ./package.json .