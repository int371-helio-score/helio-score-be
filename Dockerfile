FROM node:14
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm install cross-env
EXPOSE 3000
CMD ["node", "./src/app.js"]