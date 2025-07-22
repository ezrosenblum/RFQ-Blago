# RFQ Submission Application

## Overview

This repository contains a simplified Request for Quote (RFQ) submission and viewing application built with Angular TypeScript frontend and .NET Core Web API backend. The solution includes user authentication, RFQ form submission, and a vendor view for managing submitted quotes.

## Solution Structure

The solution is organized as follows:

- **rfq-api**: Contains the .NET Core Web API application with microservices architecture.
  - **src**: Contains the source code for various services.
    - **Api**: Main API service with controllers and endpoints.
    - **Application**: Contains application-specific logic and services.
    - **Domain**: Contains domain models and business logic.
    - **DTO**: Data Transfer Objects used across the solution.
    - **EmailService**: Service responsible for sending emails.
    - **Infrastructure**: Contains infrastructure-specific code, such as repositories.
    - **NotificationService**: Service responsible for managing notifications.
    - **Worker**: Background worker service for handling asynchronous tasks.
  - **tests**: Contains unit and integration tests for the solution.
  - **docker-compose.yml**: Docker Compose configuration for API services.
  - **docker-compose.override.yml**: Override configuration for development.
  - **RFQSubmission.sln**: Solution file for Visual Studio.
  
- **rfq-app**: Contains the Angular TypeScript application.
  - **src/app/components**: Angular components for forms and views.
  - **src/app/services**: Services for API communication and authentication.
  - **src/app/models**: TypeScript models and interfaces.
  - **src/app/guards**: Route guards for authentication protection.
  - **docker-compose.yml**: Docker Compose configuration for frontend application.

## Prerequisites

Before deploying the solution, ensure the following prerequisites are met:

- **Docker**: Ensure Docker is installed on your machine.
- **Docker Compose**: Ensure Docker Compose is installed.
- **.NET SDK 8.0**: Required for building the backend (if not building via Docker).
- **Node.js**: Required for Angular development (version 18+ recommended).
- **Angular CLI**: Install globally with `npm install -g @angular/cli`.

## Environment Configuration

The environment variables required by the services are configured in the Docker Compose file. You can customize them according to your requirements:

- **PostgreSQL**:
  - `POSTGRES_DB`: Database name (default: `rfqsubmission`).
  - `POSTGRES_USER`: Username for accessing the database (default: `admin`).
  - `POSTGRES_PASSWORD`: Password for the specified user.
  - `POSTGRES_HOST`: Database host (default: `localhost`).
  - `POSTGRES_PORT`: Database port (default: `5432`).

- **ASP.NET Core**:
  - `ASPNETCORE_ENVIRONMENT`: Environment setting for the ASP.NET Core API.
    - `Development` - For development purposes
    - `Staging` - For testing
    - `Production`

- **Angular**:
  - `apiUrl`: Base URL for the backend API (default: `[http://localhost:5000](http://localhost:8090/api/v1/)`).

## Build and Deployment

### Build the Solution Locally

If you wish to build and run the solution locally for development:

#### Backend (.NET Core API)

Navigate to the rfq-api directory and build the solution:

```bash
cd rfq-api
dotnet build RFQSubmission.sln
```

To run the API service:

```bash
dotnet run --project src/Api
```

The API will be available at `http://localhost:5000`.

#### Frontend (Angular)

Navigate to the rfq-app directory and run:

```bash
cd rfq-app
npm install
ng serve
```

The Angular application will be available at `http://localhost:4200`.

#### Database Setup

Ensure PostgreSQL is running and create the database:

```bash
# Using Docker
docker run --name rfq-postgres -e POSTGRES_DB=rfqsubmission -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=passw123 -p 5432:5432 -d postgres:15

# Run database migrations from the rfq-api directory
cd rfq-api
dotnet ef database update --project src/Infrastructure --startup-project src/Api
```

### Build and Deploy with Docker

Use Docker Compose to build and deploy the solution. The application is split into two separate services:

#### API Service

Open the `.env` file in the `rfq-api` directory and ensure it contains:

```
ASPNETCORE_ENVIRONMENT=Production
POSTGRES_PASSWORD=passw123
```

Build and start the API service:

```bash
docker-compose -p rfq_api -f rfq-api/docker-compose.yml up -d --build
```

#### Frontend Application

Open the `environment.ts` and `environment.prod.ts` file in the `rfq-app` directory and ensure it contains:

