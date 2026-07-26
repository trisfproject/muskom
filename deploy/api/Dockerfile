# Build Stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY go.sum* ./
RUN go mod download

COPY . .

# Build standard production binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o api main.go

# Production Stage
FROM alpine:3.19

WORKDIR /app

# Add tzdata for timezone support and ca-certificates for secure API calls
RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/api .

# Create non-root user for security best practices
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

ENTRYPOINT ["./api"]
