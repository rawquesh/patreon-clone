"use client";
import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Grid,
  Stat,
  StatHelpText,
  VStack,
} from "@chakra-ui/react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  CategoryScale,
  Filler,
  Legend,
  BarElement,
  ChartOptions,
  ChartData,
} from "chart.js";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { useQuery } from "@tanstack/react-query";
import { fetchEarningsInsights } from "@/lib/backend-services/insights-service";
import { TimeRange } from "@/typings/insights";

Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  CategoryScale,
  Filler,
  Legend,
  BarElement
);

const EarningsTab = () => {
  const [timeRange, setTimeRange] = useState<string>(TimeRange.THIRTY_DAYS);

  const {
    data: insightsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["earnings-insights", timeRange],
    queryFn: () => fetchEarningsInsights(timeRange),
  });

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  const lineChartLabels = insightsData?.earningsData
    ? Object.keys(insightsData.earningsData)
    : [];
  const lineChartValues = insightsData?.earningsData
    ? Object.values(insightsData.earningsData)
    : [];

  const lineChartData: ChartData<"line"> = {
    labels: lineChartLabels,
    datasets: [
      {
        label: "Total Earnings",
        data: lineChartValues,
        fill: true,
        borderColor: "hsl(211, 71%, 43%)",
        backgroundColor: "rgba(29, 112, 191, 0.15)",
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`,
        },
      },
      x: { grid: { display: false } },
    },
  };

  const barChartData: ChartData<"bar"> = {
    labels: insightsData?.tierBreakdown.map((tier) => tier.name) || [],
    datasets: [
      {
        label: "Earnings by Tier",
        data: insightsData?.tierBreakdown.map((tier) => tier.amount) || [],
        backgroundColor: "rgba(29, 112, 191, 0.6)",
        borderColor: "hsl(211, 71%, 43%)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`,
        },
      },
      x: { grid: { display: false } },
    },
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" my={10}>
        <Box
          w="48px"
          h="48px"
          borderRadius="full"
          border="3px solid hsl(210, 30%, 88%)"
          borderTopColor="hsl(211, 71%, 43%)"
          animation="spin 0.8s linear infinite"
          css={{
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      </Flex>
    );
  }

  if (error || !insightsData) {
    return (
      <Box textAlign="center" my={10}>
        <Box className="glass-card" p={6} borderRadius="12px">
          <Text fontSize="lg" css={{ color: "hsl(0, 84.2%, 60.2%)" }}>
            Failed to load earnings insights
          </Text>
        </Box>
      </Box>
    );
  }

  const getTimeRangeLabel = (range: string): string => {
    const labels: Record<string, string> = {
      [TimeRange.SEVEN_DAYS]: "Past 7 days",
      [TimeRange.THIRTY_DAYS]: "Past 30 days",
      [TimeRange.NINETY_DAYS]: "Past 90 days",
      [TimeRange.ONE_EIGHTY_DAYS]: "Past 180 days",
      [TimeRange.ONE_YEAR]: "Past year",
    };
    return labels[range] || "Selected Period";
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <NativeSelectRoot w={"fit-content"} size="sm" className="glass-card" borderRadius="10px" overflow="hidden">
          <NativeSelectField
            value={timeRange}
            onChange={handleTimeRangeChange}
            css={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
            }}
          >
            <option value={TimeRange.SEVEN_DAYS}>Past 7 days</option>
            <option value={TimeRange.THIRTY_DAYS}>Past 30 days</option>
            <option value={TimeRange.NINETY_DAYS}>Past 90 days</option>
            <option value={TimeRange.ONE_EIGHTY_DAYS}>Past 180 days</option>
            <option value={TimeRange.ONE_YEAR}>Past year</option>
          </NativeSelectField>
        </NativeSelectRoot>
        <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          Last updated at {new Date().toLocaleTimeString()}
        </Text>
      </Flex>

      <Box className="glass-card" p={6} borderRadius="16px" mb={6}>
        <Text fontSize="sm" fontWeight={500} mb={1} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          Total Earnings ({getTimeRangeLabel(timeRange)})
        </Text>
        <Text
          fontSize="4xl"
          fontWeight={800}
          mb={4}
          css={{
            background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ${insightsData.totalEarnings.toLocaleString()}
        </Text>
        <Box height="300px">
          <Line data={lineChartData} options={lineChartOptions} />
        </Box>
      </Box>

      <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={6}>
        <Box className="glass-card" p={6} borderRadius="16px">
          <Text fontSize="md" fontWeight={700} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            Earnings by Tier
          </Text>
          <Box height="300px">
            <Bar data={barChartData} options={barChartOptions} />
          </Box>
        </Box>

        <Box className="glass-card" p={6} borderRadius="16px">
          <Text fontSize="md" fontWeight={700} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            Payouts
          </Text>
          <VStack gap={6} align="stretch">
            <Box
              p={4}
              borderRadius="12px"
              css={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            >
              <Text fontSize="sm" fontWeight={500} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                Available for payout
              </Text>
              <Text
                fontSize="2xl"
                fontWeight={700}
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ${insightsData.availablePayout.toLocaleString()}
              </Text>
            </Box>
            <Box
              p={4}
              borderRadius="12px"
              css={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            >
              <Text fontSize="sm" fontWeight={500} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                Pending balance
              </Text>
              <Text fontSize="2xl" fontWeight={700} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                ${insightsData.pendingBalance.toLocaleString()}
              </Text>
              <Text fontSize="12px" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                Will be available in 7-14 days
              </Text>
            </Box>
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
};

export default EarningsTab;
