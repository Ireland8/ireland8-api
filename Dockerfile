FROM node:5-onbuild

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm update

# Bundle app source
COPY . /usr/src/app

# the default port for ireland8 is exposed outside the container
EXPOSE 4568

# run node app
CMD npm start