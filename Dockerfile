# syntax=docker/dockerfile:1

FROM node:16-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD [ "node", "index.js" ]

LABEL \
    org.opencontainers.image.description="A tool for managing GitHub issues and pull requests via ChatOps. It uses GitHub webhooks to scale across repositories without needing to add a GitHub action to each of them." \
    org.opencontainers.image.vendor="@timja" \
    org.opencontainers.image.source="https://github.com/timja/github-issue-chatops" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.url="https://github.com/timja/github-issue-chatops"

