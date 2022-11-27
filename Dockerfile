FROM node:15-alpine

    EXPOSE 8080

    RUN mkdir -p /home/node/app/node_modules

    WORKDIR /home/node/app

    # Replace 'app/' for your <APP_PATH_DIR> within this repository.
    # i.e. if your app is located at 'code/index.js' then you should replace 'app/' for 'code/js/'
    COPY theAPI .
    
    RUN npm install

    RUN chown -R node:node .

    USER node
    
    # Replace 'index.js' by your main file name. i.e. treasuremap.js
    CMD ["node", "app.js"]