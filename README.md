# Music-Streaming-Appl
Microservice Architecture

```
npm init -y
sudo npm i -g typescript
sudo npm i -D typescript # as devdependency
npm i nodemon concurrently
npm i nodemon concurrently
sudo npm i express dotenv mongoose bcrypt jsonwebtoken
npm i express @types/express dotenv @types/dotenv cloudinary cors @types/cors
npx tsc -init 
```

tsconfig.json

```
"target": "ES2020",   
"module": "NodeNext",                      
"rootDir": "./src",  
"outDir": "./dist", 
```

# permissions

```
sudo chown -R $(whoami) /Users/vaibhavbansal/vb_proj/Music-Streaming-Appl
```

# building typescript

```
tsc.
node ./dist/index.js

lsof -i 5000
kill -9 pid
```

#postgres

```
npm i @neondatabase/serverless
```

#redis

make account in redis.io and set up connection

#frontend
use vite for creating frontend in react

sudo apt-get install -y nodejs
sudo npm install -g pm2
pm2 start "dist/index.js" --name "music-app"

npm run build
sudo npm install -g serve
pm2 start "serve -s dist -l 3000" --name "vite-app"



# Docker

docker compose up -d
docker compose down -v
docker ps
docker-compose logs -f
docker-compose logs -f user-service
docker exec -it <container_name> bash
docker-compose exec admin-service sh
docker exec -it admin-service tail -f /path/to/log/file.log
docker exec -it admin-service sh

docker system prune
docker image prune -a
docker volume prune
docker container prune
docker network prune
docker system prune --volumes