```
apiUrl:[http://localhost:8090/api/v1/](http://localhost:8090/api/v1/)
```

Build and start the frontend application:

```bash
docker-compose -p rfq_app -f rfq-app/docker-compose.yml up -d --build
```

### Complete Deployment Command

To deploy both services together:

```bash
# Build and start API service
docker-compose -p rfq_api -f rfq-api/docker-compose.yml up -d --build

# Build and start frontend application
docker-compose -p rfq_app -f rfq-app/docker-compose.yml up -d --build
```

## Access the Application

After successful deployment:

- **Frontend Application**: Accessible at [http://localhost:7090](http://localhost:7090).
- **Backend API**: Accessible at [http://localhost:8090/api/v1](http://localhost:8090/api/v1).
- **API Documentation (Swagger)**: Accessible at [http://localhost:8090/swagger](http://localhost:8090/swagger).
- **PostgreSQL Database**: Accessible at `localhost:5432`.

## Application Features

### Authentication
- **Sign Up**: Create new user accounts with email and password.
- **Login**: Authenticate existing users with JWT tokens.
- **Protected Routes**: Both frontend routes and API endpoints are protected by authentication.

### RFQ Submission
- **Request Quote Form**: Submit RFQs with the following fields:
  - Description (text input, required)
  - Quantity (number input, required)
  - Unit (dropdown: LF, SF, EA, required)
  - Job Location (text input, required)
- **Client-side Validation**: All fields are validated before submission.
- **API Integration**: Form data is sent to the backend API for processing.

### Vendor View
- **RFQ List**: View all submitted RFQs in a organized table format.
- **Authentication Required**: Only logged-in users can access the vendor view.
- **Real-time Updates**: Newly submitted RFQs appear automatically.

## API Endpoints

### Authentication
- `POST /api/User` - Register new user
- `POST /api/Authenticate/login` - User login

### RFQ Management
- `POST /api/Submission` - Submit new RFQ (authenticated)
- `GET /api/Submission` - Get all RFQs (authenticated)
- `POST /api/Submission/search` - Get filtered RFQ with pagination(authenticated)
 
## Stopping the Services

To stop all running services:

```bash
# Stop API service
docker-compose -p rfq_api -f rfq-api/docker-compose.yml down

# Stop frontend application
docker-compose -p rfq_app -f rfq-app/docker-compose.yml down
```

To remove all containers, networks, and volumes:

```bash
# Remove API service containers and volumes
docker-compose -p rfq_api -f rfq-api/docker-compose.yml down -v --remove-orphans

# Remove frontend application containers and volumes
docker-compose -p rfq_app -f rfq-app/docker-compose.yml down -v --remove-orphans
```

## Troubleshooting

### Common Issues

- **Port Conflicts**: Ensure that ports 4200, 5000, and 5432 are not in use by other applications.
- **Database Connection**: Verify PostgreSQL is running and connection string is correct.
- **CORS Issues**: Ensure the backend API has proper CORS configuration for the frontend origin.

### Checking Logs

Check logs for each service:

```bash
# API service logs
docker-compose -p rfq_api -f rfq-api/docker-compose.yml logs -f

# Frontend application logs
docker-compose -p rfq_app -f rfq-app/docker-compose.yml logs -f

# Specific service logs
docker-compose -p rfq_api -f rfq-api/docker-compose.yml logs -f <service_name>
```

### Database Issues

If you encounter database connection issues:

1. Verify PostgreSQL container is running: `docker ps`
2. Check database logs: `docker-compose -p rfq_api -f rfq-api/docker-compose.yml logs -f postgres`
3. Ensure database migrations are applied: `cd rfq-api && dotnet ef database update --project src/Infrastructure --startup-project src/Api`

## Development Notes

### Code Quality
- The solution follows clean architecture principles.
- Frontend uses Angular reactive forms with proper validation.
- Backend implements repository pattern and dependency injection.
- JWT authentication is implemented for secure API access.

### Security Considerations
- JWT tokens have configurable expiration times.
- API endpoints are protected with authentication middleware.
- Input validation is implemented on both client and server sides.

## Repository Access

This repository is private. Collaborator access has been granted to:
- **ezrosenblum** (for review)

## Support

For any issues or questions, please create an issue in the GitHub repository or contact me Blagojche j_baze@live.com .
