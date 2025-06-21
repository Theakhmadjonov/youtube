FROM node:22-alpine
WORKDIR /app --frozen-lockfile && yarn cache clean

COPY package*.json yarn.lock ./
RUN yarn install

COPY . .

RUN npx prisma generate

RUN yarn build
