# Architecture and Runtime Platform - Application bootstrap, request pipeline, and router composition



## Running the Application Locally

Follow the steps below to configure and run the backend application on your local machine.

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

---

## 2. Install Dependencies

Make sure you have **Node.js (v18 or later)** installed.

```bash
npm install
```

---

## 3. Create Environment Variables

Create a `.env` file in the **root directory** of the project.

Example:

```env
PORT=8080

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Secrets
JWT_ACCESS_SECRET=example_access_secret
JWT_REFRESH_SECRET=example_refresh_secret
JWT_RESET_PASSWORD_SECRET=example_reset_secret
JWT_EMAIL_CONFIRMATION_SECRET=example_email_confirmation_secret

# Email Configuration
DOMAIN_EMAIL=example@gmail.com
DOMAIN_EMAIL_APP_PASS=example_app_password

# Redis (Cloud)
REDIS_CLOUD_URI=redis://default:password@redis-host:port
REDIS_CLOUD_PASSWORD=example_password
#OR
# Redis (Local Docker )
REDIS_PASSWORD_DOCKER=example_password
REDIS_DOCKER_URI=redis://localhost:6379

# Environment
ENVIRONMENT=DEVELOPMENT

# Cache Configuration
CACHE_TTL_MS=300000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Client URL
CLIENT_BASE_URL=http://localhost:3000
```

⚠️ **Important:**
These values are examples only. Replace them with your own credentials and configuration.

---

## 4. Start Required Services

### MongoDB

Make sure MongoDB is running locally or use a cloud provider such as MongoDB Atlas.

### Redis (optional)

If using **Docker**, run:

```bash
docker run -d -p 6379:6379 redis
```
Or configure a cloud Redis instance and update the `.env` accordingly.
---
## 5. Start the Server
Run the application using:
```bash
npm run dev
```
or
```bash
npm start
```
If everything is configured correctly, the server should start on:

```
http://localhost:8080
```
## 6. Development Environment
Example development configuration:
```
Backend: Node.js (Express)
Database: MongoDB
Cache : Redis
Authentication: JWT + HTTP-only cookies
```

## Credentials

The following test accounts are available for trying the system. These accounts represent different user roles within the application.

### Admin

* **Email:** [nabarunmiddya91221@gmail.com](mailto:nabarunmiddya91221@gmail.com)
* **Password:** amikkr

### Analyst

* **Email:** [nabarunmiddya9821@gmail.com](mailto:nabarunmiddya9821@gmail.com)
* **Password:** GBuONQ

### User

* **Email:** [nabarunmiddya@gmail.com](mailto:nabarunmiddya@gmail.com)
* **Password:** GBuONQ

These accounts can be used to log in and explore the different permission levels and features of the Finance Data Processing and Access Control System.

---
## Overview

This runtime layer builds the Express application, wires core middleware, and mounts the feature routers under the `/api` prefix. It also exposes Swagger UI at `/api-docs`, then runs the post-route middleware chain that persists audit logs, stores GET responses in Redis, normalizes controller output, and converts errors into JSON responses.

From a request-flow perspective, the app splits traffic into two paths: public authentication endpoints and protected feature endpoints. Public auth routes are mounted without JWT verification, while users, analytics, budgets, categories, financial records, and audit logs are mounted behind `verifyRequestJwt` and then narrowed again with scope-based authorization.

## Architecture Overview

```mermaid
flowchart TB
    subgraph Bootstrap [Application Bootstrap]
        App[Express app]
        Dotenv[dotenv config]
        Parsers[JSON and urlencoded parsers]
        Cors[CORS middleware]
        Cookies[cookieParser]
        RateLimit[rateLimiterFn]
        Swagger[Swagger UI at api docs]
    end

    subgraph Routing [Router Composition]
        AuthRouter[AuthRouter public]
        UserRouter[UserRouter protected]
        AnalyticsRouter[AnalyticsRouter protected]
        BudgetRouter[BudgetRouter protected]
        CategoryRouter[CategoryRouter protected]
        FinancialRecordRouter[FinancialRecordRouter protected]
        AuditLogRouter[AuditLogRouter protected]
    end

    subgraph PostRoute [Post Route Chain]
        AuditLogger[auditLogger]
        CacheCreate[cacheCreate]
        ResponseHandler[globalResponseHandler]
        ErrorHandler[globalErrorHandler]
    end

    subgraph Runtime [Runtime Dependencies]
        MongoDB[MongoDB]
        Redis[Redis]
    end

    Dotenv --> App
    App --> Parsers
    Parsers --> Cors
    Cors --> Cookies
    Cookies --> RateLimit
    RateLimit --> AuthRouter
    RateLimit --> UserRouter
    RateLimit --> AnalyticsRouter
    RateLimit --> BudgetRouter
    RateLimit --> CategoryRouter
    RateLimit --> FinancialRecordRouter
    RateLimit --> AuditLogRouter
    Swagger --> App
    AuthRouter --> PostRoute
    UserRouter --> PostRoute
    AnalyticsRouter --> PostRoute
    BudgetRouter --> PostRoute
    CategoryRouter --> PostRoute
    FinancialRecordRouter --> PostRoute
    AuditLogRouter --> PostRoute
    CacheCreate --> Redis
    PostRoute --> MongoDB
```

## Application Bootstrap

### `src/index.js`

*src/index.js*

The entry point creates the Express app, applies request parsing and cross-origin settings, mounts feature routers, and starts the HTTP server. It also imports Redis config for side effects and connects to MongoDB after the server begins listening.

#### Runtime constants

