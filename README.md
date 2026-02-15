# Full-Stack Freelancer Discovery Platform

A production-ready freelancer discovery and hiring platform built with Django REST Framework backend and modern frontend.

## 🚀 Tech Stack

### Backend
- **Django 4.2+** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **SimpleJWT** - JWT authentication
- **Celery** - Async task processing
- **Redis** - Celery broker & caching

### Frontend
- **HTML5, CSS3, JavaScript** (Vanilla)
- **Tailwind CSS** - Styling
- **Chart.js** - Analytics dashboards

## 📁 Project Structure

```
project_v/
├── backend/
│   ├── config/              # Django settings & configuration
│   ├── apps/
│   │   ├── authentication/  # User auth & JWT
│   │   ├── freelancers/     # Freelancer profiles
│   │   ├── recruiters/      # Recruiter profiles
│   │   ├── jobs/            # Job postings & applications
│   │   ├── notifications/   # Email & in-app notifications
│   │   └── analytics/       # Analytics & tracking
│   ├── media/               # Uploaded files
│   ├── requirements.txt     # Python dependencies
│   └── manage.py
└── frontend/                # HTML/CSS/JS files
    ├── index.html
    ├── login.html
    ├── register.html
    ├── freelancer-profile.html
    ├── style.css
    └── script.js
```

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.10+
- PostgreSQL 14+
- Redis (for Celery)
- Node.js (optional, for Tailwind CSS build)

### 1. Database Setup

```powershell
# Install PostgreSQL and create database
psql -U postgres
CREATE DATABASE freelance_platform;
CREATE USER freelance_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE freelance_platform TO freelance_user;
\q
```

### 2. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
copy .env.example .env

# Edit .env file with your settings
# Update DB_PASSWORD, EMAIL credentials, etc.

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### 3. Redis & Celery Setup

```powershell
# Install Redis for Windows
# Download from: https://github.com/microsoftarchive/redis/releases

# Start Redis server
redis-server

# In a new terminal, start Celery worker
cd backend
.\venv\Scripts\activate
celery -A config worker -l info
```

### 4. Frontend Setup

```powershell
# Navigate to frontend directory
cd frontend

# Option 1: Use Live Server in VS Code
# Install "Live Server" extension
# Right-click index.html -> Open with Live Server

# Option 2: Use Python HTTP server
python -m http.server 5500
```

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=freelance_platform
DB_USER=freelance_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Email (Gmail example)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=http://localhost:5500

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - Login (get JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `POST /api/auth/logout/` - Logout (blacklist token)
- `POST /api/auth/verify-email/` - Verify email
- `POST /api/auth/forgot-password/` - Request password reset
- `POST /api/auth/reset-password/` - Reset password
- `GET /api/auth/me/` - Get current user

### Freelancers
- `GET /api/freelancers/` - List freelancers
- `POST /api/freelancers/` - Create profile
- `GET /api/freelancers/{id}/` - Get profile
- `PATCH /api/freelancers/{id}/` - Update profile
- `DELETE /api/freelancers/{id}/` - Delete profile

### Recruiters
- `GET /api/recruiters/` - List recruiters
- `POST /api/recruiters/` - Create profile
- `GET /api/recruiters/{id}/` - Get profile
- `PATCH /api/recruiters/{id}/` - Update profile

### Jobs
- `GET /api/jobs/` - List jobs
- `POST /api/jobs/` - Create job
- `GET /api/jobs/{id}/` - Get job details
- `PATCH /api/jobs/{id}/` - Update job
- `POST /api/jobs/{id}/apply/` - Apply to job

### Notifications
- `GET /api/notifications/` - List notifications
- `PATCH /api/notifications/{id}/mark-read/` - Mark as read

### Analytics
- `GET /api/analytics/dashboard/` - Dashboard data
- `POST /api/analytics/track-event/` - Track event

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

## 🧪 Testing

```powershell
# Run tests
python manage.py test

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `DEBUG=False`
- [ ] Update `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Setup PostgreSQL on production server
- [ ] Configure static files serving
- [ ] Setup media files storage (S3/CloudFlare)
- [ ] Configure email service (SendGrid/Mailgun)
- [ ] Setup Redis for Celery
- [ ] Configure HTTPS/SSL
- [ ] Setup domain and DNS

### Deployment Options
- **Heroku**: Easy deployment with PostgreSQL addon
- **AWS**: EC2 + RDS + S3
- **DigitalOcean**: App Platform or Droplets
- **Railway**: Simple deployment with PostgreSQL

## 📝 Development Notes

### Database Models
- **User**: Custom user model with email authentication
- **FreelancerProfile**: Freelancer details, skills, portfolio
- **RecruiterProfile**: Company information
- **Job**: Job postings
- **JobApplication**: Applications to jobs
- **Notification**: In-app notifications
- **Analytics**: Event tracking

### Authentication Flow
1. User registers → Email verification sent
2. User verifies email → Account activated
3. User logs in → Receives JWT access & refresh tokens
4. Frontend stores tokens → Sends in Authorization header
5. Token expires → Use refresh token to get new access token

### Email Configuration
For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password"
3. Use the app password in `EMAIL_HOST_PASSWORD`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

### Celery Not Working
- Ensure Redis is running
- Check Celery broker URL in `.env`
- Restart Celery worker

### Email Not Sending
- Check email credentials in `.env`
- For Gmail, use App Password
- Check spam folder

### CORS Errors
- Update `CORS_ALLOWED_ORIGINS` in settings.py
- Ensure frontend URL matches

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using Django REST Framework**
