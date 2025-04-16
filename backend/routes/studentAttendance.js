const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const auth = require("../middleware/auth");

// Get attendance for a specific student across all courses
router.get("/student", auth, async (req, res) => {
  try {
    // Ensure the user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied. Students only." });
    }

    const studentId = req.user.id;

    // Find all courses that have this student
    const courses = await Course.find({
      "students._id": studentId,
    });

    if (courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this student" });
    }

    // Get course IDs
    const courseIds = courses.map((course) => course._id);

    // Get attendance records for this student across all courses
    const attendanceRecords = await Attendance.find({
      course: { $in: courseIds },
      "student._id": studentId,
    }).sort({ date: -1 });

    // Group attendance by course
    const attendanceBySubject = {};

    for (const record of attendanceRecords) {
      const course = courses.find(
        (c) => c._id.toString() === record.course.toString()
      );

      if (course) {
        if (!attendanceBySubject[course.name]) {
          attendanceBySubject[course.name] = {
            courseName: course.name,
            className: course.class_name,
            records: [],
          };
        }

        attendanceBySubject[course.name].records.push({
          date: record.date,
          status: record.status,
        });
      }
    }

    res.json(Object.values(attendanceBySubject));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
