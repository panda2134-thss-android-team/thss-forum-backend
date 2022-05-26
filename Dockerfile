FROM node:16.15.0 AS build-env

COPY . /app
WORKDIR /app
RUN yarn && yarn build

FROM gcr.io/distroless/nodejs:16.15.0
COPY --from=build-env /app /app
WORKDIR /app
CMD ["/usr/bin/node", "--experimental-specifier-resolution=node", "./dist/index.js"]
