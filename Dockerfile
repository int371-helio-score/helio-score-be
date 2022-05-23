FROM node:12
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENTRYPOINT [ "node", "./helper/generateKey.js" ]

EXPOSE 3000

CMD ["node", "dist/main"]