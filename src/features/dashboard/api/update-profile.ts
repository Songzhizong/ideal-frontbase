import { api } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(2, "Name should be at least 2 characters."),
  role: z.string().min(2, "Role is required."),
  bio: z.string().max(160, "Bio should be 160 characters or less.").optional(),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;

export const UpdateProfileResponseSchema = ProfileSchema.extend({
  updatedAt: z.iso.datetime()
});

export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponseSchema>;

const updateProfile = async (payload: ProfileInput) => {
  const json = await api.post("profile", { json: payload }).json();
  return UpdateProfileResponseSchema.parse(json);
};

export function useUpdateProfile() {
  return useMutation({
    mutationFn: updateProfile,
  });
}
