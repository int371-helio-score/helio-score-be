FROM node:12
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
RUN node ./helper/generateKey.js
CMD ["node", "dist/main"]