import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTrackingStore = create(
  persist(
    (set) => ({
      trackings: [],
      addTracking: (tracking) =>
        set((state) => ({
          trackings: [
            tracking,
            ...state.trackings.filter(
              (t) => t.tracking_number !== tracking.tracking_number
            ),
          ],
        })),
      updateTracking: (tracking) =>
        set((state) => ({
          trackings: state.trackings.map((t) =>
            t.tracking_number === tracking.tracking_number ? tracking : t
          ),
        })),
      deleteTracking: (trackingNumber) =>
        set((state) => ({
          trackings: state.trackings.filter(
            (t) => t.tracking_number !== trackingNumber
          ),
        })),
      clearTrackings: () => set({ trackings: [] }),
    }),
    {
      name: "tracking-storage",
    }
  )
);
