FROM node:14
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm install cross-env
RUN npm run build
EXPOSE 3000
CMD ["node", "./helper/generateKey.js";"node","dist/main.js"]