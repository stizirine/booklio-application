# Étape 1 : Build de React
FROM node:20 as build-stage
WORKDIR /app

# Arguments de build depuis docker-compose
ARG REACT_APP_API_BASE_URL=/api
ARG REACT_APP_X_API_KEY=x-api-key
ARG REACT_APP_REQUIRED_HEADER_VALUE
ARG REACT_APP_REQUIRED_HEADER_VALUE_PROD
ARG NODE_ENV=production

# S'assurer que NODE_ENV n'est PAS défini pour installer les devDependencies
# ENV CI=true peut causer des problèmes, ne pas le définir
# ENV HUSKY=0 peut causer des problèmes, ne pas le définir

COPY package*.json package-lock.json* ./
# Désactiver husky pour éviter les erreurs
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));delete p.scripts.prepare;fs.writeFileSync('package.json',JSON.stringify(p,null,2))"
# Installer TOUTES les dépendances (y compris devDependencies) de façon fiable
ENV CI=true
ENV HUSKY=0
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
# Installer craco-alias si nécessaire (il est déclaré dans package.json)
RUN npm install craco-alias@^3.0.1 --legacy-peer-deps --save-dev
COPY . .
# S'assurer que craco-alias est installé (dev dependency) après la copie
RUN NODE_ENV=development npm install craco-alias@^3.0.1 --legacy-peer-deps --save-dev

# Définir les variables d'environnement pour le build React
ENV NODE_ENV=${NODE_ENV}
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_X_API_KEY=${REACT_APP_X_API_KEY}
ENV REACT_APP_REQUIRED_HEADER_VALUE=${REACT_APP_REQUIRED_HEADER_VALUE}
ENV REACT_APP_REQUIRED_HEADER_VALUE_PROD=${REACT_APP_REQUIRED_HEADER_VALUE_PROD}

# Exécuter le build React via craco (chemin garanti)
ENV PATH="/usr/local/bin:/app/node_modules/.bin:${PATH}"
ENV NODE_PATH="/app/node_modules"
# Vérifier que craco-alias est bien présent puis lancer le build
RUN ls node_modules | head && \
    ls node_modules/craco-alias && \
    node -e "console.log('craco-alias ->', require.resolve('craco-alias'))" && \
    npx -y @craco/craco@7.1.0 build

# Étape 2 : Serveur Nginx
FROM nginx:alpine
# Copie du build React
COPY --from=build-stage /app/build /usr/share/nginx/html
# Copie de NOTRE configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]