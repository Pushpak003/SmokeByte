import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SmokeByte API",
      version: "1.0.0",
      description:
        "File conversion API — supports images, documents, and media. " +
        "Most endpoints require a Bearer JWT in the Authorization header.",
    },
    servers: [
      {
        url: process.env.BACKEND_URL || "http://localhost:3000",
        description: "Active server",
      },
    ],

    // ── Security scheme ──────────────────────────────────────────────────────
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste your accessToken here (without the 'Bearer ' prefix).",
        },
      },

      schemas: {
        // ── Auth ─────────────────────────────────────────────────────────────
        RegisterBody: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string", minLength: 3, maxLength: 30, example: "john_doe" },
            password: { type: "string", minLength: 8, example: "secret123" },
          },
        },
        LoginBody: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string", example: "john_doe" },
            password: { type: "string", example: "secret123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            accessToken:  { type: "string" },
            refreshToken: { type: "string" },
            user: {
              type: "object",
              properties: {
                id:       { type: "integer" },
                username: { type: "string" },
              },
            },
          },
        },

        // ── Conversion ───────────────────────────────────────────────────────
        ConvertResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Conversion job queued" },
            jobId:   { type: "string", example: "42" },
          },
        },
        StatusResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["pending", "processing", "completed", "failed"],
              example: "completed",
            },
            jobId:        { type: "string", example: "42" },
            fileId:       { type: "integer", example: 7, description: "Present when completed" },
            filename:     { type: "string",  example: "photo.png" },
            targetFormat: { type: "string",  example: "webp" },
            error:        { type: "string",  description: "Present when failed" },
          },
        },

        // ── History ──────────────────────────────────────────────────────────
        HistoryItem: {
          type: "object",
          properties: {
            id:         { type: "integer" },
            filename:   { type: "string" },
            filetype:   { type: "string" },
            filesize:   { type: "integer" },
            created_at: { type: "string", format: "date-time" },
            ConversionLogs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id:                 { type: "integer" },
                  target_format:      { type: "string" },
                  status:             { type: "string", enum: ["pending","processing","completed","failed"] },
                  converted_file_url: { type: "string", nullable: true },
                  created_at:         { type: "string", format: "date-time" },
                },
              },
            },
          },
        },

        // ── Error ────────────────────────────────────────────────────────────
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string",  example: "Invalid credentials" },
          },
        },
      },
    },

    // ── Tag groupings ─────────────────────────────────────────────────────────
    tags: [
      { name: "Auth",       description: "Register, login, logout, token refresh, Google OAuth" },
      { name: "Conversion", description: "Upload a file and queue a conversion job" },
      { name: "Status",     description: "Poll conversion job status" },
      { name: "Download",   description: "Securely download a converted file" },
      { name: "User",       description: "Profile and conversion history" },
      { name: "Health",     description: "Server health check" },
    ],

    paths: {
      // ════════════════════════════════════════════════════════════════════════
      // AUTH
      // ════════════════════════════════════════════════════════════════════════
      "/auth/signup": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterBody" } } },
          },
          responses: {
            201: {
              description: "User created — returns tokens",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
            },
            400: { description: "Username already exists or validation error",
                   content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },

      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with username + password",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } } },
          },
          responses: {
            200: {
              description: "Login successful — returns tokens",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
            },
            401: { description: "Invalid credentials",
                   content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },

      "/auth/refresh-token": {
        post: {
          tags: ["Auth"],
          summary: "Get a new access token using refresh token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: { refreshToken: { type: "string" } },
                },
              },
            },
          },
          responses: {
            200: {
              description: "New access token",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { accessToken: { type: "string" } },
                  },
                },
              },
            },
            403: { description: "Invalid or expired refresh token" },
          },
        },
      },

      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout — invalidates refresh token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: { refreshToken: { type: "string" } },
                },
              },
            },
          },
          responses: {
            200: { description: "Logged out successfully" },
          },
        },
      },

      "/auth/google": {
        get: {
          tags: ["Auth"],
          summary: "Initiate Google OAuth flow",
          description: "Redirects to Google login. After success, redirects to `FRONTEND_URL/auth/callback?accessToken=...&refreshToken=...`",
          responses: {
            302: { description: "Redirect to Google" },
          },
        },
      },

      "/auth/google/callback": {
        get: {
          tags: ["Auth"],
          summary: "Google OAuth callback (handled by backend)",
          description: "Do not call this directly — Google calls it after authentication.",
          responses: {
            302: { description: "Redirect to frontend with tokens" },
          },
        },
      },

      // ════════════════════════════════════════════════════════════════════════
      // CONVERSION
      // ════════════════════════════════════════════════════════════════════════
      "/convert/image": {
        post: {
          tags: ["Conversion"],
          summary: "Convert an image file",
          description: "Accepts PNG, JPEG, or WebP. Converts to any of: `png`, `jpeg`, `jpg`, `webp`.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["file", "targetFormat"],
                  properties: {
                    file:         { type: "string", format: "binary" },
                    targetFormat: { type: "string", enum: ["png","jpeg","jpg","webp"], example: "webp" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Job queued — use jobId to poll /status/:jobId",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ConvertResponse" } } },
            },
            400: { description: "Unsupported format or invalid file content" },
            401: { description: "Missing or invalid token" },
            429: { description: "Rate limit exceeded (20 uploads/hr)" },
          },
        },
      },

      "/convert/document": {
        post: {
          tags: ["Conversion"],
          summary: "Convert a document file",
          description: "Accepts PDF, DOCX, ODT, TXT, HTML, CSV, PPTX, XLSX and more. Converts to: `pdf`, `txt`, `odt`, `doc`, `docx`, `html`.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["file", "targetFormat"],
                  properties: {
                    file:         { type: "string", format: "binary" },
                    targetFormat: { type: "string", enum: ["pdf","txt","odt","doc","docx","html"], example: "pdf" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Job queued",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ConvertResponse" } } },
            },
            400: { description: "Unsupported format or invalid file content" },
            401: { description: "Missing or invalid token" },
            429: { description: "Rate limit exceeded" },
          },
        },
      },

      "/convert/media": {
        post: {
          tags: ["Conversion"],
          summary: "Convert a video or audio file",
          description: "Accepts MP4, AVI, MKV, MOV, MP3, WAV, AAC and more. Converts to: `mp3`, `wav`, `mp4`, `avi`, `mov`, `webm`.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["file", "targetFormat"],
                  properties: {
                    file:         { type: "string", format: "binary" },
                    targetFormat: { type: "string", enum: ["mp3","wav","mp4","avi","mov","webm"], example: "mp3" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Job queued",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ConvertResponse" } } },
            },
            400: { description: "Unsupported format or invalid file content" },
            401: { description: "Missing or invalid token" },
            429: { description: "Rate limit exceeded" },
          },
        },
      },

      // ════════════════════════════════════════════════════════════════════════
      // STATUS
      // ════════════════════════════════════════════════════════════════════════
      "/status/{jobId}": {
        get: {
          tags: ["Status"],
          summary: "Poll conversion job status",
          description: "Poll every 3 seconds. Status transitions: `pending` → `processing` → `completed` | `failed`.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "jobId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "jobId returned by /convert/* endpoints",
              example: "42",
            },
          ],
          responses: {
            200: {
              description: "Current job status",
              content: { "application/json": { schema: { $ref: "#/components/schemas/StatusResponse" } } },
            },
            404: { description: "Job not found" },
            401: { description: "Missing or invalid token" },
          },
        },
      },

      // ════════════════════════════════════════════════════════════════════════
      // DOWNLOAD
      // ════════════════════════════════════════════════════════════════════════
      "/download/{fileId}": {
        get: {
          tags: ["Download"],
          summary: "Download a converted file",
          description:
            "Streams the converted file directly. " +
            "`fileId` is the `fileId` field from the `/status/:jobId` response when status is `completed`. " +
            "Ownership is verified — users can only download their own files.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "fileId",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "File ID from /status response (fileId field)",
              example: 7,
            },
          ],
          responses: {
            200: {
              description: "File stream",
              content: { "application/octet-stream": { schema: { type: "string", format: "binary" } } },
            },
            400: { description: "File not ready or invalid ID" },
            403: { description: "Access denied — not your file" },
            404: { description: "File not found" },
            401: { description: "Missing or invalid token" },
          },
        },
      },

      // ════════════════════════════════════════════════════════════════════════
      // USER
      // ════════════════════════════════════════════════════════════════════════
      "/user/me": {
        get: {
          tags: ["User"],
          summary: "Get logged-in user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "User profile",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id:       { type: "integer" },
                      username: { type: "string" },
                    },
                  },
                },
              },
            },
            401: { description: "Missing or invalid token" },
          },
        },
      },

      "/user/history": {
        get: {
          tags: ["User"],
          summary: "Get conversion history (last 50)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Conversion history",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "History fetched" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/HistoryItem" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Missing or invalid token" },
          },
        },
      },

      // ════════════════════════════════════════════════════════════════════════
      // HEALTH
      // ════════════════════════════════════════════════════════════════════════
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Server health check",
          responses: {
            200: {
              description: "Server is up",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      status:  { type: "string",  example: "ok" },
                      uptime:  { type: "number",  example: 3600 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [], // Spec is inline above — no file scanning needed
};

export const swaggerSpec = swaggerJsdoc(options);