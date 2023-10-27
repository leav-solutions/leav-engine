FROM node:18-alpine

RUN echo "------------------------ START PREBUILD ---------------------------"

# Dependencies needed to retrieve metadata
RUN apk --update add alpine-sdk perl pkgconfig poppler poppler-dev poppler-utils

# Launch app install script
# CMD ["sh", "/app/scripts/prebuild.sh", "--prebuild"]

WORKDIR /app

COPY . /app

RUN chmod +x ./docker/scripts/prebuild.sh

CMD ["sh","/app/docker/scripts/prebuild.sh"]

#CMD ["sh", "-c", "tail -f /dev/null"]

RUN echo "------------------------ END PREBUILD ---------------------------"
