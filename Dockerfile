# syntax=docker/dockerfile:1

FROM node:16-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

# https://typicode.github.io/husky/#/?id=with-npm
RUN npm ci --omit=dev --ignore-scripts

COPY . .

CMD [ "node", "index.js" ]

LABEL org.opencontainers.image.description="A tool for managing GitHub issues and pull requests via ChatOps. It uses GitHub webhooks to scale across repositories without needing to add a GitHub action to each of them."
LABEL org.opencontainers.image.vendor="@timja"
LABEL org.opencontainers.image.source="https://github.com/timja/github-issue-chatops"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.url="https://github.com/timja/github-issue-chatops"