| Name | Source | Purpose |
|---|---|---|
| `App` | `express()` | Application instance |
| `BaseUrl` | `"/api"` | Common mount prefix for API routes and rate limiting |
| `PORT` | `process.env.PORT` | Listen port |
| `clientUrl` | `process.env.CLIENT_BASE_URL` | Allowed browser origin for CORS |
| `rateLimitWindowMs` | `process.env.RATE_LIMIT_WINDOW_MS` | Rate-limit window |
| `rateLimitMaxReq` | `process.env.RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window |
| `environment` | `process.env.ENVIRONMENT` | Used for startup logging and MongoDB connection behavior |
| `ratelimiter` | `rateLimiterFn(rateLimitWindowMs, rateLimitMaxReq)` | Rate-limit middleware attached under `/api` |

#### Request bootstrap sequence

| Order | Middleware or action | Scope |
|---|---|---|
| 1 | `express.urlencoded()` | Parses URL-encoded request bodies |
| 2 | `express.json()` | Parses JSON request bodies |
| 3 | `cors({ origin, methods, credentials })` | Applies CORS policy using `CLIENT_BASE_URL` |
| 4 | `cookieParser()` | Reads cookies into `req.cookies` |
| 5 | `App.use(BaseUrl, ratelimiter)` | Applies request throttling to every `/api` route |
| 6 | `App.use(BaseUrl, AuthRouter)` | Public authentication routes |
| 7 | `App.use(BaseUrl, verifyRequestJwt, UserRouter)` | Protected user routes |
| 8 | `App.use(BaseUrl, verifyRequestJwt, AnalyticsRouter)` | Protected analytics routes |
| 9 | `App.use(BaseUrl, verifyRequestJwt, BudgetRouter)` | Protected budget routes |
| 10 | `App.use(BaseUrl, verifyRequestJwt, CategoryRouter)` | Protected category routes |
| 11 | `App.use(BaseUrl, verifyRequestJwt, FinancialRecordRouter)` | Protected financial record routes |
| 12 | `App.use(BaseUrl, verifyRequestJwt, AuditLogRouter)` | Protected audit log routes |
| 13 | `App.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))` | Swagger UI |
| 14 | `App.use(auditLogger)` | Persists audit records when `res.locals.auditLog` is present |
| 15 | `App.use(cacheCreate(cacheTtl))` | Persists GET responses to Redis |
| 16 | `App.use(globalResponseHandler)` | Serializes `res.locals.responseData` |
| 17 | `App.use(globalErrorHandler)` | Final error response handler |
| 18 | `App.listen(PORT, async ...)` | Starts the server and then awaits MongoDB connection |

#### Bootstrap and connection lifecycle

- The application starts listening before `connectMongoDb()` is awaited in the `listen` callback.
- `connectMongoDb()` is called inside the callback only when `App.listen` succeeds.
- If MongoDB connection fails, `connectMongoDb()` logs the error and exits with code `1`.

### `src/configs/swagger.config.js`

*src/configs/swagger.config.js*

This file builds the OpenAPI document used by Swagger UI.

| Property | Type | Description |
|---|---|---|
| `definition.openapi` | string | OpenAPI version `3.0.0` |
| `definition.info.title` | string | API title |
| `definition.info.version` | string | API version `1.0.0` |
| `definition.info.description` | string | Explains cookie-based auth after login |
| `definition.servers[0].url` | string | Local API base URL `http://localhost:8080/api` |
| `components.securitySchemes.cookieAuth` | object | Cookie-based API key auth using `accessToken` |
| `apis` | string[] | Swagger annotation globs for module docs |

### `src/configs/mongoDb.config.js`

*src/configs/mongoDb.config.js*

This module connects the app to MongoDB based on the current environment.

| Method | Description |
|---|---|
| `connectMongoDb` | Connects to the configured MongoDB target and terminates the process on failure |

| Condition | Connection target |
|---|---|
| `environment === "TEST_FLIGHT"` | `inMemoryMongo_uri` |
| otherwise | `mongo_uri.toString()` |

## Request Pipeline

### Core middleware behavior

#### JWT cookie authentication

*src/shared/middleware/auth.middleware.js*

`verifyRequestJwt` reads `req.cookies.accessToken`, verifies it with `JWT_ACCESS_SECRET`, and populates `req.user` with the decoded token.

| Method | Description |
|---|---|
| `verifyRequestJwt` | Rejects requests without a valid `accessToken` cookie and attaches the JWT payload to `req.user` |

Runtime responses:

- Missing cookie: `403` with `{ "msg": "No access token found" }`
- Invalid token: `403` with `{ "msg": "Token is invalid", "err": ... }`

#### Scope validation

*src/shared/middleware/scope.validation.middleware.js*

`scopeValidation(...requiredScopes)` checks `req.user.role`, resolves permissions, and blocks requests that do not include every required scope.

| Method | Description |
|---|---|
| `scopeValidation` | Returns middleware that enforces one or more required scopes |

> [!NOTE]
> `scopeValidation` calls `Roles.getPermissionOf(req.user.role)`, while the shown `src/shared/utils/roles.js` excerpt only exposes the `roleScopes` object. If the getter is not exported elsewhere in the file, scope resolution cannot complete at runtime.

#### Rate limiting

*src/shared/middleware/ratelimiter.middleware.js*

`rateLimiterFn` wraps `express-rate-limit` and is mounted under `/api`.

| Method | Description |
|---|---|
| `rateLimiterFn` | Builds a rate-limiter middleware for the configured time window and request cap |

Configuration used by the app:

- `windowMs`: `RATE_LIMIT_WINDOW_MS`
- `max`: `RATE_LIMIT_MAX_REQUESTS`
- `standardHeaders`: `true`
- `legacyHeaders`: `false`

#### Redis-backed cache read path

*src/shared/middleware/cache-manager/cacheRead.middleware.js*

`cacheRead(prefix)` checks Redis for a GET response before the controller runs.

| Method | Description |
|---|---|
| `cacheRead` | Returns middleware that serves cached GET responses keyed by request URL |

Behavior:

- Disabled when `NODE_ENV === "test"`
- Only processes `GET`
- Computes cache key as `${prefix}:${req.originalUrl}`
- Reads from Redis using `redisClient.get(key)`
- On hit, returns `200` with the cached JSON payload immediately
- On miss, stores the key in `res.locals.cacheKey` and calls `next()`

#### Redis-backed cache write path

*src/shared/middleware/cache-manager/cacheCreate.middleware.js*

`cacheCreate(ttl)` persists responses after controllers have populated `res.locals.responseData`.

| Method | Description |
|---|---|
| `cacheCreate` | Returns middleware that writes GET responses into Redis with a TTL |

