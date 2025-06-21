FROM node:22-alpine
WORKDIR /nest-app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean
COPY . .
EXPOSE 4000
RUN yarn build
