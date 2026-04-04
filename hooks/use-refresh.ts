import { useRouter } from "next/navigation";
import { useOverlay } from "@/lib/overlay-context";

/**
 * Custom hook to provide a standardized refresh experience across the app.
 * Combines API refetching with Next.js route refreshing and toast notifications.
 * 
 * @param refetch The refetch function (usually from TanStack Query)
 * @returns { handleRefresh } An object containing the handleRefresh function
 */
export function useRefresh(refetch: () => Promise<any> | any) {
  const router = useRouter();
  const { showToast } = useOverlay();

  const handleRefresh = async () => {
    try {
      const result = refetch();
      if (result instanceof Promise) {
        await result;
      }
      
      // Next.js router.refresh() will re-fetch data for Server Components 
      // without losing client-side state.
      router.refresh();
      
      showToast("Data synchronized successfully", "success");
    } catch (error) {
      console.error("Refresh failed:", error);
      showToast("Failed to synchronize data", "error" as any);
    }
  };

  return { handleRefresh };
}
