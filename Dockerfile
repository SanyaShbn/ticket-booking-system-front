FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

FROM nginx:alpine

RUN rm -f /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/ticket-booking-system-front/browser/* /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
