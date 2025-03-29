# Music-Streaming-Application
Microservice Architecture (3 Tier Architecture Deployment)


Tech Stack
1. Kubernetes (AWS EKS)
2. Jenkins
3. SonarQube
4. Trivy
5. Owasp
6. Docker
7. Docker Compose
8. React JS
9. Redis
10. Tailwind
11. AWS EC2
12. Mongo DB
13. Node JS
14. PostgreSQL
15. Cloudinary
16. Typescript
17. JWT Authentication

Demo Screenshots

![1](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290088/Screenshot_2025-03-29_at_6.14.21_PM_v0nh0i.png)

![2](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290090/Screenshot_2025-03-29_at_6.14.39_PM_ahwaub.png)

![3](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290091/Screenshot_2025-03-29_at_7.10.24_PM_mfs6kv.png)

![4](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290092/Screenshot_2025-03-29_at_7.12.28_PM_bz8gx6.png)

![5](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290093/Screenshot_2025-03-29_at_7.12.50_PM_dbpmy0.png)

![5.1](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290093/Screenshot_2025-03-29_at_7.13.02_PM_whq3fv.png)

![6](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290093/Screenshot_2025-03-29_at_7.09.58_PM_hskt1t.png)

![7](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290091/Screenshot_2025-03-29_at_7.09.31_PM_idx586.png)

![8](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290091/Screenshot_2025-03-29_at_7.09.12_PM_pmqtxr.png)

![9](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290091/Screenshot_2025-03-29_at_7.11.09_PM_iarmeq.png)

![10](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290089/Screenshot_2025-03-29_at_7.08.34_PM_p7rgg5.png)

![11](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290089/Screenshot_2025-03-29_at_7.09.03_PM_txalkk.png)

![12](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290088/Screenshot_2025-03-29_at_7.08.01_PM_ybpbik.png)


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
```
make account in redis.io and set up connection

#frontend
use vite for creating frontend in react

sudo apt-get install -y nodejs
sudo npm install -g pm2
pm2 start "dist/index.js" --name "music-app"

npm run build
sudo npm install -g serve
pm2 start "serve -s dist -l 3000" --name "vite-app"
```


# Docker

```

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
```

# EC2

# Jenkins

```
ssh -i "bms.pem" ubuntu@ec2-54-164-249-242.compute-1.amazonaws.com

chmod +x ./your_executable_file
./your_executable_file

sudo cat /var/lib/jenkins/secrets/initialAdminPassword

installing suggested plugins

http://54.164.249.242:8080/

```

# sonarqube

http://54.164.249.242:8080/sonarqube-webhook

```
admin
admin12
```
``
VITE_API_ADMIN_URL=http://music-streaming-appl-admin-svc:5002
VITE_API_SONG_URL=http://music-streaming-appl-song-svc:5003
VITE_API_USER_URL=http://music-streaming-appl-user-svc:5001

```

```
sudo docker system prune --all --volumes -f
```