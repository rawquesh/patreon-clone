"use client";
import { useState } from "react";
import { Box, Flex, Text, HStack, Grid, Spinner, Stat } from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
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

Chart.register(
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
        borderColor: "hsl(211, 71%, 43%)",
        backgroundColor: "rgba(29, 112, 191, 0.5)",
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
            Failed to load membership insights. Please try again later.
          </Text>
        </Box>
      </Box>
    );
  }

  const totalNewMembers = chartValues.reduce(
    (sum, current) => sum + current,
    0
  );

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <HStack>
          <NativeSelectRoot size="sm" className="glass-card" borderRadius="10px" overflow="hidden">
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
            </NativeSelectField>
          </NativeSelectRoot>
        </HStack>
        <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          Last updated at {new Date().toLocaleTimeString()}
        </Text>
      </Flex>

      <Box className="glass-card" p={6} borderRadius="16px" mb={6}>
        <Text fontSize="sm" fontWeight={500} mb={2} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          New Members
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
          {totalNewMembers}
        </Text>
        <Box height="300px">
          <Bar data={chartData} options={chartOptions} />
        </Box>
      </Box>

      <Box className="glass-card" p={6} borderRadius="16px">
        <Text fontSize="md" fontWeight={700} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
          New Members by Tier
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
          {insightsData.tiers.map((tier: Tier) => (
            <Box
              key={tier.name}
              p={4}
              borderRadius="12px"
              css={{
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            >
              <Stat.Root>
                <Stat.Label css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontSize: "13px" }}>
                  {tier.name}
                </Stat.Label>
                <Stat.ValueText
                  css={{
                    color: "hsl(222.2, 47.4%, 11.2%)",
                    fontSize: "24px",
                    fontWeight: 700,
                  }}
                >
                  {tier.count}
                </Stat.ValueText>
              </Stat.Root>
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default MembershipsTab;
