import { useNavigate, Link } from "react-router-dom"
import useAuthStore from "../hooks/store"
import { useEffect, useState } from "react";
import { BugReport } from "../types/bugReport";

import Navbar from "./Navbar";
import toast from "react-hot-toast";
import Loader from "./Loading";


const Home = () => {
  const { isLoggedIn, getReports, verifyToken } = useAuthStore();
  const navigate = useNavigate();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [reportNumber, setReportNumber] = useState('')
  

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

  const handleReportNumberSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const reportExists = reports.find(report => report.number.toString() === reportNumber);
    if(reportExists) {
      navigate(`/bug/${reportNumber}`)
    } else {
      if (isNaN(Number(reportNumber))){
        toast.error("Please enter a number")
      }else {
        toast.error("Report number does not exists")
      }
    }

  }
  if (!reports){
    return <Loader/>
  }

  return (
    <div className="p-4">
     <Navbar/>
      <h1 className="text-2xl font-bold text-center mb-5 mt-6">Bug Reports</h1>
      <form onSubmit={handleReportNumberSubmit} className="mb-4 flex justify-center gap-x-2">
        <input
          type="text"
          value={reportNumber}
          onChange={(e) => setReportNumber(e.target.value)}
          placeholder="Enter report number to modify"
          className="border-2 border-slate-400 p-2 w-[400px]"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Go to Report</button>
      </form>

      <table className="min-w-full divide-y divide-gray-200 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <thead className="bg-blue-500 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Report Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Summary</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-900">
          {reports.map((report) => (
            <tr key={report.number}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r-2"><Link to={`/bug/${report.number}`}>
                                {report.number}
                            </Link></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r-2">{report.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs overflow-hidden text-el" title={report.summary}>
             {report.summary.length > 30 ? report.summary.slice(0,35) : report.summary}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${report.isClosed ? 'bg-green-100' : 'bg-red-300' }`}>{report.isClosed ? 'Closed' : 'Open'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    
    </div>
  );
}

export default Home