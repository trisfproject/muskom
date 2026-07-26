package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
)

func main() {
	app := fiber.New()

	app.Get("/api/v1/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Service is running",
			"version": "0.1.0",
		})
	})

	log.Fatal(app.Listen(":8080"))
}
