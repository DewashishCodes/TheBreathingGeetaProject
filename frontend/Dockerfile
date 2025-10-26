# frontend/vite-project/Dockerfile

# Use a Node.js runtime for the build environment
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Make port 5173 available
EXPOSE 5173

# Run the dev server. --host is CRUCIAL here.
CMD ["npm", "run", "dev", "--", "--host"]