Behavior:

- Disabled when `NODE_ENV === "test"`
- Skips requests without `res.locals.responseData`
- Only writes when `req.method === "GET"`
- Writes `JSON.stringify(payload)` via `redisClient.setEx(key, ttl, payload)`
- Uses `res.locals.cacheKey` as the Redis key

Cache keys observed in the mounted routers:

- `users:<originalUrl>`
- `analytics:<originalUrl>`
- `budgets:<originalUrl>`
- `categories:<originalUrl>`
- `records:<originalUrl>`
- `audit-logs:<originalUrl>`

#### Audit logging

*src/modules/audit-logs/auditLogger.middleware.js*

`auditLogger` creates an `AuditLog` record only when controllers place an audit payload in `res.locals.auditLog`.

| Method | Description |
|---|---|
| `auditLogger` | Persists audit events after mutating operations finish |

Written fields:

- `action`
- `entity`
- `entityId`
- `performedBy` from `req.user?.sub` or `null`
- `changes`

#### Response normalization

*src/shared/middleware/response-handler/response.middleware.js*

`globalResponseHandler` serializes controller results stored in `res.locals.responseData`.

| Method | Description |
|---|---|
| `globalResponseHandler` | Converts `res.locals.responseData` into the final JSON response |

Payload fields emitted:

- `success`
- `message`
- `data`
- `meta`

> [!NOTE]
> Several controllers set `res.locals.responseData.status`, but `globalResponseHandler` only emits `success`, `message`, `data`, and `meta`. The `status` field is not forwarded to the client.

#### Global error handling

*src/shared/middleware/response-handler/error.middleware.js*

`globalErrorHandler` standardizes thrown and forwarded errors.

| Method | Description |
|---|---|
| `globalErrorHandler` | Converts application and Mongoose errors into a JSON error payload |

Error mappings:

- `CastError` → `400` with `Invalid resource ID`
- `code === 11000` → `400` with `Duplicate field value`
- `ValidationError` → `400` with merged validation messages
- fallback → status from `err.statusCode` or `500`

### Middleware execution flow

```mermaid
sequenceDiagram
    participant Client as Client
    participant App as Express App
    participant Rate as Rate Limiter
    participant Jwt as verifyRequestJwt
    participant Scope as scopeValidation
    participant Read as cacheRead
    participant Ctrl as Controller
    participant Audit as auditLogger
    participant Write as cacheCreate
    participant Resp as globalResponseHandler
    participant Err as globalErrorHandler
    participant Redis as Redis
    participant Mongo as MongoDB

    Client->>App: Request to api route
    App->>Rate: Apply limit
    Rate-->>App: Allowed

    alt Protected route
        App->>Jwt: Read accessToken cookie
        Jwt-->>App: req.user set
        App->>Scope: Check scopes
        Scope-->>App: Allowed
    end

    App->>Read: Check cache for GET
    alt Cache hit
        Read->>Redis: get key
        Redis-->>Read: Cached payload
        Read-->>Client: 200 cached JSON
    else Cache miss or non GET
        Read->>Ctrl: next
        Ctrl->>Mongo: Query or mutate data
        Mongo-->>Ctrl: Data result
        Ctrl-->>App: res.locals.responseData
        App->>Audit: Persist audit log if present
        Audit-->>App: next
        App->>Write: Cache GET response if eligible
        Write->>Redis: setEx key ttl payload
        App->>Resp: Normalize payload
        Resp-->>Client: JSON response
    end

    alt Error
        Ctrl-->>Err: next(err)
        Err-->>Client: JSON error response
    end
```

## Router Composition

### Public authentication routes

*src/modules/auth/routes/auth.route.js*

These routes are mounted at `/api/auth` and are not wrapped with `verifyRequestJwt`.

| Router | Mounted prefix | Protection |
|---|---|---|
| `AuthRouter` | `/api/auth` | Public |

#### `POST /api/auth/register`

[badge:public]

```api
{
  "title": "Register a new user",
  "description": "Creates a user account and sends an email confirmation link",
  "method": "POST",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/auth/register",
  "headers": [
    { "key": "Content-Type", "value": "application/json", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "json",
  "requestBody": {
    "name": "Nabarun Middya",
    "email": "nabarun@example.com",
    "password": "strongPassword123"
  },
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Registration completed and confirmation email sent",
      "body": {
        "success": true,
        "message": "The user with the mail nabarun@example.com has been created and an email has been send via mail to confirm the mail id.",
        "data": {
          "link": "http://localhost:8080/api/auth/verify/eyJhbGciOi..."
        }
      }
    }
  }
}
```

#### `POST /api/auth/login`

[badge:public]

```api
{
  "title": "Login user",
  "description": "Authenticates a user and sets accessToken, refreshToken, and userRole cookies",
  "method": "POST",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/auth/login",
  "headers": [
    { "key": "Content-Type", "value": "application/json", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "json",
  "requestBody": {
    "email": "nabarun@example.com",
    "password": "strongPassword123"
  },
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Login successful",
      "body": {
        "success": true,
        "message": "successful login",
        "user": {
          "id": "66f0b5f5c4f8d2c2a3b9c111",
          "name": "Nabarun Middya",
          "email": "nabarun@example.com",
          "role": "USER"
        }
      }
    },
    "401": {
      "description": "Authentication failed",
      "body": {
        "success": false,
        "message": "password verification failed"
      }
    }
  }
}
```

#### `POST /api/auth/logout`

[badge:public]

```api
{
  "title": "Logout user",
  "description": "Clears accessToken, refreshToken, and userRole cookies",
  "method": "POST",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/auth/logout",
  "headers": [],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Logout successful",
      "body": {
        "success": true,
        "message": "successful logout"
      }
    }
  }
}
```

#### `GET /api/auth/verify/:token`

[badge:public]

```api
{
  "title": "Verify email token",
  "description": "Consumes the email verification token from the route parameter",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/auth/verify/:token",
  "headers": [],
  "queryParams": [],
  "pathParams": [
    { "name": "token", "value": "eyJhbGciOi...", "required": true }
  ],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Email verification completed",
      "body": {
        "success": true,
        "message": "Email verified successfully"
      }
    }
  }
}
```

