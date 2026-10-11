# Simply Jobs (JobTracker)
Job application tracker built with Next.js, Spring Boot, and MySQL

## Features

- Database initializes as empty, so new users must add applications manually via frontend form
- Add, edit, and delete applications (company, job title, applied on date). New applications default to 'Applied'
- Setting status: 'Applied', 'Interview Pending', 'Obtained Offer' or 'Rejected'
- Search by company name or job title and filter by status. Results are sorted by application date, newest first
- Clicking nodes on Sankey chart allow table view of matching applications

## Tech stack
| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Recharts |
| Backend | Java 21, Spring Boot 4.1, Spring Data JPA |
| Database | MySQL, Flyway |

## Setup (Windows)

**Requirements:** JDK 21, Node.js 20.9+, MySQL Server, and Git. Run commands below in PowerShell. Maven does not need to be installed as Maven Wrapper is included

### 1. Clone repo

```powershell
git clone https://github.com/pedroorozco/JobTracker.git
cd JobTracker
```

### 2. Create database

Open a MySQL client as admin, such as the MySQL Command Line Client from the Start menu. You can also run `mysql -u root -p` if MySQL's `bin` folder is on your PATH. Then run:

```sql
CREATE DATABASE jobtracker;
CREATE USER 'jobtracker_app'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON jobtracker.* TO 'jobtracker_app'@'localhost';
```

Flyway creates tables when backend starts. To change the host, database, or username, edit [`application.properties`](backend/src/main/resources/application.properties)

### 3. Start backend

```powershell
cd backend
$jobTrackerPassword = Read-Host "Password for jobtracker_app" -AsSecureString
$env:JOBTRACKER_DB_PASSWORD = [System.Net.NetworkCredential]::new("", $jobTrackerPassword).Password
.\mvnw.cmd spring-boot:run
```

You will be prompted for the jobtracker_app password. The password variable only lasts for the current PowerShell window, so it must be set again whenever you open a new one. The backend runs on port 8080. To confirm it is running, visit http://localhost:8080/api/health and look for `"status": "UP"`

### 4. Start frontend

In a second PowerShell window, from repository root:

```powershell
cd frontend
npm ci # first run only
npm run dev
```

Open http://localhost:3000

Next.js forwards `/api/*` requests to the backend, so both servers must be running

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/applications` | List applications (newest ID first) |
| `POST` | `/api/applications` | Create an application |
| `PATCH` | `/api/applications/{id}` | Update company, job title, and date |
| `PATCH` | `/api/applications/{id}/status` | Update status |
| `DELETE` | `/api/applications/{id}` | Delete an application |

## Limitations

- The Gmail and LinkedIn import buttons currently only open informative dialogs. Importing is not implemented
- Interview-date scheduling has not been implemented yet
- No authentication, everyone using the same backend shares the same data
