import React, { useState } from "react";
import { Box, Flex, Text, HStack, Grid, Spinner, Stat } from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import { branding } from "@/config/branding";
import {
  ChartJS,
  LineElement,
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
import { fetchPostsInsights } from "@/lib/backend-services/insights-service";
import { TimeRange } from "@/typings/insights";

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

const PostsTab = () => {
  const [timeRange, setTimeRange] = useState<string>(TimeRange.THIRTY_DAYS);

  const {
    data: postsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts-insights", timeRange],
    queryFn: () => fetchPostsInsights(timeRange),
  });

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value as TimeRange);
  };

  const chartLabels = postsData?.impressionData
    ? Object.keys(postsData.impressionData)
    : [];

  const chartData: ChartData<"line"> = {
    labels: chartLabels,
    datasets: [
      {
        label: "Impressions",
        data: postsData?.impressionData
          ? Object.values(postsData.impressionData)
          : [],
        fill: true,
        borderColor: branding.colors.accent,
        backgroundColor: "rgba(189, 101, 71, 0.2)",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Engagements",
        data: postsData?.engagementData
          ? Object.values(postsData.engagementData)
          : [],
        fill: false,
        borderColor: branding.colors.linkBlue,
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
          },
        },
      },
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        title: {
          display: true,
          text: "Impressions",
        },
        ticks: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          callback: function (value: number) {
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value;
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        beginAtZero: true,
        title: {
          display: true,
          text: "Engagements",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          precision: 0,
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

  if (error || !postsData) {
    return (
      <Box textAlign="center" my={10}>
        <Text fontSize="lg" color="red.500">
          Failed to load posts insights
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justifyContent="space-between" marginBottom="6">
        <HStack gap={6}>
          <NativeSelectRoot size="sm">
            <NativeSelectField
              value={timeRange}
              onChange={handleTimeRangeChange}
            >
              <option value={TimeRange.SEVEN_DAYS}>Past 7 days</option>
              <option value={TimeRange.THIRTY_DAYS}>Past 30 days</option>
              <option value={TimeRange.NINETY_DAYS}>Past 90 days</option>
            </NativeSelectField>
          </NativeSelectRoot>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          Last updated at {new Date().toLocaleTimeString()}
        </Text>
      </Flex>

      <Box p={4} boxShadow="md" bg="white" rounded="8px">
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={6}
          marginBottom={6}
        >
          <Stat.Root>
            <Stat.Label>Total Impressions</Stat.Label>
            <Stat.ValueText>
              {postsData.totalImpressions.toLocaleString()}
            </Stat.ValueText>
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>Total Engagements</Stat.Label>
            <Stat.ValueText>
              {postsData.totalEngagements.toLocaleString()}
            </Stat.ValueText>
          </Stat.Root>
        </Grid>
        <Box height="300px">
          <Line data={chartData} options={chartOptions} />
        </Box>
      </Box>

      <Box mt={8} p={4} boxShadow="md" bg="white" rounded="8px">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Top Performing Posts
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {postsData.topPerformingPosts.map((post) => (
            <Box key={post.id} p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold" lineClamp={2} mb={2}>
                {post.title}
              </Text>
              <Flex justifyContent="space-between" mt={2}>
                <Stat.Root>
                  <Stat.Label>Impressions</Stat.Label>
                  <Stat.ValueText>
                    {post.impressions.toLocaleString()}
                  </Stat.ValueText>
                </Stat.Root>
                <Stat.Root>
                  <Stat.Label>Engagements</Stat.Label>
                  <Stat.ValueText>
                    {post.engagements.toLocaleString()}
                  </Stat.ValueText>
                </Stat.Root>
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default PostsTab;