### Protected user routes

*src/modules/users/routes/user.route.js*

These routes are mounted at `/api/users` behind `verifyRequestJwt`.

| Router | Mounted prefix | Required scope set |
|---|---|---|
| `UserRouter` | `/api/users` | `read:users`, `write:users`, `update:users`, `delete:users` |

#### `POST /api/users`

[badge:required]

```api
{
  "title": "Create a new user",
  "description": "Creates a user record, generates a password when missing, sends a welcome email, and records an audit event",
  "method": "POST",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/users",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true },
    { "key": "Content-Type", "value": "application/json", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "json",
  "requestBody": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "strongPassword123",
    "role": "USER",
    "isActive": true
  },
  "formData": [],
  "rawBody": "",
  "responses": {
    "201": {
      "description": "User created",
      "body": {
        "success": true,
        "message": "User created successfully and an email has been send to this email: john@example.com, with user login credential(with system generated or provided password)",
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c121",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "USER",
          "isActive": true,
          "createdAt": "2026-03-20T10:15:00.000Z",
          "updatedAt": "2026-03-20T10:15:00.000Z"
        }
      }
    },
    "403": {
      "description": "Missing or invalid access token",
      "body": {
        "msg": "No access token found"
      }
    }
  }
}
```

#### `GET /api/users`

[badge:required]

```api
{
  "title": "Get all users",
  "description": "Returns a paginated list of users and reads from Redis when a cached GET payload exists",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/users",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [
    { "name": "page", "value": "1", "required": false },
    { "name": "limit", "value": "10", "required": false }
  ],
  "pathParams": [],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Users fetched successfully",
      "body": {
        "success": true,
        "message": "Users fetched successfully",
        "data": [
          {
            "_id": "66f0b5f5c4f8d2c2a3b9c121",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "USER",
            "isActive": true,
            "createdAt": "2026-03-20T10:15:00.000Z",
            "updatedAt": "2026-03-20T10:15:00.000Z"
          }
        ],
        "meta": {
          "total": 1,
          "page": 1,
          "limit": 10,
          "totalPages": 1
        }
      }
    },
    "403": {
      "description": "Scope denied",
      "body": {
        "success": false,
        "message": "insufficient scope resource access denied"
      }
    }
  }
}
```

#### `GET /api/users/:id`

[badge:required]

```api
{
  "title": "Get user by ID",
  "description": "Fetches a single user without the password field and can return a cached GET payload",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/users/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c121", "required": true }
  ],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "User fetched successfully",
      "body": {
        "success": true,
        "message": "User fetched successfully",
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c121",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "USER",
          "isActive": true,
          "createdAt": "2026-03-20T10:15:00.000Z",
          "updatedAt": "2026-03-20T10:15:00.000Z"
        }
      }
    },
    "404": {
      "description": "User not found",
      "body": {
        "success": false,
        "message": "User not found"
      }
    }
  }
}
```

#### `PATCH /api/users/:id`

[badge:required]

```api
{
  "title": "Update user",
  "description": "Updates a user, invalidates the users cache prefix, and records an audit event",
  "method": "PATCH",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/users/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true },
    { "key": "Content-Type", "value": "application/json", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c121", "required": true }
  ],
  "bodyType": "json",
  "requestBody": {
    "name": "Johnathan Doe",
    "email": "john@example.com",
    "password": "strongPassword123",
    "role": "USER",
    "isActive": true
  },
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "User updated successfully",
      "body": {
        "success": true,
        "message": "User updated successfully",
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c121",
          "name": "Johnathan Doe",
          "email": "john@example.com",
          "role": "USER",
          "isActive": true,
          "createdAt": "2026-03-20T10:15:00.000Z",
          "updatedAt": "2026-03-20T10:20:00.000Z"
        }
      }
    },
    "404": {
      "description": "User not found",
      "body": {
        "success": false,
        "message": "User not found"
      }
    }
  }
}
```

#### `DELETE /api/users/:id`

[badge:required]

```api
{
  "title": "Delete user",
  "description": "Deletes a user, invalidates the users cache prefix, and records an audit event",
  "method": "DELETE",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/users/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c121", "required": true }
  ],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "User deleted successfully",
      "body": {
        "success": true,
        "message": "User deleted successfully"
      }
    },
    "404": {
      "description": "User not found",
      "body": {
        "success": false,
        "message": "User not found"
      }
    }
  }
}
```

### Protected analytics routes

*src/modules/analytics/analytics.route.js*

These routes are mounted at `/api/analytics` behind `verifyRequestJwt` and `scopeValidation("read:analytics")`. The route file also applies `cacheRead("analytics")` to all four GET endpoints.

| Router | Mounted prefix | Required scope |
|---|---|---|
| `AnalyticsRouter` | `/api/analytics` | `read:analytics` |

#### `GET /api/analytics/summary`

[badge:required]

```api
{
  "title": "Get financial summary",
  "description": "Returns income, expense, net, active budget, and runway for the current financial year",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/analytics/summary",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Financial summary generated",
      "body": {
        "success": true,
        "message": "Financial summary generated",
        "data": {
          "income": 10000,
          "expense": 4000,
          "net": "6000",
          "budget": 20000,
          "runway": 16000
        }
      }
    }
  }
}
```

#### `GET /api/analytics/category`

[badge:required]

```api
{
  "title": "Get category totals",
  "description": "Returns financial totals grouped by category name",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/analytics/category",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Category totals generated",
      "body": {
        "success": true,
        "message": "Category totals generated",
        "data": [
          {
            "_id": "Operational Cost",
            "type": "EXPENSE",
            "total": 25000
          }
        ]
      }
    }
  }
}
```

#### `GET /api/analytics/mtrend`

[badge:required]

```api
{
  "title": "Get monthly trend",
  "description": "Returns grouped totals by year, month, and category type",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/analytics/mtrend",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Monthly trend generated",
      "body": {
        "success": true,
        "message": "Monthly trend generated",
        "data": [
          {
            "_id": {
              "year": 2026,
              "month": 3,
              "type": "EXPENSE"
            },
            "total": 4500
          }
        ]
      }
    }
  }
}
```

