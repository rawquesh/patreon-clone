"use client";
import { useState } from "react";
import { Box, Flex, Text, HStack, Grid, Spinner, Stat } from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { branding } from "@/config/branding";
import {
  BarElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  CategoryScale,
  Filler,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { useQuery } from "@tanstack/react-query";
import { fetchMembershipInsights } from "@/lib/backend-services/insights-service";
import { TimeRange } from "@/typings/insights";

ChartJS.register(
  BarElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  CategoryScale,
  Filler,
  Legend
);

interface Tier {
  name: string;
  count: number;
}

const MembershipsTab = () => {
  const [timeRange, setTimeRange] = useState<string>(TimeRange.NINETY_DAYS);

  const {
    data: insightsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["membership-insights", timeRange],
    queryFn: async () => await fetchMembershipInsights(timeRange),
  });

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  const chartLabels = insightsData?.membershipData
    ? Object.keys(insightsData.membershipData)
    : [];
  const chartValues = insightsData?.membershipData
    ? Object.values(insightsData.membershipData)
    : [];

  const chartData: ChartData<"bar"> = {
    labels: chartLabels,
    datasets: [
      {
        label: "New Members",
        data: chartValues,
        borderColor: branding.colors.linkBlue,
        backgroundColor: "rgba(49, 130, 206, 0.5)",
        borderRadius: 4,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw} new members`,
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
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
          Failed to load membership insights. Please try again later.
        </Text>
      </Box>
    );
  }

  const totalNewMembers = chartValues.reduce(
    (sum, current) => sum + current,
    0
  );

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" marginBottom="6">
        <HStack>
          <NativeSelectRoot size="sm">
            <NativeSelectField
              value={timeRange}
              onChange={handleTimeRangeChange}
            >
              <option value={TimeRange.SEVEN_DAYS}>Past 7 days</option>
              <option value={TimeRange.THIRTY_DAYS}>Past 30 days</option>
              <option value={TimeRange.NINETY_DAYS}>Past 90 days</option>
              <option value={TimeRange.ONE_EIGHTY_DAYS}>Past 180 days</option>
              {/* <option value={TimeRange.ONE_YEAR}>Past year</option> */}
            </NativeSelectField>
          </NativeSelectRoot>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          Last updated at {new Date().toLocaleTimeString()}
        </Text>
      </Flex>

      <Box p={4} boxShadow={"md"} bg={"white"} rounded={"8px"}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          New Members
        </Text>
        <Text fontSize="4xl" fontWeight="bold" mb={4}>
          {totalNewMembers}
        </Text>
        <Box height="300px">
          <Bar data={chartData} options={chartOptions} />
        </Box>
      </Box>

      <Box mt={8} p={4} boxShadow={"md"} bg={"white"} rounded={"8px"}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          New Members by Tier
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {insightsData.tiers.map((tier: Tier) => (
            <Stat.Root key={tier.name} p={4} bg="gray.50" borderRadius="md">
              <Stat.Label>{tier.name}</Stat.Label>
              <Stat.ValueText>{tier.count}</Stat.ValueText>
            </Stat.Root>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default MembershipsTab;
