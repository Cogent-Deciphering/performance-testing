FROM node:16.13.2-alpine

# Create app directory
WORKDIR /usr/src/app

RUN apk update && apk add libstdc++ chromium \
    && rm -rf /var/cache/*

COPY package*.json ./

RUN npm install

COPY ./index.js ./

CMD [ "node", "index.js" ]
