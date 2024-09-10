FROM node:20.17.0 as base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM base as api

WORKDIR /app

EXPOSE 8080

CMD ["npm","run", "dev"]


FROM api as worker

WORKDIR /app

CMD ["npm", "run", "dev-worker"]