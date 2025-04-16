const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const auth = require("../middleware/auth");

// Mark attendance for students
router.post(
  "/",
  [
    auth,
    [
      check("courseId", "Course ID is required").not().isEmpty(),
      check("date", "Date is required").not().isEmpty(),
      check("students", "Students attendance data is required").isObject(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { courseId, date, students } = req.body;

      // Verify course exists and belongs to teacher
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      if (course.teacher.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      // Create attendance records
      const attendanceRecords = [];
      for (const [studentId, status] of Object.entries(students)) {
        const student = course.students.find(
          (s) => s._id.toString() === studentId
        );
        if (student) {
          attendanceRecords.push({
            course: courseId,
            student: {
              _id: student._id,
              name: student.name,
              roll_number: student.roll_number,
            },
            date: new Date(date),
            status,
          });
        }
      }

      await Attendance.insertMany(attendanceRecords, { ordered: false });
      res.json({ message: "Attendance marked successfully" });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          message: "Attendance already marked for some students on this date",
        });
      }
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Get attendance reports
router.get("/reports", auth, async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;

    // Verify course exists and belongs to teacher
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.teacher.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const query = {
      course: courseId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const attendanceRecords = await Attendance.find(query)
      .sort({ date: 1, "student.name": 1 })
      .select("-__v");

    const reports = attendanceRecords.map((record) => ({
      _id: record._id,
      student_name: record.student.name,
      roll_number: record.student.roll_number,
      student_id: record.student._id,
      date: record.date,
      status: record.status,
    }));

    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update attendance status
router.put(
  "/:id",
  [auth, [check("status", "Status is required").isIn(["present", "absent"])]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status } = req.body;

      // Find the attendance record
      const attendance = await Attendance.findById(req.params.id);
      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      // Verify course exists and belongs to teacher
      const course = await Course.findById(attendance.course);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      if (course.teacher.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      // Update attendance status
      attendance.status = status;
      await attendance.save();

      res.json({
        _id: attendance._id,
        student_name: attendance.student.name,
        roll_number: attendance.student.roll_number,
        date: attendance.date,
        status: attendance.status,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Delete attendance record
router.delete("/:id", auth, async (req, res) => {
  try {
    // Find the attendance record
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Verify course exists and belongs to teacher
    const course = await Course.findById(attendance.course);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.teacher.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Delete the attendance record
    await Attendance.findByIdAndDelete(req.params.id);

    res.json({ message: "Attendance record deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
