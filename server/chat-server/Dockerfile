# syntax=docker/dockerfile:1
FROM node:12.18.1-alpine

WORKDIR /app
COPY ["package.json", "package-lock.json*", "tsconfig.json", "./"]
RUN npm install --production
COPY . .
CMD [ "npm", "run", "build" ]
CMD [ "node", "./dist/index.js" ]