#### `GET /api/analytics/activity`

[badge:required]

```api
{
  "title": "Get recent activity",
  "description": "Returns the latest 10 financial records with populated category name and type",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/analytics/activity",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Recent activity fetched",
      "body": {
        "success": true,
        "message": "Recent activity fetched",
        "data": [
          {
            "_id": "66f0b5f5c4f8d2c2a3b9c201",
            "amount": 5000,
            "date": "2026-03-20T10:30:00.000Z",
            "category": {
              "_id": "66f0b5f5c4f8d2c2a3b9c202",
              "name": "Salary",
              "type": "INCOME"
            },
            "createdAt": "2026-03-20T10:30:00.000Z",
            "updatedAt": "2026-03-20T10:30:00.000Z"
          }
        ]
      }
    }
  }
}
```

### Protected budget routes

*src/modules/budgets/routes/budget.route.js*

These routes are mounted at `/api/budgets` behind `verifyRequestJwt`.

| Router | Mounted prefix | Required scopes |
|---|---|---|
| `BudgetRouter` | `/api/budgets` | `read:budgets`, `write:budgets`, `update:budgets`, `delete:budgets` |

#### `POST /api/budgets`

[badge:required]

```api
{
  "title": "Create a new budget",
  "description": "Creates a budget record, invalidates the budgets cache prefix, and records an audit event",
  "method": "POST",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/budgets",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true },
    { "key": "Content-Type", "value": "application/json", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "json",
  "requestBody": {
    "totalBudget": 200000,
    "financialYear": "2025-2026",
    "startDate": "2025-04-01",
    "endDate": "2026-03-31",
    "isActive": true
  },
  "formData": [],
  "rawBody": "",
  "responses": {
    "201": {
      "description": "Budget created successfully",
      "body": {
        "success": true,
        "message": "Budget created successfully",
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c301",
          "totalBudget": 200000,
          "financialYear": "2025-2026",
          "startDate": "2025-04-01T00:00:00.000Z",
          "endDate": "2026-03-31T00:00:00.000Z",
          "isActive": true,
          "createdBy": "66f0b5f5c4f8d2c2a3b9c121",
          "createdAt": "2026-03-20T10:40:00.000Z",
          "updatedAt": "2026-03-20T10:40:00.000Z"
        }
      }
    }
  }
}
```

#### `GET /api/budgets`

[badge:required]

```api
{
  "title": "Get all budgets",
  "description": "Returns all budgets populated with creator details and reads from Redis when cached",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/budgets",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "List of budgets",
      "body": {
        "success": true,
        "count": 1,
        "data": [
          {
            "_id": "66f0b5f5c4f8d2c2a3b9c301",
            "totalBudget": 200000,
            "financialYear": "2025-2026",
            "startDate": "2025-04-01T00:00:00.000Z",
            "endDate": "2026-03-31T00:00:00.000Z",
            "isActive": true,
            "createdBy": {
              "_id": "66f0b5f5c4f8d2c2a3b9c121",
              "name": "John Doe",
              "email": "john@example.com"
            },
            "createdAt": "2026-03-20T10:40:00.000Z",
            "updatedAt": "2026-03-20T10:40:00.000Z"
          }
        ]
      }
    }
  }
}
```

#### `GET /api/budgets/:id`

[badge:required]

```api
{
  "title": "Get budget by ID",
  "description": "Returns one budget populated with creator details and may use a cached GET payload",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/budgets/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c301", "required": true }
  ],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Budget fetched successfully",
      "body": {
        "success": true,
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c301",
          "totalBudget": 200000,
          "financialYear": "2025-2026",
          "startDate": "2025-04-01T00:00:00.000Z",
          "endDate": "2026-03-31T00:00:00.000Z",
          "isActive": true,
          "createdBy": {
            "_id": "66f0b5f5c4f8d2c2a3b9c121",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "createdAt": "2026-03-20T10:40:00.000Z",
          "updatedAt": "2026-03-20T10:40:00.000Z"
        }
      }
    },
    "404": {
      "description": "Budget not found",
      "body": {
        "success": false,
        "message": "Budget not found"
      }
    }
  }
}
```

#### `PATCH /api/budgets/:id`

[badge:required]

```api
{
  "title": "Update budget",
  "description": "Updates a budget, invalidates the budgets cache prefix, and records an audit event",
  "method": "PATCH",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/budgets/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true },
    { "key": "Content-Type", "value": "application/json", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c301", "required": true }
  ],
  "bodyType": "json",
  "requestBody": {
    "totalBudget": 250000,
    "financialYear": "2025-2026",
    "startDate": "2025-04-01",
    "endDate": "2026-03-31",
    "isActive": true
  },
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Budget updated successfully",
      "body": {
        "success": true,
        "message": "Budget updated successfully",
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c301",
          "totalBudget": 250000,
          "financialYear": "2025-2026",
          "startDate": "2025-04-01T00:00:00.000Z",
          "endDate": "2026-03-31T00:00:00.000Z",
          "isActive": true,
          "createdBy": {
            "_id": "66f0b5f5c4f8d2c2a3b9c121",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "createdAt": "2026-03-20T10:40:00.000Z",
          "updatedAt": "2026-03-20T10:45:00.000Z"
        }
      }
    },
    "404": {
      "description": "Budget not found",
      "body": {
        "success": false,
        "message": "Budget not found"
      }
    }
  }
}
```

#### `DELETE /api/budgets/:id`

[badge:required]

```api
{
  "title": "Delete budget",
  "description": "Deletes a budget and records an audit event",
  "method": "DELETE",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/budgets/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c301", "required": true }
  ],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Budget deleted successfully",
      "body": {
        "success": true,
        "message": "Budget deleted successfully"
      }
    },
    "404": {
      "description": "Budget not found",
      "body": {
        "success": false,
        "message": "Budget not found"
      }
    }
  }
}
```

### Protected category routes

*src/modules/financial-record-categories/routes/category.route.js*

