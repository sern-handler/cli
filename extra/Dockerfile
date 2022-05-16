FROM node:latest

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN tsc --build

RUN node dist/index.js