# Use an official Node runtime as the base image
FROM node:18.19-alpine3.18

# Set the working directory in the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the port the app runs on (adjust if necessary)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
