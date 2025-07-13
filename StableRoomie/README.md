# StableRoomie - Roommate Matching System

A Spring Boot application for matching roommates at SSN College of Engineering.

## Setup Instructions

### Prerequisites

- Java 17 or higher
- Maven
- PostgreSQL database
- Google OAuth credentials

### Environment Variables

Before running the application, you need to set up the following environment variables:

1. **Google OAuth Configuration:**

   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret

2. **Database Configuration (if using external database):**
   - `SPRING_DATASOURCE_URL`: Database connection URL
   - `SPRING_DATASOURCE_USERNAME`: Database username
   - `SPRING_DATASOURCE_PASSWORD`: Database password

### Setting Environment Variables

#### On Windows:

```cmd
set GOOGLE_CLIENT_ID=your_client_id_here
set GOOGLE_CLIENT_SECRET=your_client_secret_here
```

#### On macOS/Linux:

```bash
export GOOGLE_CLIENT_ID=your_client_id_here
export GOOGLE_CLIENT_SECRET=your_client_secret_here
```

#### Using .env file (recommended for development):

Create a `.env` file in the project root with:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### Running the Application

1. Clone the repository
2. Set up environment variables
3. Run: `mvn spring-boot:run`
4. Access the application at: `http://localhost:8080`

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google` (for development)
   - `https://yourdomain.com/login/oauth2/code/google` (for production)
6. Copy the Client ID and Client Secret to your environment variables

## Security Notes

- Never commit actual credentials to version control
- Use environment variables for all sensitive configuration
- The `application.properties` file uses placeholder values that are replaced by environment variables
- See `env.example` for the required environment variables structure
