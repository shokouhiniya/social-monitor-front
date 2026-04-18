# Stage 1: Build Node.js package
FROM node

ENV PATH="/root/.yarn/bin:/root/.config/yarn/global/node_modules/.bin:${PATH}"

WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn install

COPY . .

RUN yarn build
EXPOSE 3033

CMD ["yarn", "start"]
