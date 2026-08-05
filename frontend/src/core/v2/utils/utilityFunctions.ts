export const addToRecentlyViewed = (id: string | number | null | undefined): void => {
  if (!id) return;
  try {
    const stored = localStorage.getItem("recently_viewed");
    let list: (string | number)[] = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(list)) list = [];

    // Filter out if already exists, and push to front (max 10)
    list = list.filter((item) => String(item) !== String(id));
    list.unshift(id);
    list = list.slice(0, 10);

    localStorage.setItem("recently_viewed", JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};
