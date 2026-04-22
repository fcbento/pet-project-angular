FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build:production

FROM nginx:alpine

ENV BUILD_DATE=2026-03-14

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN rm /usr/share/nginx/html/index.html

COPY --from=build /app/dist/practices/browser/ /usr/share/nginx/html/

RUN ls -la /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]