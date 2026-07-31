FROM golang:alpine AS builder

WORKDIR /app

# Copy go modules manifests and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o muskom-api ./cmd/server/main.go

# Production Image
FROM alpine:3.19

WORKDIR /app

# We need timezone data and ca-certificates for production
RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/muskom-api .

EXPOSE 3000

CMD ["./muskom-api"]
