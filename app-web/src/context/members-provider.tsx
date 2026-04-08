"use client";
import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
	useMemo,
} from "react";
import {
	MemberFilterParams,
	Member,
	fetchMembers,
	exportMembersToCSV,
} from "@/lib/backend-services/members-service";

interface MembersContextType {
	members: Member[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	} | null;
	filters: MemberFilterParams;
	isLoading: boolean;
	error: Error | null;
	selectedMembers: string[];
	setSelectedMembers: (members: string[]) => void;
	updateFilters: (newFilters: Partial<MemberFilterParams>) => void;
	nextPage: () => void;
	prevPage: () => void;
	resetFilters: () => void;
	refetch: () => Promise<void>;
	exportToCSV: () => Promise<void>;
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

interface MembersProviderProps {
	children: ReactNode;
	initialFilters?: MemberFilterParams;
}

export function MembersProvider({
	children,
	initialFilters,
}: MembersProviderProps) {
	const defaultFilters: MemberFilterParams = useMemo(
		() => ({
			page: 1,
			limit: 10,
			sortBy: "joinDate",
			sortOrder: "desc",
			...initialFilters,
		}),
		[initialFilters]
	);

	const [filters, setFilters] = useState<MemberFilterParams>(defaultFilters);
	const [membersData, setMembersData] = useState<{
		members: Member[];
		pagination: {
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	} | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

	const fetchMembersData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetchMembers(filters);
			setMembersData(response);
		} catch (err: any) {
			setError(err);
			console.error("Error fetching members:", err);
		} finally {
			setIsLoading(false);
		}
	}, [filters]);

	React.useEffect(() => {
		fetchMembersData();
	}, [fetchMembersData]);

	const updateFilters = useCallback(
		(newFilters: Partial<MemberFilterParams>) => {
			setFilters((prev) => ({
				...prev,
				...newFilters,
				page: newFilters.page !== undefined ? newFilters.page : 1,
			}));
			setSelectedMembers([]);
		},
		[]
	);

	const nextPage = useCallback(() => {
		if (
			membersData &&
			filters.page &&
			filters.page < membersData.pagination.totalPages
		) {
			setFilters((prev) => ({
				...prev,
				page: (prev.page || 1) + 1,
			}));
			setSelectedMembers([]);
		}
	}, [membersData, filters.page]);

	const prevPage = useCallback(() => {
		if (filters.page && filters.page > 1) {
			setFilters((prev) => ({
				...prev,
				page: (prev.page || 2) - 1,
			}));
			setSelectedMembers([]);
		}
	}, [filters.page]);

	const resetFilters = useCallback(() => {
		setFilters(defaultFilters);
		setSelectedMembers([]);
	}, [defaultFilters]);

	const exportToCSV = useCallback(async () => {
		try {
			const blob = await exportMembersToCSV(filters);

			// Create a download link and trigger it
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute(
				"download",
				`members-export-${new Date().toISOString().slice(0, 10)}.csv`
			);
			document.body.appendChild(link);
			link.click();

			// Clean up
			if (link.parentNode) {
				link.parentNode.removeChild(link);
			}
			window.URL.revokeObjectURL(url);
		} catch (err: any) {
			console.error("Error exporting members to CSV:", err);
			setError(err);
		}
	}, [filters]);

	const value: MembersContextType = {
		members: membersData?.members || [],
		pagination: membersData?.pagination || null,
		filters,
		isLoading,
		error,
		selectedMembers,
		setSelectedMembers,
		updateFilters,
		nextPage,
		prevPage,
		resetFilters,
		refetch: fetchMembersData,
		exportToCSV,
	};

	return (
		<MembersContext.Provider value={value}>{children}</MembersContext.Provider>
	);
}

export function useMembers() {
	const context = useContext(MembersContext);
	if (context === undefined) {
		throw new Error("useMembers must be used within a MembersProvider");
	}
	return context;
}
