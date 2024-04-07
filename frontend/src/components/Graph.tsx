import { useEffect, useState } from "react";
import { BugReport } from "../types/bugReport";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from "chart.js";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../hooks/store";

import Navbar from "./Navbar";

ChartJS.register(Tooltip, Legend, ArcElement);

const Graph = () => {
  const { isLoggedIn, getReports, verifyToken } = useAuthStore();
  const navigate = useNavigate();
  const [reports, setReports] = useState<BugReport[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      await verifyToken();
      if (!isLoggedIn) {
        navigate("/sign-in");
      } else {
        try {
          const fetchedReports = await getReports();
          setReports(fetchedReports);
        } catch (error) {
          console.error("Failed to fetch reports:", error);
        }
      }
    };

    checkAuth();
  }, [isLoggedIn, verifyToken, navigate, getReports]);

  const openReports = reports.filter((report) => !report.isClosed).length;
  const closedReports = reports.filter((report) => report.isClosed).length;

  const data = {
    labels: ["Open Bug Reports", "Closed Bug Reports"],
    datasets: [
      {
        data: [openReports, closedReports],
        backgroundColor: ["rgba(0,255,0,1)", "rgba(255,0,0,1)"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="p-4">
      <Navbar />
      <h1 className="text-2xl font-bold text-center mb-5 mt-6">Statistics</h1>
      <div className="text-center">
        <Doughnut data={data} />
      </div>
    </div>
  );
};

export default Graph;
