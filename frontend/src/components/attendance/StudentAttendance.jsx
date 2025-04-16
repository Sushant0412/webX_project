import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is a student
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.user.role !== "student") {
        navigate("/");
        return;
      }
    } catch (error) {
      console.error("Error parsing token:", error);
      navigate("/login");
      return;
    }

    fetchStudentAttendance();
  }, [navigate]);

  const fetchStudentAttendance = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/student-attendance/student",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await response.json();
      setAttendanceData(data);
    } catch (err) {
      setError("Failed to load your attendance records");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance percentage for a subject
  const calculateAttendancePercentage = (records) => {
    if (!records || records.length === 0) return 0;

    const presentCount = records.filter(
      (record) => record.status === "present"
    ).length;
    return Math.round((presentCount / records.length) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">My Attendance</h2>

          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : attendanceData.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {attendanceData.map((subject, index) => {
                const percentage = calculateAttendancePercentage(
                  subject.records
                );
                return (
                  <div
                    key={index}
                    className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {subject.courseName}
                      </h3>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Class:</span>{" "}
                          {subject.className}
                        </p>
                        <p className="mt-2">
                          <span className="font-medium">Total Classes:</span>{" "}
                          {subject.records.length}
                        </p>
                        <div className="mt-4">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">
                              Attendance:
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                percentage >= 75
                                  ? "bg-green-100 text-green-800"
                                  : percentage >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div
                              className={`h-2.5 rounded-full ${
                                percentage >= 75
                                  ? "bg-green-600"
                                  : percentage >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-600"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            // Toggle showing detailed records
                            const updatedData = [...attendanceData];
                            updatedData[index].showDetails =
                              !updatedData[index].showDetails;
                            setAttendanceData(updatedData);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {subject.showDetails
                            ? "Hide Details"
                            : "Show Details"}
                        </button>
                      </div>
                      {subject.showDetails && (
                        <div className="mt-4 max-h-60 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {subject.records.map((record, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(record.date).toLocaleDateString()}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                                    <span
                                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        record.status === "present"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {record.status.charAt(0).toUpperCase() +
                                        record.status.slice(1)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No attendance records found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
