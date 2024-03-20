import { useNavigate } from "react-router-dom"
import useAuthStore from "../hooks/store"
import { useEffect, useState } from "react";
import { BugReport } from "../types/bugReport";

const Home = () => {
  const { isLoggedIn, getReports, verifyToken } = useAuthStore();
  const navigate = useNavigate();
  const [reports, setReports] = useState<BugReport[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      await verifyToken();
      if (!isLoggedIn) {
        navigate('/sign-in');
      }else {
        try {
          const fetchedReports = await getReports();
          setReports(fetchedReports);
        } catch (error) {
          console.error("Failed to fetch reports:", error);
        }
      }
    };

    checkAuth();
  }, [isLoggedIn, verifyToken, navigate,getReports]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-5">Bug Reports</h1>
      <table className="min-w-full divide-y divide-gray-200 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <thead className="bg-green-500 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Report Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Summary</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reports.map((report) => (
            <tr key={report.number} className={report.isClosed ? 'bg-green-100' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.number}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis" title={report.summary}>
                {report.summary}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.isClosed ? 'Closed' : 'Open'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Home