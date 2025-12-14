# Étape 1 : Build de React
FROM node:20 as build-stage
WORKDIR /app

# Arguments de build depuis docker-compose
ARG REACT_APP_API_BASE_URL=/api
ARG REQUIRED_HEADER_NAME=x-api-key
ARG REQUIRED_HEADER_VALUE
ARG NODE_ENV=production

# S'assurer que NODE_ENV n'est PAS défini pour installer les devDependencies
# ENV CI=true peut causer des problèmes, ne pas le définir
# ENV HUSKY=0 peut causer des problèmes, ne pas le définir

COPY package*.json package-lock.json* ./
# Désactiver husky pour éviter les erreurs
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));delete p.scripts.prepare;fs.writeFileSync('package.json',JSON.stringify(p,null,2))"
# Installer TOUTES les dépendances (y compris devDependencies) de façon fiable
# Ne pas définir CI=true car cela peut empêcher l'installation des devDependencies
ENV HUSKY=0
RUN npm ci --legacy-peer-deps --include=dev || npm install --legacy-peer-deps

COPY . .

# Définir les variables d'environnement pour le build React
ENV NODE_ENV=${NODE_ENV}
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_REQUIRED_HEADER_NAME=${REQUIRED_HEADER_NAME}
ENV REACT_APP_REQUIRED_HEADER_VALUE=${REQUIRED_HEADER_VALUE}

# Exécuter le build React via le binaire craco directement
RUN ./node_modules/.bin/craco build || npx --yes @craco/craco build

# Étape 2 : Serveur Nginx
FROM nginx:alpine
# Copie du build React
COPY --from=build-stage /app/build /usr/share/nginx/html
# Copie de la configuration Nginx (copiée dans build-stage avec COPY . .)
COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]