``` markdown
# CatPair - Cat Adoption Platform

A full-stack web application for cat adoption that connects cat owners with potential adopters. The platform allows users to browse available cats, create profiles, and manage adoption requests.

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Java 25** with **Spring Boot**
- **Jakarta EE** with Jakarta imports
- **Spring Data JPA** for data persistence
- **Spring MVC** for REST API endpoints
- **Maven** for dependency management

**Frontend:**
- **React 19.2.0** with modern hooks and functional components
- **React Router DOM 6.30.3** for client-side routing
- **Vite** as build tool and development server
- **Tailwind CSS 3.4.17** for utility-first styling
- **Zustand 5.0.12** for state management
- **Axios 1.13.6** for HTTP client
- **React Toastify** for notifications

**Development Tools:**
- **ESLint 9.39.1** with React plugins for code linting
- **PostCSS** with Autoprefixer for CSS processing
- **TypeScript types** for React components

### Project Structure
```

CatPair/ ├── src/main/java/com/Aibek/CatPair/ # Backend Java source code │ ├── controllers/ # REST API controllers │ ├── services/ # Business logic services │ ├── entities/ # JPA entities │ ├── repositories/ # Data access layer │ └── CatPairApplication.java # Main Spring Boot application ├── src/main/resources/ # Backend configuration │ └── application.yml # Spring Boot configuration ├── frontend/ # React frontend application │ ├── src/ # Frontend source code │ ├── package.json # Node.js dependencies │ └── vite.config.js # Vite configuration ├── uploads/ # File upload directory ├── docker-compose.yml # Docker orchestration ├── Dockerfile # Container configuration └── pom.xml # Maven configuration``` 

## 🚀 Features

### Core Functionality
- **Cat Profiles**: Browse and view detailed cat profiles with photos
- **User Authentication**: Secure user registration and login system
- **Adoption Requests**: Submit and manage adoption applications
- **File Uploads**: Support for cat photos and documents
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

### Technical Features
- **RESTful API**: Clean API design following REST principles
- **Database Integration**: JPA/Hibernate for data persistence
- **State Management**: Zustand for efficient React state handling
- **Real-time Notifications**: Toast notifications for user feedback
- **Modern JavaScript**: ES6+ features with React 19.2.0
- **Type Safety**: TypeScript definitions for better development experience

## 🛠️ Development Setup

### Prerequisites
- **Java 25** or later
- **Node.js** and **npm**
- **Maven 3.6+**
- **Docker** and **Docker Compose** (optional)

### Backend Setup
```

bash
Install Maven dependencies
mvn clean install
Run Spring Boot application
mvn spring-boot:run``` 

### Frontend Setup
```

bash
Navigate to frontend directory
cd frontend
Install npm dependencies
npm install
Start development server
npm run dev``` 

### Docker Setup
```

bash
Build and run with Docker Compose
docker-compose up --build``` 

## 🏃‍♂️ Running the Application

### Development Mode
1. Start the backend server: `mvn spring-boot:run`
2. Start the frontend development server: `cd frontend && npm run dev`
3. Access the application at `http://localhost:5173` (frontend)
4. Backend API available at `http://localhost:8080`

### Production Mode
Use Docker Compose for production deployment:
```

bash docker-compose up -d``` 

## 📝 API Documentation

The backend provides RESTful endpoints for:
- Cat management (CRUD operations)
- User authentication and profiles
- Adoption request processing
- File upload handling

## 🔧 Configuration

- **Backend configuration**: `src/main/resources/application.yml`
- **Frontend configuration**: `frontend/vite.config.js`
- **Database configuration**: Configured via Spring Data JPA
- **Environment variables**: `.env.example` provides template

## 📁 File Storage

The application supports file uploads with files stored in the `uploads/` directory. This includes:
- Cat profile photos
- User profile pictures
- Adoption-related documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Quality
- Backend: Follow Java coding standards and Spring Boot best practices
- Frontend: ESLint configured with React-specific rules
- Use TypeScript types where available for better type safety

## 📄 License

This project is part of a software development course and is intended for educational purposes.

---

**CatPair** - Connecting cats with their forever homes! 🐱❤️
```
