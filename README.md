# 📊 GradeNest

GradeNest is a web-based platform created to help students easily compute, track, and analyze their academic performance.  
It allows users to enter grades across multiple subjects, automatically calculate averages, and visualize results in a simple, user-friendly interface.  
Designed with accuracy and accessibility in mind, GradeNest streamlines grade monitoring for both junior and senior high school students—making it easier to stay on top of academic goals.

---

## ⚙️ Tech Stack

- **Backend Framework:** Django 5.2.6  
- **Programming Language:** Python 3.13  
- **Database:** PostgreSQL (Supabase)  
- **Cloud Platform:** Supabase (Database, Authentication, Storage)  
- **Frontend:** HTML5, CSS3, JavaScript  
- **Package Management:** pip / venv  
- **Authentication:** Django Custom User Model  
- **File Storage:** Supabase Storage  

---

## 🚀 Setup & Run Instructions

### Prerequisites
- Python 3.13 or higher  
- Virtual environment (`venv`) or `pipenv` for dependency management  
- Supabase account for database hosting

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jamesgab29/CSIT327-G7-GradeNest.git
   cd CSIT327-G7-GradeNest

2. **Create and activate a virtual environment**
   python -m venv venv
   venv\Scripts\activate       # On Windows

3. **Install dependencies**
   pip install django
   pip install dj-database-url
   pip install python-dotenv
   pip install psycopg2-binary

4. **Set up environment variables**
   Create a .env file in the root directory and add:
   DATABASE_URL=postgresql://postgres.bbnisdbztrriaptaplgv:3fsqrPKWyLI25rpd@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
   
5. **Apply migrations**
   python manage.py migrate

6. **Run the development server**
   python manage.py runserver

## 👥 Team Members
| Name                             | Role               | CIT-U Email                                                             |
| -------------------------------- | ------------------ | ----------------------------------------------------------------------- |
| **Cosina, Lily Phoebe Grace T.** | Lead Developer     | [lilyphoebegrace.cosina@cit.edu](mailto:lilyphoebegrace.cosina@cit.edu) |
| **Cotiangco, James Gabriel F.**  | Backend Developer  | [jamesgabriel.cotiangco@cit.edu](mailto:jamesgabriel.cotiangco@cit.edu) |
| **Dibdib, Wayne Kenji B.**       | Database Developer | [waynekenji.dibdib@cit.edu](mailto:waynekenji.dibdib@cit.edu)           |