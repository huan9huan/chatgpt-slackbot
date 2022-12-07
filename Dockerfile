FROM node:19.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY *.json /usr/src/app/
COPY ./ /usr/src/app/

RUN npm i
RUN npm run build

CMD npm run start