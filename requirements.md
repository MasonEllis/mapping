# Software Requirements Document

## 1. Project Overview
Web-based platform for storing object mappings. Users input JSON examples, create objects, define mapping profiles via modern UI. Mappings stored in MariaDB via Docker Compose.

## 2. Functional Requirements
- **JSON Input**: Users enter JSON examples for source/target objects.
- **Object Creation**: Generate objects from JSON inputs.
- **Mapping UI**: Modern interface to define mappings between two objects (drag-drop, visual links).
- **Profile Management**: Create, edit, delete, store mapping profiles.
- **Storage**: Persist mappings in MariaDB.

## 3. Non-Functional Requirements
- **Tech Stack**: Web app (e.g., React/Vue), backend API, Docker Compose for MariaDB.
- **Database**: MariaDB containerized.
- **UI**: Responsive, modern (e.g., Material UI/Tailwind).
- **Performance**: Load/save mappings <2s.
- **Security**: Authenticate users; validate JSON inputs.

## 4. System Architecture
- Frontend: Browser-based UI.
- Backend: API for JSON parsing, mapping logic, DB ops.
- Database: MariaDB via `docker-compose.yml`.
- Deployment: Local via Docker Compose.

## 5. Docker Compose Setup
```yaml
version: '3'
services:
  db:
    image: mariadb:latest
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: mappings
    ports:
      - "3306:3306"
    volumes:
      - db-data:/var/lib/mysql
volumes:
  db-data: