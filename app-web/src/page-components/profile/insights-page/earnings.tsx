"use client";
import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Grid,
  Spinner,
  Stat,
  StatHelpText,
  VStack,
} from "@chakra-ui/react";
import { Line, Bar } from "react-chartjs-2";
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

ChartJS.register(
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
        borderColor: branding.colors.linkBlue,
        backgroundColor: "rgba(49, 130, 206, 0.2)",
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
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
        backgroundColor: "rgba(66, 153, 225, 0.6)",
        borderColor: "rgba(66, 153, 225, 1)",
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
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
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (error || !insightsData) {
    return (
      <Box textAlign="center" my={10}>
        <Text fontSize="lg" color="red.500">
          Failed to load earnings insights
        </Text>
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
      <Flex justifyContent="space-between" alignItems="center" marginBottom="6">
        <NativeSelectRoot w={"fit-content"} size="sm">
          <NativeSelectField value={timeRange} onChange={handleTimeRangeChange}>
            <option value={TimeRange.SEVEN_DAYS}>Past 7 days</option>
            <option value={TimeRange.THIRTY_DAYS}>Past 30 days</option>
            <option value={TimeRange.NINETY_DAYS}>Past 90 days</option>
            <option value={TimeRange.ONE_EIGHTY_DAYS}>Past 180 days</option>
            <option value={TimeRange.ONE_YEAR}>Past year</option>
          </NativeSelectField>
        </NativeSelectRoot>
        <Text fontSize="sm" color="gray.500">
          Last updated at {new Date().toLocaleTimeString()}
        </Text>
      </Flex>

      <Box boxShadow={"md"} p={4} bg={"white"} rounded={"8px"}>
        <Stat.Root>
          <Stat.Label>
            Total Earnings ({getTimeRangeLabel(timeRange)})
          </Stat.Label>
          <Stat.ValueText>
            ${insightsData.totalEarnings.toLocaleString()}
          </Stat.ValueText>
        </Stat.Root>
        <Box height="300px" mt={4}>
          <Line data={lineChartData} options={lineChartOptions} />
        </Box>
      </Box>

      <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={6} mt={8}>
        <Box p={4} boxShadow={"md"} bg={"white"} rounded={"8px"}>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Earnings by Tier
          </Text>
          <Box height="300px">
            <Bar data={barChartData} options={barChartOptions} />
          </Box>
        </Box>

        <Box p={4} boxShadow={"md"} bg={"white"} rounded={"8px"}>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Payouts
          </Text>
          <VStack gap={4} align="stretch">
            <Stat.Root>
              <Stat.Label>Available for payout</Stat.Label>
              <Stat.ValueText color="green.500">
                ${insightsData.availablePayout.toLocaleString()}
              </Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>Pending balance</Stat.Label>
              <Stat.ValueText color="gray.500">
                ${insightsData.pendingBalance.toLocaleString()}
              </Stat.ValueText>
              <StatHelpText>Will be available in 7-14 days</StatHelpText>
            </Stat.Root>
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
};

export default EarningsTab;