These routes are mounted at `/api/categories` behind `verifyRequestJwt`.

| Router | Mounted prefix | Required scopes |
|---|---|---|
| `CategoryRouter` | `/api/categories` | `read:financial-records-categories`, `write:financial-records-categories`, `update:financial-records-categories`, `delete:financial-records-categories` |

#### `POST /api/categories`

[badge:required]

```api
{
  "title": "Create a category",
  "description": "Creates a financial record category, invalidates the categories cache prefix, and records an audit event",
  "method": "POST",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/categories",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true },
    { "key": "Content-Type", "value": "application/json", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "json",
  "requestBody": {
    "name": "Operational Cost",
    "slug": "opco",
    "type": "EXPENSE",
    "parentCategory": null,
    "icon": "wallet",
    "color": "#FF5733",
    "isActive": true
  },
  "formData": [],
  "rawBody": "",
  "responses": {
    "201": {
      "description": "Category created successfully",
      "body": {
        "success": true,
        "message": "Category created successfully",
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c401",
          "name": "Operational Cost",
          "slug": "opco",
          "type": "EXPENSE",
          "parentCategory": null,
          "icon": "wallet",
          "color": "#FF5733",
          "createdBy": "66f0b5f5c4f8d2c2a3b9c121",
          "isActive": true,
          "createdAt": "2026-03-20T10:50:00.000Z",
          "updatedAt": "2026-03-20T10:50:00.000Z"
        }
      }
    }
  }
}
```

#### `GET /api/categories`

[badge:required]

```api
{
  "title": "Get all categories",
  "description": "Returns active categories populated with parent category details and reads from Redis when cached",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/categories",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Categories fetched successfully",
      "body": {
        "success": true,
        "message": "Categories fetched successfully",
        "data": [
          {
            "_id": "66f0b5f5c4f8d2c2a3b9c401",
            "name": "Operational Cost",
            "slug": "opco",
            "type": "EXPENSE",
            "parentCategory": null,
            "icon": "wallet",
            "color": "#FF5733",
            "createdBy": "66f0b5f5c4f8d2c2a3b9c121",
            "isActive": true,
            "createdAt": "2026-03-20T10:50:00.000Z",
            "updatedAt": "2026-03-20T10:50:00.000Z"
          }
        ]
      }
    }
  }
}
```

#### `GET /api/categories/:id`

[badge:required]

```api
{
  "title": "Get category by ID",
  "description": "Returns a single category populated with parent category details and may use a cached GET payload",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/categories/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c401", "required": true }
  ],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Category fetched successfully",
      "body": {
        "success": true,
        "message": "Category fetched successfully",
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c401",
          "name": "Operational Cost",
          "slug": "opco",
          "type": "EXPENSE",
          "parentCategory": null,
          "icon": "wallet",
          "color": "#FF5733",
          "createdBy": "66f0b5f5c4f8d2c2a3b9c121",
          "isActive": true,
          "createdAt": "2026-03-20T10:50:00.000Z",
          "updatedAt": "2026-03-20T10:50:00.000Z"
        }
      }
    },
    "404": {
      "description": "Category not found",
      "body": {
        "success": false,
        "message": "Category not found"
      }
    }
  }
}
```

#### `PATCH /api/categories/:id`

[badge:required]

```api
{
  "title": "Update category",
  "description": "Updates a category, invalidates the categories cache prefix, and records an audit event",
  "method": "PATCH",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/categories/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true },
    { "key": "Content-Type", "value": "application/json", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c401", "required": true }
  ],
  "bodyType": "json",
  "requestBody": {
    "name": "Infrastructure",
    "slug": "infra",
    "type": "EXPENSE",
    "parentCategory": null,
    "icon": "server",
    "color": "#3366FF",
    "isActive": true
  },
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Category updated successfully",
      "body": {
        "success": true,
        "message": "Category updated successfully",
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c401",
          "name": "Infrastructure",
          "slug": "infra",
          "type": "EXPENSE",
          "parentCategory": null,
          "icon": "server",
          "color": "#3366FF",
          "createdBy": "66f0b5f5c4f8d2c2a3b9c121",
          "isActive": true,
          "createdAt": "2026-03-20T10:50:00.000Z",
          "updatedAt": "2026-03-20T10:55:00.000Z"
        }
      }
    },
    "404": {
      "description": "Category not found",
      "body": {
        "success": false,
        "message": "Category not found"
      }
    }
  }
}
```

#### `DELETE /api/categories/:id`

[badge:required]

```api
{
  "title": "Delete category",
  "description": "Deletes a category, invalidates the categories cache prefix, and records an audit event",
  "method": "DELETE",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/categories/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c401", "required": true }
  ],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Category deleted successfully",
      "body": {
        "success": true,
        "message": "Category deleted successfully"
      }
    },
    "404": {
      "description": "Category not found",
      "body": {
        "success": false,
        "message": "Category not found"
      }
    }
  }
}
```

### Protected financial record routes

*src/modules/financial-records/routes/financialRecord.route.js*

These routes are mounted at `/api/records` behind `verifyRequestJwt`.

| Router | Mounted prefix | Required scopes |
|---|---|---|
| `FinancialRecordRouter` | `/api/records` | `read:financial-records`, `write:financial-records`, `update:financial-records`, `delete:financial-records` |

#### `POST /api/records`

[badge:required]

```api
{
  "title": "Create a financial record",
  "description": "Creates a financial record after verifying that the category exists, invalidates the records cache prefix, and records an audit event",
  "method": "POST",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/records",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true },
    { "key": "Content-Type", "value": "application/json", "required": true }
  ],
  "queryParams": [],
  "pathParams": [],
  "bodyType": "json",
  "requestBody": {
    "amount": 5000,
    "category": "66f0b5f5c4f8d2c2a3b9c501",
    "date": "2026-03-20T00:00:00.000Z",
    "note": "Monthly salary"
  },
  "formData": [],
  "rawBody": "",
  "responses": {
    "201": {
      "description": "Financial record created successfully",
      "body": {
        "success": true,
        "message": "Financial record created successfully",
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c601",
          "amount": 5000,
          "category": "66f0b5f5c4f8d2c2a3b9c501",
          "date": "2026-03-20T00:00:00.000Z",
          "note": "Monthly salary",
          "createdBy": "66f0b5f5c4f8d2c2a3b9c121",
          "isDeleted": false,
          "createdAt": "2026-03-20T11:00:00.000Z",
          "updatedAt": "2026-03-20T11:00:00.000Z"
        }
      }
    },
    "404": {
      "description": "Category does not exist",
      "body": {
        "success": false,
        "message": "category not exist",
        "data": {
          "categoryId": "66f0b5f5c4f8d2c2a3b9c501"
        }
      }
    }
  }
}
```

