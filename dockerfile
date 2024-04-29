FROM node:lts-alpine

WORKDIR /app 

COPY package.json ./

RUN npm install node

COPY . .

CMD npm run production

EXPOSE 8000
