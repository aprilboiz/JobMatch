#!/bin/bash

# Build script for optimized Docker image
# Usage: ./docker-build.sh [tag]

set -e

# Default tag if not provided
TAG=${1:-jobmatch-backend:latest}

echo "Building optimized Docker image with tag: $TAG"

# Build the Docker image
docker build -t "$TAG" .

# Show image size
echo "Image built successfully!"
echo "Image size:"
docker images "$TAG" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# Optional: Run container for testing
read -p "Do you want to run the container for testing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting container..."
    docker run -d -p 8080:8080 --name jobmatch-test "$TAG"
    echo "Container started at http://localhost:8080"
    echo "To stop: docker stop jobmatch-test && docker rm jobmatch-test"
fi 