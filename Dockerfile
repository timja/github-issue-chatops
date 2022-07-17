# syntax=docker/dockerfile:1

FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

# https://typicode.github.io/husky/#/?id=with-npm
RUN npm ci --omit=dev --ignore-scripts

COPY . .

CMD [ "node", "index.js" ]
