/* eslint-disable @typescript-eslint/ban-ts-comment */
export const sortByRelativeDate = <T>(list: T[], keyToSortBy: string) => {
  const today = new Date().toISOString().split("T")[0];
  const todayItems: T[] = [];

  const earlierItems: T[] = [];
  //@ts-ignore
  list.forEach((item) => {
    //@ts-ignore
    if ((item[keyToSortBy] as string).split("T")[0] === today) {
      todayItems.push(item);
    } else {
      earlierItems.push(item);
    }
  });

  earlierItems.sort((a, b) => {
    //@ts-ignore
    if ((a[keyToSortBy] as string) > (b[keyToSortBy] as string)) {
      return -1;
    } else {
      return 1;
    }
  });

  return {
    today: todayItems,
    earlier: earlierItems,
  };
};
