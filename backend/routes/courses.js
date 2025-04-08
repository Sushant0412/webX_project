const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Course = require("../models/Course");
const auth = require("../middleware/auth");

// Get all courses for the logged-in teacher
router.get("/", auth, async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id });
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Create a new course
router.post(
  "/",
  [
    auth,
    [
      check("name", "Course name is required").not().isEmpty(),
      check("class_name", "Class name is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, class_name } = req.body;

      const course = new Course({
        name,
        class_name,
        teacher: req.user.id,
      });

      await course.save();
      res.json(course);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Add students to a course
router.post(
  "/:id/students",
  [
    auth,
    [
      check("students", "Students array is required").isArray(),
      check("students.*.name", "Student name is required").not().isEmpty(),
      check("students.*.roll_number", "Roll number is required")
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: "Course not found" });

      // Verify teacher owns the course
      if (course.teacher.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      course.students = req.body.students;
      await course.save();
      res.json(course);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Get students of a course
router.get("/:id/students", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Verify teacher owns the course
    if (course.teacher.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(course.students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
