FROM node:16.13.2

WORKDIR /srv/app

COPY src .
RUN npm i

CMD [ "node", "index.mjs" ]
