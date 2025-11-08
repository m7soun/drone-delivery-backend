# Drone Delivery Management Backend

A production-ready NestJS backend for managing autonomous drone deliveries with JWT authentication, role-based access control, real-time tracking, and intelligent handoff systems.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Method 1: Using Makefile (Easiest)](#method-1-using-makefile-easiest)
  - [Method 2: Using Docker Compose Directly](#method-2-using-docker-compose-directly)
  - [Method 3: Native Setup (Without Docker)](#method-3-native-setup-without-docker)
- [Database Seeding](#database-seeding)
- [API Testing](#api-testing)
  - [Using Bruno (Recommended)](#using-bruno-recommended)
  - [Using Swagger UI](#using-swagger-ui)
  - [Using cURL](#using-curl)
- [Complete API Reference](#complete-api-reference)
  - [Authentication APIs](#authentication-apis)
  - [Enduser APIs](#enduser-apis)
  - [Drone APIs](#drone-apis)
  - [Admin APIs](#admin-apis)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)

---

## Features

✅ **Authentication & Authorization**
- JWT-based authentication with bcrypt password hashing
- Role-based access control (RBAC): Admin, Enduser, Drone
- Automatic token generation and validation

✅ **Order Management**
- Create orders with origin/destination coordinates
- Real-time order status tracking
- Live ETA calculation using Haversine formula
- Order lifecycle: PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED

✅ **Drone Operations**
- Reserve jobs from available orders
- Real-time location updates via heartbeat
- Mark orders as delivered/failed
- Self-reporting drone breakdowns

✅ **Critical Handoff System**
- Automatic order reassignment when drones fail
- Persistent handoff records
- No orders lost due to drone failures

✅ **Admin Controls**
- Bulk view all orders and drones
- Update order origin/destination
- Manually mark drones as broken/fixed

✅ **Developer Experience**
- Complete Bruno API collection (23 requests)
- Swagger/OpenAPI documentation
- Comprehensive test suite (54 tests)
- Smart database seeding with realistic data

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | NestJS 10+ with TypeScript 5+ |
| **Database** | PostgreSQL 15+ |
| **ORM** | Prisma 6+ |
| **Authentication** | JWT with Passport |
| **Validation** | class-validator & class-transformer |
| **Documentation** | Swagger/OpenAPI 3.0 |
| **Testing** | Jest (Unit & E2E) |
| **Containerization** | Docker & Docker Compose |
| **API Client** | Bruno (collection included) |

---

## Getting Started

### Prerequisites

Choose your setup method based on what you have installed:

| Method | Requirements |
|--------|--------------|
| **Makefile** | Docker, Docker Compose, Make |
| **Docker Compose** | Docker, Docker Compose |
| **Native** | Node.js 18+, PostgreSQL 15+, npm |

---

### Method 1: Using Makefile (Easiest)

The Makefile provides convenient commands for all operations.

```bash
git clone <repository-url>
cd drone-delivery-backend

cp .env.example .env

make up

make seed

make logs
```

**Available Make Commands:**

| Command | Description |
|---------|-------------|
| `make up` | Start all services (app + database) |
| `make down` | Stop all services |
| `make restart` | Restart all services |
| `make logs` | View application logs |
| `make logs-db` | View database logs |
| `make seed` | Seed database with test data |
| `make test` | Run unit tests |
| `make test-e2e` | Run E2E tests |
| `make clean` | Stop services and remove volumes |
| `make build` | Rebuild Docker images |

**Access the application:**
- API: http://localhost:3000
- Swagger: http://localhost:3000/api
- Health: http://localhost:3000/health

---

### Method 2: Using Docker Compose Directly

If you don't have Make installed, use Docker Compose directly.

```bash
git clone <repository-url>
cd drone-delivery-backend

cp .env.example .env

docker-compose up -d

docker-compose exec app npm run seed

docker-compose logs -f app
```

**Docker Compose Commands:**

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start in background |
| `docker-compose up` | Start with logs visible |
| `docker-compose down` | Stop services |
| `docker-compose ps` | Check service status |
| `docker-compose logs -f app` | Follow app logs |
| `docker-compose logs -f postgres` | Follow database logs |
| `docker-compose exec app npm run seed` | Seed database |
| `docker-compose exec app npm test` | Run tests |
| `docker-compose down -v` | Remove all data |
| `docker-compose up -d --build` | Rebuild and start |

**Troubleshooting:**

```bash
docker-compose ps

docker-compose restart app

docker-compose logs app --tail=50

docker-compose down && docker-compose up -d --build
```

---

### Method 3: Native Setup (Without Docker)

Run the application directly on your machine.

**Step 1: Install Dependencies**

```bash
git clone <repository-url>
cd drone-delivery-backend
npm install
```

**Step 2: Setup PostgreSQL**

Install PostgreSQL 15+ on your machine or run it with Docker:

```bash
docker run --name drone-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=drone_delivery \
  -p 5432:5432 \
  -d postgres:15-alpine
```

**Step 3: Configure Environment**

```bash
cp .env.example .env
```

The `.env` file is ready to use with default values. For production, update:

```env
DB_PASSWORD=your-secure-password
JWT_SECRET=your-strong-random-secret
```

**Step 4: Setup Database**

```bash
npx prisma generate

npx prisma migrate deploy

npm run seed
```

**Step 5: Run Application**

```bash
npm run start:dev
```

**Development Commands:**

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start in watch mode |
| `npm run start` | Start in production mode |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run seed` | Seed database |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Lint code with ESLint |

**Database Commands:**

| Command | Description |
|---------|-------------|
| `npx prisma studio` | Open Prisma Studio GUI |
| `npx prisma migrate dev` | Create new migration |
| `npx prisma migrate reset` | Reset database |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma db push` | Push schema without migration |

---

## Database Seeding

The application includes a smart seeding system that populates the database with realistic test data.

### Running the Seed

**With Makefile:**
```bash
make seed
```

**With Docker Compose:**
```bash
docker-compose exec app npm run seed
```

**Without Docker:**
```bash
npm run seed
```

### Seeded Data

**Users (12 total):**
- 2 Admins
- 5 Endusers
- 5 Drones

**Test Credentials (Password: `password123` for all):**

| Role | Email |
|------|-------|
| **Admin** | admin@dronedelivery.com |
| **Enduser** | john.doe@example.com |
| **Drone** | drone.alpha@dronedelivery.com |

**Drones (5 total):**
- DRN-ALPHA-001 (BROKEN) - Needs repair
- DRN-BETA-002 (BUSY) - On delivery
- DRN-GAMMA-003 (AVAILABLE) - Ready
- DRN-DELTA-004 (BROKEN) - Needs repair
- DRN-EPSILON-005 (MAINTENANCE) - Under maintenance

**Orders (12 total):**
- 3 PENDING - Waiting for assignment
- 1 ASSIGNED - Drone assigned but not picked up
- 1 IN_TRANSIT - Currently being delivered
- 5 DELIVERED - Successfully completed
- 1 FAILED - Delivery failed
- 1 PENDING_HANDOFF - Original drone broke, needs new drone

**Real NYC Locations:**
- Times Square (40.758, -73.9855)
- Central Park (40.7829, -73.9654)
- Empire State Building (40.7484, -73.9857)
- Brooklyn Bridge (40.7061, -73.9969)
- Statue of Liberty (40.6892, -74.0445)

---

## API Testing

### Using Bruno (Recommended)

Bruno is a modern, offline-first API client. We provide a complete collection with 23 pre-configured requests.

**Installation & Setup:**

1. **Download Bruno:** https://www.usebruno.com
2. **Install** the application
3. **Open Collection:**
   - Launch Bruno
   - Click "Open Collection"
   - Navigate to `drone-delivery-backend/bruno-collection`
   - Select the folder

4. **Start Application:**
   ```bash
   make up
   make seed
   ```

5. **Select Environment:**
   - In Bruno, select "Local" from environment dropdown
   - This sets `baseUrl` to `http://localhost:3000`

**Bruno Collection Structure:**

The collection includes 23 requests organized in 4 folders:

**1. Auth (6 requests)**
- Register as Enduser
- Register as Drone
- Register as Admin
- Login as Enduser
- Login as Drone
- Login as Admin

**2. Orders (4 requests)**
- Create Order
- Get All Orders
- Get Order by ID
- Withdraw Order

**3. Drones (7 requests)**
- Reserve Job
- Grab Order
- Heartbeat (Update Location)
- Mark Delivered
- Mark Failed
- Mark Broken (Creates Handoff)
- Get Current Order

**4. Admin (6 requests)**
- Get All Orders
- Update Order Origin
- Update Order Destination
- Get All Drones
- Mark Drone Broken
- Mark Drone Fixed

**Auto-Save Tokens:**

All authentication requests automatically save tokens to environment variables:
- `enduserToken` - Saved from Enduser login/register
- `droneToken` - Saved from Drone login/register
- `adminToken` - Saved from Admin login/register

**Example Workflow:**

```
1. Run "Login as Enduser" → Token saved automatically
2. Run "Create Order" → Uses {{enduserToken}} automatically
3. Run "Login as Drone" → Token saved automatically
4. Run "Reserve Job" → Uses {{droneToken}} automatically
5. Run "Grab Order" → Enter order ID from step 2
6. Run "Heartbeat" → Update location
7. Run "Mark Delivered" → Complete delivery
```

**Seeded Credentials (for Login):**

```
Admin:   admin@dronedelivery.com / password123
Enduser: john.doe@example.com / password123
Drone:   drone.alpha@dronedelivery.com / password123
```

**New Accounts (for Register):**

```
Admin:   newadmin@dronedelivery.com / password123
Enduser: sarah.connor@example.com / password123
Drone:   drone.zeta@dronedelivery.com / password123
```

**Pre-filled Drone IDs:**

For admin endpoints, the following drone IDs are pre-filled:
- Mark Drone Broken: `31328264-9f2e-4d37-a2f3-252f761ebbd0` (DRN-DELTA-004)
- Mark Drone Fixed: `61b62d39-c679-48bf-93fd-ffc3a49df783` (DRN-ALPHA-001)

**Drone Login Response:**

When logging in as a DRONE, the response includes `droneId`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "83e3916e-55ea-4369-a2da-de6f6f2987d9",
    "name": "drone.alpha@dronedelivery.com",
    "role": "DRONE"
  },
  "droneId": "61b62d39-c679-48bf-93fd-ffc3a49df783"
}
```

Use this `droneId` for admin endpoints!

---

### Using Swagger UI

Interactive API documentation with built-in testing:

1. **Access:** http://localhost:3000/api
2. **Authorize:** Click "Authorize" button, enter token as `Bearer <your_token>`
3. **Test:** Click "Try it out" on any endpoint

---

### Using cURL

Complete workflow example:

```bash
ENDUSER_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"john.doe@example.com","password":"password123"}' \
  | jq -r '.access_token')

ORDER_ID=$(curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $ENDUSER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originLat": 40.758,
    "originLng": -73.9855,
    "originAddress": "Times Square, New York, NY 10036",
    "destinationLat": 40.7829,
    "destinationLng": -73.9654,
    "destinationAddress": "Central Park, New York, NY 10024"
  }' | jq -r '.id')

echo "Order created: $ORDER_ID"

DRONE_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"drone.alpha@dronedelivery.com","password":"password123"}' \
  | jq -r '.access_token')

curl -X POST http://localhost:3000/drones/reserve-job \
  -H "Authorization: Bearer $DRONE_TOKEN"

curl -X POST http://localhost:3000/drones/grab-order \
  -H "Authorization: Bearer $DRONE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\":\"$ORDER_ID\"}"

curl -X POST http://localhost:3000/drones/heartbeat \
  -H "Authorization: Bearer $DRONE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.77, "lng": -73.98}'

curl -X POST http://localhost:3000/drones/mark-delivered \
  -H "Authorization: Bearer $DRONE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\":\"$ORDER_ID\"}"
```

---

## Complete API Reference

### Authentication APIs

All endpoints except login/register require JWT token in Authorization header: `Bearer <token>`

#### POST /auth/register

Register a new user and receive JWT token.

**Request:**
```json
{
  "name": "user@example.com",
  "password": "password123",
  "userType": "ENDUSER"
}
```

**UserTypes:** `ENDUSER`, `DRONE`, `ADMIN`

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "user@example.com",
    "role": "ENDUSER"
  },
  "droneId": "61b62d39-c679-48bf-93fd-ffc3a49df783"
}
```

**Notes:**
- Password must be at least 6 characters
- `droneId` is only included for DRONE users
- Creates drone record automatically for DRONE users

**Errors:**
- `409 Conflict` - User already exists
- `400 Bad Request` - Invalid input

---

#### POST /auth/login

Login with existing credentials.

**Request:**
```json
{
  "name": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "user@example.com",
    "role": "ENDUSER"
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

---

### Enduser APIs

Requires: `ENDUSER` role

#### POST /orders

Create a new delivery order.

**Request:**
```json
{
  "originLat": 40.758,
  "originLng": -73.9855,
  "originAddress": "Times Square, 1560 Broadway, New York, NY 10036",
  "destinationLat": 40.7829,
  "destinationLng": -73.9654,
  "destinationAddress": "Central Park, New York, NY 10024"
}
```

**Validation:**
- `originLat`: -90 to 90
- `originLng`: -180 to 180
- `destinationLat`: -90 to 90
- `destinationLng`: -180 to 180
- All address fields required

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "orderNumber": "ORD-20241108-0001",
  "customerId": "user-id",
  "originLat": 40.758,
  "originLng": -73.9855,
  "originAddress": "Times Square, 1560 Broadway, New York, NY 10036",
  "destinationLat": 40.7829,
  "destinationLng": -73.9654,
  "destinationAddress": "Central Park, New York, NY 10024",
  "status": "PENDING",
  "createdAt": "2024-11-08T12:00:00.000Z",
  "updatedAt": "2024-11-08T12:00:00.000Z"
}
```

---

#### GET /orders

Get all orders for the authenticated user.

**Response (200):**
```json
[
  {
    "id": "order-id",
    "orderNumber": "ORD-20241108-0001",
    "status": "IN_TRANSIT",
    "originAddress": "Times Square",
    "destinationAddress": "Central Park",
    "assignedDrone": {
      "id": "drone-id",
      "serialNumber": "DRN-ALPHA-001",
      "currentLat": 40.77,
      "currentLng": -73.98,
      "status": "BUSY"
    },
    "createdAt": "2024-11-08T12:00:00.000Z"
  }
]
```

---

#### GET /orders/:id

Get detailed order information with live ETA.

**Response (200):**
```json
{
  "id": "order-id",
  "orderNumber": "ORD-20241108-0001",
  "status": "IN_TRANSIT",
  "originLat": 40.758,
  "originLng": -73.9855,
  "originAddress": "Times Square",
  "destinationLat": 40.7829,
  "destinationLng": -73.9654,
  "destinationAddress": "Central Park",
  "estimatedTimeOfArrival": 8.5,
  "assignedDrone": {
    "id": "drone-id",
    "serialNumber": "DRN-ALPHA-001",
    "currentLat": 40.77,
    "currentLng": -73.98,
    "batteryLevel": 85.5
  },
  "pickedUpAt": "2024-11-08T12:05:00.000Z",
  "createdAt": "2024-11-08T12:00:00.000Z"
}
```

**Notes:**
- `estimatedTimeOfArrival` is in minutes
- Calculated using Haversine formula (drone speed: 50 km/h)
- Only included when order is IN_TRANSIT

**Errors:**
- `404 Not Found` - Order doesn't exist
- `403 Forbidden` - Order belongs to another user

---

#### DELETE /orders/:id

Withdraw/cancel an order (only if status is PENDING).

**Response (200):**
```json
{
  "id": "order-id",
  "status": "CANCELLED"
}
```

**Errors:**
- `403 Forbidden` - Can only withdraw PENDING orders

---

### Drone APIs

Requires: `DRONE` role

#### POST /drones/reserve-job

Reserve the next available job from the queue.

**Response (201):**
```json
{
  "success": true,
  "order": {
    "id": "order-id",
    "orderNumber": "ORD-20241108-0001",
    "status": "ASSIGNED",
    "originLat": 40.758,
    "originLng": -73.9855,
    "destinationLat": 40.7829,
    "destinationLng": -73.9654
  },
  "message": "Order reserved successfully"
}
```

**No Jobs Available:**
```json
{
  "success": false,
  "order": null,
  "message": "No available orders"
}
```

**Notes:**
- Finds orders with status PENDING or PENDING_HANDOFF
- Orders assigned FIFO (first in, first out)
- Updates drone status to BUSY
- Updates order status to ASSIGNED

**Errors:**
- `400 Bad Request` - Drone must be AVAILABLE
- `400 Bad Request` - Drone already has active order

---

#### POST /drones/grab-order

Pick up the assigned order and start delivery.

**Request:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201):**
```json
{
  "success": true,
  "order": {
    "id": "order-id",
    "status": "PICKED_UP",
    "pickedUpAt": "2024-11-08T12:05:00.000Z"
  },
  "message": "Order picked up successfully"
}
```

**Errors:**
- `404 Not Found` - Order not found
- `400 Bad Request` - Order not assigned to this drone
- `400 Bad Request` - Order must be in ASSIGNED status

---

#### POST /drones/heartbeat

Update current location and receive instructions.

**Request:**
```json
{
  "lat": 40.77,
  "lng": -73.98
}
```

**Validation:**
- `lat`: -90 to 90
- `lng`: -180 to 180

**Response (201):**
```json
{
  "success": true,
  "currentOrder": {
    "id": "order-id",
    "status": "IN_TRANSIT",
    "destinationLat": 40.7829,
    "destinationLng": -73.9654,
    "estimatedTimeOfArrival": 8.5
  },
  "message": "Location updated"
}
```

**Notes:**
- Updates drone's current location
- Creates location history record
- Automatically updates order status to IN_TRANSIT on first heartbeat
- Returns ETA to destination

---

#### POST /drones/mark-delivered

Mark the current order as successfully delivered.

**Request:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order marked as delivered"
}
```

**Notes:**
- Sets order status to DELIVERED
- Records delivery timestamp
- Frees up drone (status → AVAILABLE)
- Clears current order from drone

**Errors:**
- `404 Not Found` - Order not found
- `400 Bad Request` - Order not assigned to this drone

---

#### POST /drones/mark-failed

Mark the current order as failed.

**Request:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "Severe weather conditions - high winds unsafe for flight"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order marked as failed"
}
```

**Notes:**
- Sets order status to FAILED
- Records failure timestamp and reason
- Frees up drone (status → AVAILABLE)

---

#### POST /drones/mark-broken

Report drone breakdown (creates handoff for current order).

**Request:**
```json
{
  "reason": "Critical battery failure - immediate landing required"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Drone marked as broken, handoff created for order",
  "handoff": {
    "id": "handoff-id",
    "orderId": "order-id",
    "fromDroneId": "drone-id",
    "handoffLat": 40.77,
    "handoffLng": -73.98,
    "reason": "Critical battery failure"
  }
}
```

**Handoff Process:**
1. Order status → PENDING_HANDOFF
2. Creates handoff record with current location
3. Unassigns order from drone
4. Drone status → BROKEN
5. Another drone can reserve the PENDING_HANDOFF order

**Notes:**
- Only works if drone has a current order
- Handoff records persist permanently
- Critical for ensuring no orders are lost

---

#### GET /drones/current-order

Get details of the currently assigned order.

**Response (200):**
```json
{
  "id": "order-id",
  "orderNumber": "ORD-20241108-0001",
  "status": "IN_TRANSIT",
  "originLat": 40.758,
  "originLng": -73.9855,
  "destinationLat": 40.7829,
  "destinationLng": -73.9654,
  "estimatedTimeOfArrival": 8.5
}
```

**No Current Order:**
```json
{
  "message": "No current order assigned"
}
```

---

### Admin APIs

Requires: `ADMIN` role

#### GET /admin/orders

Get all orders in the system.

**Response (200):**
```json
[
  {
    "id": "order-id",
    "orderNumber": "ORD-20241108-0001",
    "status": "DELIVERED",
    "customer": {
      "id": "user-id",
      "name": "john.doe@example.com"
    },
    "assignedDrone": {
      "id": "drone-id",
      "serialNumber": "DRN-ALPHA-001"
    },
    "originAddress": "Times Square",
    "destinationAddress": "Central Park",
    "createdAt": "2024-11-08T12:00:00.000Z",
    "deliveredAt": "2024-11-08T12:15:00.000Z"
  }
]
```

---

#### PATCH /admin/orders/:id/origin

Update the origin location of an order.

**Request:**
```json
{
  "lat": 40.7614,
  "lng": -73.9776,
  "address": "Rockefeller Center, 45 Rockefeller Plaza, New York, NY 10111"
}
```

**Response (200):**
```json
{
  "id": "order-id",
  "originLat": 40.7614,
  "originLng": -73.9776,
  "originAddress": "Rockefeller Center, 45 Rockefeller Plaza, New York, NY 10111"
}
```

---

#### PATCH /admin/orders/:id/destination

Update the destination location of an order.

**Request:**
```json
{
  "lat": 40.7580,
  "lng": -73.9855,
  "address": "Bryant Park, New York, NY 10018"
}
```

**Response (200):**
```json
{
  "id": "order-id",
  "destinationLat": 40.7580,
  "destinationLng": -73.9855,
  "destinationAddress": "Bryant Park, New York, NY 10018"
}
```

---

#### GET /admin/drones

Get all drones in the system.

**Response (200):**
```json
[
  {
    "id": "61b62d39-c679-48bf-93fd-ffc3a49df783",
    "userId": "83e3916e-55ea-4369-a2da-de6f6f2987d9",
    "serialNumber": "DRN-ALPHA-001",
    "status": "BROKEN",
    "batteryLevel": 0,
    "currentLat": 40.758,
    "currentLng": -73.9855,
    "currentOrder": null,
    "createdAt": "2024-11-08T10:00:00.000Z"
  }
]
```

**Important:** Use the `id` field (not `userId`) for mark-broken/fixed endpoints!

---

#### POST /admin/drones/:id/mark-broken

Manually mark a drone as broken (admin action).

**URL Parameter:** `id` = Drone ID (get from GET /admin/drones)

**Response (201):**
```json
{
  "id": "drone-id",
  "status": "BROKEN"
}
```

**Notes:**
- Use drone's `id`, NOT `userId`!
- Example: `/admin/drones/61b62d39-c679-48bf-93fd-ffc3a49df783/mark-broken`

---

#### POST /admin/drones/:id/mark-fixed

Mark a broken drone as repaired and ready.

**URL Parameter:** `id` = Drone ID (get from GET /admin/drones)

**Response (201):**
```json
{
  "id": "drone-id",
  "status": "AVAILABLE",
  "batteryLevel": 100
}
```

**Notes:**
- Resets drone status to AVAILABLE
- Sets battery to 100%
- Drone can now reserve new jobs

---

## Testing

### Unit Tests

```bash
npm test

docker-compose exec app npm test

make test
```

**Coverage:**
- Auth Service (7 tests)
- Orders Service (6 tests)
- App Controller (6 tests)

**Total: 19 unit tests ✅**

---

### E2E Tests

```bash
npm run test:e2e

docker-compose exec app npm run test:e2e

make test-e2e
```

**Coverage:**
- Authentication (11 tests)
- Orders (8 tests)
- Drones (9 tests)
- Admin (7 tests)

**Total: 35 E2E tests ✅**

---

### Test Coverage Report

```bash
npm run test:cov
```

---

## Project Structure

```
drone-delivery-backend/
├── src/
│   ├── auth/                   # Authentication module
│   │   ├── dto/                # Login, Register DTOs
│   │   ├── strategies/         # JWT strategy
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── orders/                 # Order management
│   │   ├── dto/
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── orders.module.ts
│   │
│   ├── drones/                 # Drone operations
│   │   ├── dto/
│   │   ├── drones.controller.ts
│   │   ├── drones.service.ts
│   │   └── drones.module.ts
│   │
│   ├── admin/                  # Admin operations
│   │   ├── dto/
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── admin.module.ts
│   │
│   ├── common/                 # Shared utilities
│   │   ├── decorators/         # Custom decorators
│   │   ├── guards/             # Auth & role guards
│   │   └── enums/              # Status enums
│   │
│   ├── prisma/                 # Database service
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   └── main.ts                 # Application entry
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Seed script
│
├── test/                       # E2E tests
│   ├── auth.e2e-spec.ts
│   ├── orders.e2e-spec.ts
│   ├── drones.e2e-spec.ts
│   ├── admin.e2e-spec.ts
│   └── helpers/
│
├── bruno-collection/           # Bruno API client
│   ├── Auth/                   # 6 requests
│   ├── Orders/                 # 4 requests
│   ├── Drones/                 # 7 requests
│   ├── Admin/                  # 6 requests
│   └── environments/
│
├── docker-compose.yml          # Docker configuration
├── Dockerfile                  # Multi-stage build
├── Makefile                    # Convenient commands
└── README.md                   # This file
```

---

## Environment Configuration

### Centralized Environment Variables

All environments (Docker, native, production) use a single `.env` file. Simply copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `DB_HOST` | Database host | `localhost` | Yes |
| `DB_PORT` | Database port | `5432` | Yes |
| `DB_USER` | Database username | `postgres` | Yes |
| `DB_PASSWORD` | Database password | `postgres` | Yes |
| `DB_NAME` | Database name | `drone_delivery` | Yes |
| `DATABASE_URL` | Auto-generated PostgreSQL connection string | Auto | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRES_IN` | Token expiration time | `15m` | No |
| `PORT` | Server port | `3000` | No |

### .env File Structure

```env
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=drone_delivery

DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public

JWT_SECRET=drone-delivery-secret-key-change-in-production-2024
JWT_EXPIRES_IN=15m

PORT=3000
```

**Important:**
- For production, change `JWT_SECRET` to a strong random string
- Update `DB_PASSWORD` with a secure password
- Set `NODE_ENV=production` for production deployments
- All Docker commands (`make up`, `make prod-up`) automatically use the `.env` file

---

## License

MIT

---

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- API Documentation: http://localhost:3000/api
- Bruno Collection: See `bruno-collection/` folder

---

**Built with ❤️ using NestJS**
