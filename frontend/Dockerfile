# frontend/vite-project/Dockerfile (Optimized with Multi-Stage Build)

# --- Stage 1: The Builder ---
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# This creates the final, optimized 'dist' folder
RUN npm run build


# --- Stage 2: The Final Image ---
# Use a tiny web server image (Nginx) to serve the static files
FROM nginx:1.25-alpine

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom nginx config to handle routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]