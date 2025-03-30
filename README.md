How to run on local Machine:

Install Node.js v20 from https://nodejs.org/ (LTS version)

Clone or download the project files to your local machine

Open a command prompt in the project directory and install dependencies:

npm install
npm install @sinclair/typebox
Set up your PostgreSQL database since the app uses Drizzle ORM with PostgreSQL:

Install PostgreSQL from https://www.postgresql.org/download/windows/
Create a new database
Update the database connection in server/db.ts with your credentials
Run the development server:

npm run dev
The application should start on http://localhost:5000

Common troubleshooting:

If you get TypeBox module errors, try: npm install @sinclair/typebox@latest
If you get database connection errors, check your PostgreSQL credentials
Make sure port 5000 isn't being used by another application
