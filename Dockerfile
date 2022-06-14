FROM node:16.15.0 AS build-env

COPY . /app
WORKDIR /app
RUN yarn install --frozen-lockfile && yarn build

FROM gcr.io/distroless/nodejs:16-debug

COPY --from=build-env /app /app
WORKDIR /app

ENTRYPOINT ["/nodejs/bin/node", "--experimental-specifier-resolution=node", "--inspect=0.0.0.0:9229"]
CMD ["./dist/index.js"]