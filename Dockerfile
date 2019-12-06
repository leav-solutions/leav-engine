FROM ubuntu

RUN apt-get clean 
RUN apt-get update
RUN apt-get install -y npm imagemagick ffmpeg unoconv

# set working dir
WORKDIR /app

# Allow to convert PDF with ImageMagick
RUN sed -i_bak \
    's/rights="none" pattern="PDF"/rights="read | write" pattern="PDF"/' \
    /etc/ImageMagick-6/policy.xml

# Allow to convert EPS with ImageMagick
RUN sed -i_bak \
    's/rights="none" pattern="EPS"/rights="read | write" pattern="EPS"/' \
    /etc/ImageMagick-6/policy.xml