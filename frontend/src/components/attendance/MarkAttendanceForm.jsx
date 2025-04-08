import { useState, useEffect } from "react";
import { Navigation } from "../../App";

export default function MarkAttendanceForm() {
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split("T")[0],
    courseId: "",
    students: {},
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3000/api/courses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = async (courseId) => {
    setAttendanceData((prev) => ({ ...prev, courseId }));
    setStudents([]);
    try {
      const response = await fetch(
        `http://localhost:3000/api/courses/${courseId}/students`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError("Failed to load students");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await fetch("http://localhost:3000/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(attendanceData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.errors?.[0]?.msg ||
            "Failed to mark attendance"
        );
      }
      setSuccess("Attendance marked successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStudentAttendance = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      students: { ...prev.students, [studentId]: status },
    }));
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Mark Attendance</h2>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-md">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium text-gray-700"
              >
                Select Course
              </label>
              <select
                id="course"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={attendanceData.courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} - {course.class_name}
                  </option>
                ))}
              </select>
            </div>

            {students.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Students
                </h3>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Roll: {student.roll_number}
                        </p>
                      </div>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`attendance-${student._id}`}
                            value="present"
                            onChange={() =>
                              handleStudentAttendance(student._id, "present")
                            }
                            className="form-radio text-indigo-600"
                          />
                          <span className="ml-2">Present</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`attendance-${student._id}`}
                            value="absent"
                            onChange={() =>
                              handleStudentAttendance(student._id, "absent")
                            }
                            className="form-radio text-red-600"
                          />
                          <span className="ml-2">Absent</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="py-2 px-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Mark Attendance
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
