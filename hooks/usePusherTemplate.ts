import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Pusher from "pusher-js";
import type { Template } from "./useTemplates";

export function usePusherTemplates(templates: Template[] | undefined) {
  const queryClient = useQueryClient();
  const pusherRef = useRef<Pusher | null>(null);

  const hasProcessing =
    templates?.some((t) => t.status === "PROCESSING") ?? false;

  useEffect(() => {
    // Only connect when there's at least one PROCESSING template
    if (!hasProcessing) {
      // Cleanup if it was previously connected
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
      return;
    }

    if (pusherRef.current) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    pusherRef.current = pusher;

    const channel = pusher.subscribe("admin-channel");

    const handleDone = () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    };

    channel.bind("TEMPLATE_READY", handleDone);
    channel.bind("TEMPLATE_FAILED", handleDone);

    return () => {
      channel.unbind("TEMPLATE_READY", handleDone);
      channel.unbind("TEMPLATE_FAILED", handleDone);
      pusher.unsubscribe("admin-channel");
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, [hasProcessing, queryClient]);
}
