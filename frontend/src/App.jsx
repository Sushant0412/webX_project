import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import ChatBot from "./components/ChatBot";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import MarkAttendanceForm from "./components/attendance/MarkAttendanceForm";
import AttendanceReports from "./components/attendance/AttendanceReports";
import StudentAttendance from "./components/attendance/StudentAttendance";
import EditAttendance from "./components/attendance/EditAttendance";

// Layout components
export const Navigation = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.user.role);
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <h1 className="text-xl font-bold text-gray-800">
                Attendance Tracker
              </h1>
            </div>
            {isLoggedIn && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Dashboard
                </Link>
                {userRole === "teacher" && (
                  <>
                    <Link
                      to="/attendance"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Mark Attendance
                    </Link>
                    <Link
                      to="/reports"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Reports
                    </Link>
                    <Link
                      to="/edit-attendance"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Edit Attendance
                    </Link>
                    <Link
                      to="/chatbot"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      ChatBot
                    </Link>
                  </>
                )}
                {userRole === "student" && (
                  <Link
                    to="/student-attendance"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    My Attendance
                  </Link>
                )}
                {userRole === "student" && (
                  <Link
                    to="/chatbot"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    ChatBot
                  </Link>
                )}
                {userRole === "student" && (
                  <Link
                    to="/chatbot"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    ChatBot
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Page components
const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check user role from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.user.role);

        // If student, redirect to student attendance view
        if (payload.user.role === "student") {
          navigate("/student-attendance");
          return;
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }

    // Only fetch courses for teachers
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/courses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError("Failed to load courses");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6">My Classes</h2>
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((classItem) => (
            <div
              key={classItem._id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {classItem.name}
                </h3>
                <div className="mt-2 text-sm text-gray-600 space-y-2">
                  <p>
                    <span className="font-medium">Class:</span>{" "}
                    {classItem.class_name}
                  </p>
                  <p>
                    <span className="font-medium">Students:</span>{" "}
                    {classItem.students?.length || 0}
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/attendance?class=${classItem._id}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Mark Attendance
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attendance" element={<MarkAttendanceForm />} />
            <Route path="/reports" element={<AttendanceReports />} />
            <Route path="/edit-attendance" element={<EditAttendance />} />
            <Route path="/student-attendance" element={<StudentAttendance />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/chatbot" element={<ChatBot />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
