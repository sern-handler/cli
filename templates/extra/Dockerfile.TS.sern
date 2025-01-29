FROM node:latest

RUN npm install -g @sern/cli typescript@latest

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN sern build

CMD node dist/index.js