#### `GET /api/records`

[badge:required]

```api
{
  "title": "Get financial records",
  "description": "Returns paginated records with optional date, category, and type filters and can serve cached GET responses",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/records",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [
    { "name": "page", "value": "1", "required": false },
    { "name": "limit", "value": "10", "required": false },
    { "name": "startDate", "value": "2026-03-01", "required": false },
    { "name": "endDate", "value": "2026-03-31", "required": false },
    { "name": "category", "value": "66f0b5f5c4f8d2c2a3b9c501", "required": false },
    { "name": "type", "value": "EXPENSE", "required": false }
  ],
  "pathParams": [],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Records fetched successfully",
      "body": {
        "success": true,
        "message": "Records fetched successfully",
        "data": [
          {
            "_id": "66f0b5f5c4f8d2c2a3b9c601",
            "amount": 5000,
            "category": {
              "_id": "66f0b5f5c4f8d2c2a3b9c501",
              "name": "Salary",
              "slug": "salary",
              "type": "INCOME",
              "parentCategory": null
            },
            "date": "2026-03-20T00:00:00.000Z",
            "note": "Monthly salary",
            "createdBy": "66f0b5f5c4f8d2c2a3b9c121",
            "isDeleted": false,
            "createdAt": "2026-03-20T11:00:00.000Z",
            "updatedAt": "2026-03-20T11:00:00.000Z"
          }
        ],
        "meta": {
          "total": 1,
          "page": 1,
          "limit": 10,
          "totalPages": 1
        }
      }
    }
  }
}
```

#### `GET /api/records/:id`

[badge:required]

```api
{
  "title": "Get financial record by ID",
  "description": "Returns one financial record and may use a cached GET payload",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/records/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c601", "required": true }
  ],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Record fetched successfully",
      "body": {
        "success": true,
        "message": "Record fetched successfully",
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c601",
          "amount": 5000,
          "category": {
            "_id": "66f0b5f5c4f8d2c2a3b9c501",
            "name": "Salary",
            "slug": "salary",
            "type": "INCOME",
            "parentCategory": null
          },
          "date": "2026-03-20T00:00:00.000Z",
          "note": "Monthly salary",
          "createdBy": "66f0b5f5c4f8d2c2a3b9c121",
          "isDeleted": false,
          "createdAt": "2026-03-20T11:00:00.000Z",
          "updatedAt": "2026-03-20T11:00:00.000Z"
        }
      }
    },
    "404": {
      "description": "Financial record not found",
      "body": {
        "success": false,
        "message": "Financial record not found"
      }
    }
  }
}
```

#### `PATCH /api/records/:id`

[badge:required]

```api
{
  "title": "Update financial record",
  "description": "Updates a financial record, invalidates the records cache prefix, and records an audit event",
  "method": "PATCH",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/records/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true },
    { "key": "Content-Type", "value": "application/json", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c601", "required": true }
  ],
  "bodyType": "json",
  "requestBody": {
    "amount": 6500,
    "category": "66f0b5f5c4f8d2c2a3b9c501",
    "date": "2026-03-21T00:00:00.000Z",
    "note": "Adjusted monthly salary"
  },
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Financial record updated successfully",
      "body": {
        "success": true,
        "message": "Financial record updated successfully",
        "data": {
          "_id": "66f0b5f5c4f8d2c2a3b9c601",
          "amount": 6500,
          "category": "66f0b5f5c4f8d2c2a3b9c501",
          "date": "2026-03-21T00:00:00.000Z",
          "note": "Adjusted monthly salary",
          "createdBy": "66f0b5f5c4f8d2c2a3b9c121",
          "isDeleted": false,
          "createdAt": "2026-03-20T11:00:00.000Z",
          "updatedAt": "2026-03-20T11:05:00.000Z"
        }
      }
    },
    "404": {
      "description": "Financial record not found",
      "body": {
        "success": false,
        "message": "Financial record not found"
      }
    }
  }
}
```

#### `DELETE /api/records/:id`

[badge:required]

```api
{
  "title": "Delete financial record",
  "description": "Deletes a financial record and records an audit event",
  "method": "DELETE",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/records/:id",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [],
  "pathParams": [
    { "name": "id", "value": "66f0b5f5c4f8d2c2a3b9c601", "required": true }
  ],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Financial record deleted successfully",
      "body": {
        "success": true,
        "message": "Financial record deleted successfully"
      }
    },
    "404": {
      "description": "Financial record not found",
      "body": {
        "success": false,
        "message": "Financial record not found"
      }
    }
  }
}
```

### Protected audit log route

*src/modules/audit-logs/routes/auditLogs.route.js*

These routes are mounted at `/api/audit-logs` behind `verifyRequestJwt`.

| Router | Mounted prefix | Required scope |
|---|---|---|
| `AuditLogRouter` | `/api/audit-logs` | `read:audit-logs` |

#### `GET /api/audit-logs`

[badge:required]

