# Engineering Coding Standards

## Go Standards (Backend)
1. **Formatting:** Mandatory `gofmt` and standard package imports order (Standard library, 3rd party, Local packages).
2. **Error Handling:** Explicit error handling; never ignore returned errors (`if err != nil`). Return wrapped errors (`fmt.Errorf("failed to...: %w", err)`).
3. **Context Propagation:** Pass `context.Context` as the first argument in all service and repository functions.
4. **Zero Panic:** Never invoke `panic()` in business logic handlers; handle errors gracefully via Fiber error responses.

## TypeScript / Next.js Standards (Frontend)
1. **Strict Types:** TypeScript strict mode enabled; avoid `any`. Use interfaces for component props and service DTOs.
2. **Server/Client Boundary:** Mark client components explicitly with `"use client";` at top of file.
3. **Component Structure:** Function components with named exports. Reusable UI components stored in `@/components/ui/`.
