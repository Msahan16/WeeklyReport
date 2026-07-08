# WeeklyReport

A full-stack weekly report management application built with **React** (frontend) and **Spring Boot** (backend), using **MySQL** as the database.

---

## Prerequisites

Ensure the following are installed on your machine before proceeding:

| Tool         | Version    | Download Link                                                  |
| ------------ | ---------- | -------------------------------------------------------------- |
| **Node.js**  | v18+       | [https://nodejs.org/](https://nodejs.org/)                     |
| **npm**      | v9+        | Bundled with Node.js                                           |
| **Java JDK** | 21         | [https://adoptium.net/](https://adoptium.net/)                 |
| **Maven**    | 3.9+       | Bundled via Maven Wrapper (`mvnw`) — no separate install needed |
| **MySQL**    | 8.0+       | [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/) |

---

## 1. Database Setup (MySQL)

### 1.1 Start MySQL Server

Make sure the MySQL service is running on your machine:

- **Windows**: Open **Services** (`services.msc`) → find **MySQL** → click **Start**
- **macOS**: `brew services start mysql`
- **Linux**: `sudo systemctl start mysql`

### 1.2 Create the Database

Log in to MySQL and create the required database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE weekly_report_db;
```

### 1.3 Verify Connection Settings

The backend expects MySQL with the following defaults (configured in `backend/src/main/resources/application.properties`):

| Property   | Default Value                                              |
| ---------- | ---------------------------------------------------------- |
| **Host**   | `localhost`                                                |
| **Port**   | `3306`                                                     |
| **Database** | `weekly_report_db`                                       |
| **Username** | `root`                                                   |
| **Password** | *(empty — no password)*                                  |

> **Note:** If your MySQL root user has a password, update `spring.datasource.password` in  
> `backend/src/main/resources/application.properties`.

Tables are **auto-created** on startup via `spring.jpa.hibernate.ddl-auto=update` — no manual schema setup is needed.

---

## 2. Backend (Spring Boot)

### 2.1 Install Dependencies & Build

Navigate to the backend directory and use the Maven Wrapper to install dependencies:

```bash
cd backend
```

**Windows:**
```bash
mvnw.cmd clean install -DskipTests
```

**macOS / Linux:**
```bash
./mvnw clean install -DskipTests
```

### 2.2 Run the Backend Server

```bash
# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

The backend API will start on **http://localhost:8080**.

> **Tip:** The project includes `spring-boot-devtools`, so the server will auto-restart on code changes during development.

---

## 3. Frontend (React)

### 3.1 Install Dependencies

Navigate to the frontend directory and install npm packages:

```bash
cd frontend
npm install
```

### 3.2 Configure Environment Variables

The frontend uses a `.env` file for configuration. A `.env` file already exists with the following variable:

```
REACT_APP_OPENROUTER_API_KEY=<your-openrouter-api-key>
```

> **Note:** If you need to use your own OpenRouter API key, update the value in `frontend/.env`.

### 3.3 Run the Frontend Dev Server

```bash
npm start
```

The React app will start on **http://localhost:3000** and automatically open in your browser.

---

## Quick Start (TL;DR)

Run these commands in order from the project root:

```bash
# 1. Start MySQL and create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS weekly_report_db;"

# 2. Start the backend (new terminal)
cd backend
mvnw.cmd clean install -DskipTests     # Windows
mvnw.cmd spring-boot:run               # Windows

# 3. Start the frontend (new terminal)
cd frontend
npm install
npm start
```

---

## Project Structure

```
WeeklyReport/
├── backend/                  # Spring Boot API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/         # Java source files
│   │   │   └── resources/    # application.properties
│   │   └── test/             # Test files
│   ├── pom.xml               # Maven dependencies
│   └── mvnw / mvnw.cmd       # Maven Wrapper scripts
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   └── pages/            # Page-level components
│   ├── public/               # Static assets
│   ├── package.json          # npm dependencies
│   └── .env                  # Environment variables
│
└── README.md                 # ← You are here
```

---

## Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| **Frontend** | React 19, React Router, Axios, Recharts, SweetAlert2 |
| **Backend**  | Spring Boot 4.1, Spring Security, Spring Data JPA |
| **Auth**     | JWT (jjwt 0.11.5)                               |
| **Database** | MySQL 8.0+                                       |
| **Java**     | JDK 21                                           |

---

## Troubleshooting

| Issue                              | Solution                                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `Access denied for user 'root'`    | Set your MySQL password in `backend/src/main/resources/application.properties`            |
| `Port 8080 already in use`         | Stop the other process or change the port in `application.properties` with `server.port`  |
| `Port 3000 already in use`         | React will prompt to use another port — press `Y` to accept                              |
| `npm install` fails                | Delete `node_modules` and `package-lock.json`, then run `npm install` again               |
| MySQL connection refused           | Ensure MySQL service is running and the `weekly_report_db` database exists                |
