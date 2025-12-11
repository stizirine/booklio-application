# Étape 1 : Build de React
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx
FROM nginx:alpine
# Copie du build React
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copie de NOTRE configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]