```api
{
  "title": "Get audit logs",
  "description": "Returns paginated audit log entries populated with the user who performed each action",
  "method": "GET",
  "baseUrl": "<FinanceApiBaseUrl>",
  "endpoint": "/api/audit-logs",
  "headers": [
    { "key": "Cookie", "value": "accessToken=<token>", "required": true }
  ],
  "queryParams": [
    { "name": "page", "value": "1", "required": false },
    { "name": "limit", "value": "20", "required": false }
  ],
  "pathParams": [],
  "bodyType": "none",
  "requestBody": "",
  "formData": [],
  "rawBody": "",
  "responses": {
    "200": {
      "description": "Audit logs fetched",
      "body": {
        "success": true,
        "message": "Audit logs fetched",
        "data": [
          {
            "_id": "66f0b5f5c4f8d2c2a3b9c701",
            "action": "UPDATE",
            "entity": "FinancialRecord",
            "entityId": "66f0b5f5c4f8d2c2a3b9c601",
            "performedBy": {
              "_id": "66f0b5f5c4f8d2c2a3b9c121",
              "name": "John Doe",
              "email": "john@example.com"
            },
            "changes": {
              "amount": 6500,
              "note": "Adjusted monthly salary"
            },
            "createdAt": "2026-03-20T11:05:00.000Z",
            "updatedAt": "2026-03-20T11:05:00.000Z"
          }
        ],
        "meta": {
          "page": 1,
          "limit": 20,
          "total": 1
        }
      }
    }
  }
}
```

## Protected vs Public Route Split

### Public routes

Mounted without `verifyRequestJwt`:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/verify/:token`

These routes are reachable without an access token cookie.

### Protected routes

Mounted with `verifyRequestJwt`:

- `/api/users`
- `/api/analytics`
- `/api/budgets`
- `/api/categories`
- `/api/records`
- `/api/audit-logs`

These routes require the `accessToken` cookie and, in addition, a scope match enforced by `scopeValidation` on each feature route.

## Caching Strategy

### Redis cache flow

*src/shared/middleware/cache-manager/cacheRead.middleware.js*  
*src/shared/middleware/cache-manager/cacheCreate.middleware.js*

| Method | Description | Cache behavior |
|---|---|---|
| `cacheRead` | Reads a cached GET response before the controller runs | Hit returns cached JSON immediately |
| `cacheCreate` | Stores GET responses after the controller sets `res.locals.responseData` | Writes payload with TTL |
| `invalidateCache` | Used by mutating controllers | Clears prefix-based caches after create, update, or delete actions |

Observed invalidation prefixes:

- `users:*`
- `budgets:*`
- `categories:*`
- `records:*`

Observed cache keys are built from the route prefix plus `req.originalUrl`, which preserves query strings for list endpoints.

### Cache read and write sequence

```mermaid
sequenceDiagram
    participant Client as Client
    participant Read as cacheRead
    participant Ctrl as Controller
    participant Write as cacheCreate
    participant Redis as Redis

    Client->>Read: GET request
    Read->>Redis: get prefix originalUrl
    alt Cache hit
        Redis-->>Read: cached payload
        Read-->>Client: cached JSON
    else Cache miss
        Redis-->>Read: empty
        Read->>Ctrl: next
        Ctrl-->>Write: res.locals.responseData
        Write->>Redis: setEx prefix originalUrl ttl payload
        Write-->>Client: normalized JSON
    end
```

## Error Handling

### Global error middleware

*src/shared/middleware/response-handler/error.middleware.js*

The global error handler is the final middleware in the chain and is responsible for standardizing error payloads.

| Error type | HTTP status | Message |
|---|---|---|
| `CastError` | `400` | `Invalid resource ID` |
| Duplicate key `11000` | `400` | `Duplicate field value` |
| `ValidationError` | `400` | Merged validation messages |
| General error | `err.statusCode` or `500` | `err.message` or `Internal Server Error` |

### Route-level error propagation

Controllers and middlewares consistently call `next(err)` for async failures. Route-level not-found cases either:

- call `next({ statusCode, message })`, which reaches `globalErrorHandler`, or
- return direct `res.status(...).json(...)` responses in a few handlers such as budget and category lookups.

## Dependencies

### Runtime packages visible in the bootstrap path

- `express`
- `cors`
- `cookie-parser`
- `swagger-ui-express`
- `swagger-jsdoc`
- `express-rate-limit`
- `jsonwebtoken`
- `mongoose`
- `dotenv`

### Runtime services

- MongoDB via `connectMongoDb`
- Redis via `redisClient` from the cache middleware dependency chain
- Cookie-based JWT auth via `accessToken`
- Swagger/OpenAPI docs at `/api-docs`

## Testing Considerations

### Observed test-time behavior

- `cacheRead` and `cacheCreate` both short-circuit in `NODE_ENV === "test"`.
- Integration tests mount controllers directly under `/api` and add a synthetic `req.user` in test middleware.
- The production auth middleware and scope middleware are bypassed in controller-level tests, so protected-route tests are focused on controller behavior rather than auth plumbing.

### Runtime behavior verified by tests

- Budget, category, financial record, and analytics controllers are exercised with in-memory MongoDB.
- Response serialization in tests mirrors the `res.locals.responseData` pattern used by the app-level response middleware.

## Key Classes Reference

| Class | Responsibility |
|---|---|
| `index.js` | Creates the Express app, mounts middleware, wires routers, starts the server, and triggers MongoDB connection |
| `swagger.config.js` | Builds the OpenAPI document and cookie auth scheme |
| `mongoDb.config.js` | Connects to MongoDB using environment-specific targets |
| `auth.middleware.js` | Verifies the `accessToken` cookie and populates `req.user` |
| `scope.validation.middleware.js` | Enforces route-level permission scopes |
| `ratelimiter.middleware.js` | Builds the `/api` rate limiter |
| `cacheRead.middleware.js` | Serves cached GET responses from Redis |
| `cacheCreate.middleware.js` | Persists GET responses to Redis |
| `response.middleware.js` | Normalizes controller output into JSON |
| `error.middleware.js` | Converts thrown errors into standardized JSON responses |
| `auditLogger.middleware.js` | Writes audit log records from `res.locals.auditLog` |
| `auth.route.js` | Mounts public authentication endpoints |
| `user.route.js` | Mounts protected user endpoints |
| `analytics.route.js` | Mounts protected analytics endpoints |
| `budget.route.js` | Mounts protected budget endpoints |
| `category.route.js` | Mounts protected category endpoints |
| `financialRecord.route.js` | Mounts protected financial record endpoints |
| `auditLogs.route.js` | Mounts protected audit log endpoints |
