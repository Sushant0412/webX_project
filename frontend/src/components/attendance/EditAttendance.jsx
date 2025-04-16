import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EditAttendance() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [dateError, setDateError] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchReports();
    }
  }, [selectedCourse, dateRange.startDate, dateRange.endDate]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/courses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load courses");
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    if (!selectedCourse || !dateRange.startDate || !dateRange.endDate) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/attendance/reports?courseId=${selectedCourse}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError("Failed to load attendance reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (type, value) => {
    const newDateRange = {
      ...dateRange,
      [type]: value,
    };
    if (validateDateRange(newDateRange.startDate, newDateRange.endDate)) {
      setDateRange(newDateRange);
    }
  };

  const validateDateRange = (start, end) => {
    if (new Date(end) < new Date(start)) {
      setDateError("End date cannot be before start date");
      return false;
    }
    setDateError("");
    return true;
  };

  const handleStatusChange = async (recordId, newStatus) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:3000/api/attendance/${recordId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update attendance");
      }

      const updatedRecord = await response.json();

      // Update the reports state with the updated record
      setReports(
        reports.map((report) =>
          report._id === recordId ? updatedRecord : report
        )
      );

      setSuccess("Attendance updated successfully");
      setEditingRecord(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (recordId) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:3000/api/attendance/${recordId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to delete attendance record"
        );
      }

      // Remove the deleted record from the reports state
      setReports(reports.filter((report) => report._id !== recordId));
      setSuccess("Attendance record deleted successfully");
      setConfirmDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Edit Attendance</h2>

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

          {dateError && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
              {dateError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-6">
            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium text-gray-700"
              >
                Course
              </label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : reports.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.student_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.roll_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingRecord === report._id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleStatusChange(report._id, "present")
                              }
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                report.status === "present"
                                  ? "bg-green-100 text-green-800 ring-2 ring-green-600"
                                  : "bg-gray-100 text-gray-800 hover:bg-green-100 hover:text-green-800"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(report._id, "absent")
                              }
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                report.status === "absent"
                                  ? "bg-red-100 text-red-800 ring-2 ring-red-600"
                                  : "bg-gray-100 text-gray-800 hover:bg-red-100 hover:text-red-800"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              report.status === "present"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {report.status.charAt(0).toUpperCase() +
                              report.status.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {confirmDelete === report._id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDelete(report._id)}
                              className="text-xs text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingRecord(
                                  editingRecord === report._id
                                    ? null
                                    : report._id
                                );
                                setConfirmDelete(null);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-900"
                            >
                              {editingRecord === report._id ? "Cancel" : "Edit"}
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDelete(report._id);
                                setEditingRecord(null);
                              }}
                              className="text-xs text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedCourse ? (
            <div className="text-center py-4 text-gray-500">
              No attendance records found for the selected date range
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
