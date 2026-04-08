export const sortByRelativeDate = <T extends Record<string, unknown>>(
  list: T[],
  keyToSortBy: keyof T
) => {
  const today = new Date().toISOString().split("T")[0];
  const todayItems: T[] = [];
  const earlierItems: T[] = [];

  list.forEach((item) => {
    const dateValue = String(item[keyToSortBy]).split("T")[0];
    if (dateValue === today) {
      todayItems.push(item);
    } else {
      earlierItems.push(item);
    }
  });

  earlierItems.sort((a, b) => {
    const dateA = String(a[keyToSortBy]);
    const dateB = String(b[keyToSortBy]);
    return dateA > dateB ? -1 : 1;
  });

  return {
    today: todayItems,
    earlier: earlierItems,
  };
};
