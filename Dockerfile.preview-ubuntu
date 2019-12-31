FROM ubuntu

RUN apt-get clean 
RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y npm 
RUN apt-get install -y imagemagick
RUN apt-get install -y ffmpeg 
RUN apt-get install -y unoconv 

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