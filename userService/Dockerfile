# ----- Build Stage -----
    FROM node:20-bullseye AS builder
    WORKDIR /app
    
    # Copy package files and tsconfig
    COPY package*.json tsconfig.json ./
    
    # Install dependencies (this will compile native modules for the bullseye platform)
    RUN npm install
    
    # Copy the rest of the source code
    COPY . .
    
    # Build the TypeScript source code into the 'dist' folder
    RUN npm run build
    
    # ----- Production Stage -----
    FROM node:20-bullseye AS runner
    WORKDIR /app
    
    # Copy built files and node_modules from the builder stage
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    
    # Expose the port your service listens on (5001 as defined in your env)
    EXPOSE 5001
    
    # Start your application
    CMD ["npm", "start"]
    