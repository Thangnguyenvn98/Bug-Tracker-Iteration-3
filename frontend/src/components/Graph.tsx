import { useEffect, useState } from "react";
import { BugReport } from "../types/bugReport";
import { Doughnut, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../hooks/store";
import Navbar from "./Navbar";

import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

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

  const typesCount: { [key: string]: number } = {};
  reports.forEach((report) => {
    if (report.type in typesCount) {
      typesCount[report.type]++;
    } else {
      typesCount[report.type] = 1;
    }
  });

  return (
    <div className="p-4">
      <Navbar />
      <h1 className="text-2xl font-bold text-center mb-5 mt-6">Statistics</h1>
      <div className="flex flex-wrap">
        <DoughnutChart
          openReports={openReports}
          closedReports={closedReports}
        />
        <BarChart typesCount={typesCount} />
      </div>
    </div>
  );
};

const DoughnutChart = ({
  openReports,
  closedReports,
}: {
  openReports: number;
  closedReports: number;
}) => {
  const doughnutData = {
    labels: ["Open Bug Reports", "Closed Bug Reports"],
    datasets: [
      {
        data: [openReports, closedReports],
        backgroundColor: ["#FF6B6B", "#48BB78"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4">
      <div className="mx-auto">
        <Doughnut data={doughnutData} />
      </div>
    </div>
  );
};

const BarChart = ({
  typesCount,
}: {
  typesCount: { [key: string]: number };
}) => {
  const barLabels = Object.keys(typesCount);

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: "",
        data: barLabels.map((label) => typesCount[label]),
        backgroundColor: ["#FF6B6B", "#48BB78", "#81E6D9", "#D53F8C"],
      },
    ],
  };

  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Bug Reports by Type",
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="w-full sm:w-1/2 md:w-2/3 lg:w-3/4 p-4">
      <div className="mx-auto">
        <Bar options={barOptions} data={barData} />
      </div>
    </div>
  );
};

export default Graph;
