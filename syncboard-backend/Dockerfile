# Multi-stage Dockerfile for SyncBoard Backend (Spring Boot + Java 21)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies (cache layer)
RUN mvn dependency:go-offline -B

COPY src ./src
# Build application JAR, skipping tests during packaging
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
