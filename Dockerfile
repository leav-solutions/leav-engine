FROM alpine:3.10.3

# imagemagick is use for image
# ffmpeg is use for convert video
# inkscape is use to convert svg, imageMagick can't do it correctly
RUN apk add npm imagemagick ffmpeg inkscape

ENV UNO_URL https://raw.githubusercontent.com/dagwieers/unoconv/master/unoconv

# Install unoconv
RUN apk --no-cache add bash mc openjdk8 \
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
    ttf-droid-nonlatin \
    ttf-droid \
    ttf-dejavu \
    ttf-freefont \
    ttf-liberation \
    && curl -Ls $UNO_URL -o /usr/local/bin/unoconv \
    && chmod +x /usr/local/bin/unoconv \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && apk del curl \
    && rm -rf /var/cache/apk/*

# set working dir
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

