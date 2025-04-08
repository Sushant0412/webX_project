require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Course = require("./models/Course");
const Attendance = require("./models/Attendance");

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/attendance_tracker",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Sample data
const teachers = [
  {
    name: "John Smith",
    email: "john.smith@example.com",
    password: "password123",
    role: "teacher",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    password: "password123",
    role: "teacher",
  },
];

const students = [
  {
    name: "Alice Brown",
    email: "alice.brown@example.com",
    password: "password123",
    role: "student",
    class_name: "10A",
    roll_number: "1001",
  },
  {
    name: "Bob Wilson",
    email: "bob.wilson@example.com",
    password: "password123",
    role: "student",
    class_name: "10A",
    roll_number: "1002",
  },
  {
    name: "Charlie Davis",
    email: "charlie.davis@example.com",
    password: "password123",
    role: "student",
    class_name: "10B",
    roll_number: "2001",
  },
  {
    name: "David Lee",
    email: "david.lee@example.com",
    password: "password123",
    role: "student",
    class_name: "10A",
    roll_number: "1003",
  },
  {
    name: "Emma Taylor",
    email: "emma.taylor@example.com",
    password: "password123",
    role: "student",
    class_name: "10A",
    roll_number: "1004",
  },
  {
    name: "Frank Miller",
    email: "frank.miller@example.com",
    password: "password123",
    role: "student",
    class_name: "10A",
    roll_number: "1005",
  },
  {
    name: "Grace Chen",
    email: "grace.chen@example.com",
    password: "password123",
    role: "student",
    class_name: "10A",
    roll_number: "1006",
  },
  {
    name: "Henry Zhang",
    email: "henry.zhang@example.com",
    password: "password123",
    role: "student",
    class_name: "10A",
    roll_number: "1007",
  },
  {
    name: "Isabella Kim",
    email: "isabella.kim@example.com",
    password: "password123",
    role: "student",
    class_name: "10A",
    roll_number: "1008",
  },
  {
    name: "Jack Wang",
    email: "jack.wang@example.com",
    password: "password123",
    role: "student",
    class_name: "10A",
    roll_number: "1009",
  },
  {
    name: "Karen Liu",
    email: "karen.liu@example.com",
    password: "password123",
    role: "student",
    class_name: "10A",
    roll_number: "1010",
  },
  {
    name: "Lucas Park",
    email: "lucas.park@example.com",
    password: "password123",
    role: "student",
    class_name: "10A",
    roll_number: "1011",
  },
];

const courses = [
  {
    name: "Mathematics",
    class_name: "10A",
  },
  {
    name: "Physics",
    class_name: "10B",
  },
  {
    name: "English",
    class_name: "10A",
  },
  {
    name: "Chemistry",
    class_name: "10A",
  },
  {
    name: "Biology",
    class_name: "10A",
  },
  {
    name: "History",
    class_name: "10A",
  },
  {
    name: "Computer Science",
    class_name: "10A",
  },
];

// Seed the database
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Attendance.deleteMany({});

    // Create teachers
    const createdTeachers = await User.create(teachers);

    // Create students
    const createdStudents = await User.create(students);

    // Create courses with teachers and students
    const coursesWithData = courses.map((course, index) => ({
      ...course,
      teacher: createdTeachers[index % createdTeachers.length]._id,
      students: createdStudents
        .filter((student) => student.class_name === course.class_name)
        .map((student) => ({
          _id: student._id,
          name: student.name,
          roll_number: student.roll_number,
        })),
    }));

    await Course.create(coursesWithData);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
