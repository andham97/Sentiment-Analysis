FROM node:8-stretch

# Change working directory
WORKDIR "/app"

# Update packages and install dependency packages for services
RUN apt-get update \
 && apt-get dist-upgrade -y \
 && apt-get clean \
 && echo 'Finished installing dependencies'

# Install npm production packages
COPY package.json /app/
RUN cd /app; npm install; npm install --only=dev

COPY . /app

RUN npm run build; ls build; ls build/server; cat build/server/server.js

ENV NODE_ENV production
ENV PORT 3000

EXPOSE 3000

CMD ["npm", "start", "--", "--no-scheduler"]
