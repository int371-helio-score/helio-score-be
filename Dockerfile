FROM node:14
WORKDIR /usr/src/app
COPY . .
ARG NODE_ENV=prod
ENV NODE_ENV=${NODE_ENV}

RUN npm install

RUN npm run build

EXPOSE 3000
CMD ["node", "./helper/generateKey.js";"node","dist/main.js"]