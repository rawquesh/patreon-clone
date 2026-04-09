// components/EarningsChart.tsx
"use client";
import React, { useEffect } from "react";
import { Line } from "react-chartjs-2";
import { branding } from "@/config/branding";
import {
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  CategoryScale,
  Filler,
  Legend,
  ChartJS,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  CategoryScale,
  Filler,
  Legend
);

interface EarningsChartProps {
  data: number[];
  labels?: string[];
  timeRange?: string;
}

const EarningsChart: React.FC<EarningsChartProps> = ({
  data,
  labels,
  timeRange = "30d",
}) => {
  // Debug info
  useEffect(() => {
    console.log("EarningsChart received data:", data);
    console.log("EarningsChart received labels:", labels);
    console.log("EarningsChart timeRange:", timeRange);
  }, [data, labels, timeRange]);

  const getTimeLabels = () => {
    console.log("Getting time labels");
    const now = new Date();
    const labels = [];
    let daysToShow = 30;

    switch (timeRange) {
      case "7d":
        daysToShow = 7;
        break;
      case "14d":
        daysToShow = 14;
        break;
      case "30d":
        daysToShow = 30;
        break;
      case "90d":
        daysToShow = 90;
        break;
      case "180d":
        daysToShow = 180;
        break;
      case "3m":
        daysToShow = 90;
        break;
      case "6m":
        daysToShow = 180;
        break;
      case "1y":
        daysToShow = 365;
        break;
      default:
        daysToShow = 30;
    }
    console.log("Generating labels for", daysToShow, "days");

    if (daysToShow <= 31) {
      for (let i = 0; i < daysToShow; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (daysToShow - 1) + i);
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
      }
    } else if (daysToShow <= 90) {
      const weeks = Math.ceil(daysToShow / 7);
      for (let i = 0; i < weeks; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (weeks - 1) * 7 + i * 7);
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        labels.push(`${monthNames[date.getMonth()]} ${date.getDate()}`);
      }
    } else {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const months = Math.min(12, Math.ceil(daysToShow / 30));
      for (let i = 0; i < months; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (months - 1) + i);
        labels.push(monthNames[date.getMonth()]);
      }
    }

    console.log("Generated labels:", labels);
    return labels;
  };

  // Use provided labels or generate them
  console.log("Labels:", labels);
  const timeLabels = getTimeLabels();

  // Ensure we have enough data points by padding with zeros if needed
  const ensureDataMatches = (data: number[], labels: string[]): number[] => {
    if (!data || data.length === 0) {
      return Array(labels.length).fill(0);
    }

    if (data.length === labels.length) {
      return data;
    }

    // If we have more data than labels, truncate
    if (data.length > labels.length) {
      return data.slice(0, labels.length);
    }

    // If we have more labels than data, pad with zeros
    return [...data, ...Array(labels.length - data.length).fill(0)];
  };

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Daily Earnings",
        data: ensureDataMatches(data, timeLabels),
        fill: true,
        borderColor: branding.colors.linkBlue,
        backgroundColor: "rgba(49, 130, 206, 0.2)",
        tension: 0.4,
        pointRadius: (ctx: any) => {
          // Make points with data visible
          return ctx.raw > 0 ? 4 : 0;
        },
        pointBackgroundColor: branding.colors.linkBlue,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => `$${context.raw.toFixed(2)}`,
        },
        displayColors: false,
      },
      legend: {
        display: true,
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return `$${value.toFixed(1)}`;
          },
          stepSize: 0.1,
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        suggestedMax: (ctx: any) => {
          const maxValue = Math.max(...ctx.chart.data.datasets[0].data);
          return maxValue > 0 ? maxValue * 1.2 : 1; // Add 20% padding or default to 1
        },
      },
      x: {
        display: true,
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default EarningsChart;
