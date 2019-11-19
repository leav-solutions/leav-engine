FROM alpine

RUN apk update && apk upgrade
RUN apk add nodejs npm imagemagick curl ffmpeg

# set working dir
WORKDIR /app
