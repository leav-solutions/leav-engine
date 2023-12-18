FROM node:18-alpine3.18

# Dependencies needed to retrieve metadata
RUN apk --update add alpine-sdk perl pkgconfig poppler=23.05.0-r0 poppler-dev=23.05.0-r0 poppler-utils=23.05.0-r0

WORKDIR /app/apps/core

COPY ./package.json .