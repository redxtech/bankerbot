FROM node:latest

WORKDIR /app/bankerbot

COPY package*.json /app/bankerbot

RUN npm ci

COPY . .

RUN npm run build

CMD ["node", "dist/main.js"]
