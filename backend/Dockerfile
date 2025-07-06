# Multi-stage Dockerfile for Spring Boot JobMatch application
# Stage 1: Build stage
FROM gradle:8.5-jdk21-alpine AS build

# Set working directory
WORKDIR /app

# Copy Gradle files first for dependency caching
COPY build.gradle settings.gradle ./
COPY gradle gradle
COPY gradlew gradlew.bat ./

# Download dependencies (this layer will be cached unless dependencies change)
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src ./src

# Build the application
RUN ./gradlew bootJar --no-daemon

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -u 1001 -G appgroup appuser

# Copy the JAR file from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Copy resources directory if it exists
COPY src/main/resources ./resources

# Copy .env file if it exists (optional)
COPY .env* ./

# Create logs directory
RUN mkdir -p /logs && chown -R appuser:appgroup /logs /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Set JVM options for container environment
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication"

# Start the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 