FROM node:18

WORKDIR /your-wavelength

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm","run","start:dev"]