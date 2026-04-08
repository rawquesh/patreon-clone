"use client";
import {
  // Kbd,
  Table,
  Badge,
  Flex,
  Spinner,
  Text,
  Box,
} from "@chakra-ui/react";
// import {
//   ActionBarContent,
//   ActionBarRoot,
//   ActionBarSelectionTrigger,
//   ActionBarSeparator,
// } from "@/components/ui/action-bar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMembers } from "@/context/members-provider";

const AudienceTable: React.FC<{
  visibleColumns: { label: string; value: string; default: boolean }[];
}> = ({ visibleColumns }) => {
  const {
    members,
    pagination,
    isLoading,
    error,
    selectedMembers,
    setSelectedMembers,
    nextPage,
    prevPage,
  } = useMembers();

  const hasSelection = selectedMembers.length > 0;
  const indeterminate = hasSelection && selectedMembers.length < members.length;

  // Only include essential columns
  const essentialColumns = [
    "name",
    "email",
    "currentTier",
    "status",
    "joinDate",
  ];
  const columns = visibleColumns
    .filter((c) => c.default && essentialColumns.includes(c.value))
    .map((c) => c.value);

  const getMemberStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "green";
      case "Inactive":
        return "orange";
      case "Cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" py={12}>
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" py={12} direction="column" gap={4}>
        <Text color="red.500" fontSize="lg">
          Error loading audience data
        </Text>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </Flex>
    );
  }

  if (!members || members.length === 0) {
    return (
      <Flex justify="center" align="center" py={12} direction="column" gap={4}>
        <Text color="gray.500" fontSize="lg">
          No members found with the current filters
        </Text>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reset Filters
        </Button>
      </Flex>
    );
  }

  console.log({ members });

  const rows = members.map((member) => (
    <Table.Row
      key={member.id}
      data-selected={selectedMembers.includes(member.id) ? "" : undefined}
      bg={"white"}
    >
      <Table.Cell w={"min"}>
        <Checkbox
          top="1"
          aria-label="Select row"
          checked={selectedMembers.includes(member.id)}
          onCheckedChange={(changes) => {
            setSelectedMembers(
              changes.checked
                ? [...selectedMembers, member.id]
                : selectedMembers.filter((id) => id !== member.id)
            );
          }}
        />
      </Table.Cell>
      {columns.includes("name") && <Table.Cell>{member.name}</Table.Cell>}
      {columns.includes("email") && <Table.Cell>{member.email}</Table.Cell>}
      {columns.includes("currentTier") && (
        <Table.Cell>{member.tier.name}</Table.Cell>
      )}
      {columns.includes("status") && (
        <Table.Cell>
          <Badge
            colorPalette={getMemberStatusColor(member.status)}
            variant="subtle"
          >
            {member.status}
          </Badge>
        </Table.Cell>
      )}
      {columns.includes("joinDate") && (
        <Table.Cell>{member.joinDate}</Table.Cell>
      )}
    </Table.Row>
  ));

  return (
    <Box>
      <Table.Root overflow={"hidden"} boxShadow={"md"} borderRadius={"lg"}>
        <Table.Header>
          <Table.Row bg={"white"}>
            <Table.ColumnHeader w="6">
              <Checkbox
                top="1"
                aria-label="Select all rows"
                checked={indeterminate ? "indeterminate" : hasSelection}
                onCheckedChange={(changes) => {
                  setSelectedMembers(
                    changes.checked ? members.map((member) => member.id) : []
                  );
                }}
              />
            </Table.ColumnHeader>
            {columns.includes("name") && (
              <Table.ColumnHeader>Name</Table.ColumnHeader>
            )}
            {columns.includes("email") && (
              <Table.ColumnHeader>Email</Table.ColumnHeader>
            )}
            {columns.includes("currentTier") && (
              <Table.ColumnHeader>Current Tier</Table.ColumnHeader>
            )}
            {columns.includes("status") && (
              <Table.ColumnHeader>Status</Table.ColumnHeader>
            )}
            {columns.includes("joinDate") && (
              <Table.ColumnHeader>Join Date</Table.ColumnHeader>
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>{rows}</Table.Body>
      </Table.Root>
      {pagination && (
        <Flex justify="space-between" align="center" mt={4}>
          <Text>
            Showing {members.length} of {pagination.total} members
          </Text>
          <Flex gap={2}>
            <Button
              size="sm"
              onClick={prevPage}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={nextPage}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}
      {/* <ActionBarRoot open={hasSelection}>
        <ActionBarContent>
          <ActionBarSelectionTrigger>
            {selectedMembers.length} selected
          </ActionBarSelectionTrigger>
          <ActionBarSeparator />
          <Button variant="outline" size="sm">
            Change Tier <Kbd>T</Kbd>
          </Button>
          <Button variant="outline" size="sm">
            Export <Kbd>E</Kbd>
          </Button>
        </ActionBarContent>
      </ActionBarRoot> */}
    </Box>
  );
};

export default AudienceTable;
