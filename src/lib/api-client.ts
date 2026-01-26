import { env } from "@/lib/env";
import ky from "ky";
import { toast } from "sonner";

export const api = ky.create({
  prefixUrl: env.VITE_API_BASE_URL,
  timeout: 10_000,
  retry: {
    limit: 2,
    methods: ["get"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem("token");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
          }
          const message =
            response.status >= 500
              ? "Server error. Try again."
              : "Request failed.";
          toast.error(message);
        }
        return response;
      },
    ],
  },
});
