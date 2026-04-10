import React, { useState } from "react";
import { Box, Flex, Text, HStack, Grid } from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
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

Chart.register(
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
        borderColor: "hsl(335, 27%, 64%)",
        backgroundColor: "rgba(163, 97, 132, 0.15)",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Engagements",
        data: postsData?.engagementData
          ? Object.values(postsData.engagementData)
          : [],
        fill: false,
        borderColor: "hsl(211, 71%, 43%)",
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
        labels: {
          color: "hsl(215.4, 16.3%, 46.9%)",
          usePointStyle: true,
          padding: 16,
        },
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
          color: "hsl(215.4, 16.3%, 46.9%)",
        },
        ticks: {
          callback: function (value: string | number) {
            const num = typeof value === "string" ? parseFloat(value) : value;
            if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
            return value;
          },
          color: "hsl(215.4, 16.3%, 46.9%)",
        },
        grid: {
          color: "rgba(0,0,0,0.04)",
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
          color: "hsl(215.4, 16.3%, 46.9%)",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          precision: 0,
          color: "hsl(215.4, 16.3%, 46.9%)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "hsl(215.4, 16.3%, 46.9%)",
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

  if (error || !postsData) {
    return (
      <Box textAlign="center" my={10}>
        <Box className="glass-card" p={6} borderRadius="12px">
          <Text fontSize="lg" css={{ color: "hsl(0, 84.2%, 60.2%)" }}>
            Failed to load posts insights
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justifyContent="space-between" mb={6}>
        <HStack gap={6}>
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
            </NativeSelectField>
          </NativeSelectRoot>
        </HStack>
        <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          Last updated at {new Date().toLocaleTimeString()}
        </Text>
      </Flex>

      <Box className="glass-card" p={6} borderRadius="16px" mb={6}>
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={6}
          mb={6}
        >
          {[
            { label: "Total Impressions", value: postsData.totalImpressions },
            { label: "Total Engagements", value: postsData.totalEngagements },
          ].map((stat) => (
            <Box
              key={stat.label}
              p={4}
              borderRadius="12px"
              css={{
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Text fontSize="13px" fontWeight={500} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                {stat.label}
              </Text>
              <Text
                fontSize="3xl"
                fontWeight={800}
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value.toLocaleString()}
              </Text>
            </Box>
          ))}
        </Grid>
        <Box height="300px">
          <Line data={chartData} options={chartOptions} />
        </Box>
      </Box>

      <Box className="glass-card" p={6} borderRadius="16px">
        <Text fontSize="md" fontWeight={700} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
          Top Performing Posts
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
          {postsData.topPerformingPosts.map((post: any) => (
            <Box
              key={post.id}
              p={4}
              borderRadius="12px"
              css={{
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            >
              <Text
                fontWeight={700}
                lineClamp={2}
                mb={2}
                css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontSize: "14px" }}
              >
                {post.title}
              </Text>
              <Flex justifyContent="space-between" mt={3}>
                <Box>
                  <Text fontSize="11px" fontWeight={500} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                    Impressions
                  </Text>
                  <Text
                    fontWeight={700}
                    css={{
                      background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {post.impressions.toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="11px" fontWeight={500} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                    Engagements
                  </Text>
                  <Text
                    fontWeight={700}
                    css={{
                      background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {post.engagements.toLocaleString()}
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default PostsTab;
