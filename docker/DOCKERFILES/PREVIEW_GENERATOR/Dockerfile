FROM node:24.14.1-alpine3.23

# imagemagick is used to convert images
# ffmpeg is used to convert videos
# inkscape is used to convert svg
# ghostscript is by imagemagick for pdf detection/conversion
# libreoffice and unoconv are used to convert documents
RUN apk add --upgrade --no-cache imagemagick~=7.1 ffmpeg inkscape ghostscript

ENV UNO_URL https://raw.githubusercontent.com/dagwieers/unoconv/master/unoconv

# Install unoconv
RUN apk --no-cache add \
    curl \
    util-linux \
    libreoffice-common \
    libreoffice-base \
    libreoffice-connector-postgres \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-draw \
    libreoffice-impress \
    libreoffice-math \
    libreofficekit \
    font-droid-nonlatin \
    font-droid \
    ttf-dejavu \
    ttf-freefont \
    ttf-liberation \
    # for unoconv
    py3-setuptools \
    && curl -Ls $UNO_URL -o /usr/local/bin/unoconv \
    && chmod +x /usr/local/bin/unoconv \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && apk del curl \
    && rm -rf /var/cache/apk/*

# set working dir
WORKDIR /app/apps/preview-generator

COPY ./package.json .
