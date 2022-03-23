# syntax=docker/dockerfile:1
FROM node:12.18.1-alpine as base

WORKDIR /app
COPY ["package.json", "package-lock.json*", "tsconfig.json", "nodemon.json", "./"]
EXPOSE 8080

FROM base as prod
RUN npm ci
COPY . /app
CMD ["npm", "start"]

FROM base as dev
RUN npm install -g nodemon && npm install
COPY . /app
CMD ["npm", "run", "dev"]
