import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/features/core/api/http-client"

/** TOTP: 获取设置状态 */
export async function fetchTotpStatus() {
  return api.get("nexus-api/iam/factor/totp/status").json<{ exists: boolean }>()
}

/** TOTP: 生成otp URL */
export async function fetchTotpGenerate() {
  return api.post("nexus-api/iam/factor/totp/generate").json<{ otpAuthTotpURL: string }>()
}

/** TOTP: 生成二维码(base64) */
export async function fetchTotpGenerateQrBase64() {
  return api
    .post("nexus-api/iam/factor/totp/generate_qrcode_base64")
    .json<{ qrCodeBase64: string }>()
}

/** TOTP: 确认otp */
export async function fetchTotpConfirm(code: string | number) {
  return api.post(`nexus-api/iam/factor/totp/confirmation`, {
    searchParams: { code },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
}

/** TOTP: 删除otp */
export async function fetchTotpDelete() {
  return api.delete("nexus-api/iam/factor/totp/delete")
}

/** Hook - 获取 TOTP 状态 */
export const useTotpStatus = () => {
  return useQuery({
    queryKey: ["totp-status"],
    queryFn: fetchTotpStatus,
  })
}

/** Hook - 获取 TOTP 二维码 */
export const useTotpGenerateQr = () => {
  return useQuery({
    queryKey: ["totp-generate-qr"],
    queryFn: fetchTotpGenerateQrBase64,
    // 只有在需要时手动触发，或者在弹窗打开时触发
    enabled: false,
  })
}

/** Hook - 确认 TOTP */
export const useConfirmTotp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchTotpConfirm,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["totp-status"] })
      void queryClient.invalidateQueries({ queryKey: ["auth", "user-profile"] })
    },
  })
}

/** Hook - 删除 TOTP */
export const useDeleteTotp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchTotpDelete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["totp-status"] })
      void queryClient.invalidateQueries({ queryKey: ["auth", "user-profile"] })
    },
  })
}

/** 多因素认证开关: 启用 */
export async function fetchEnableMfa() {
  return api.post("nexus-api/iam/me/enable_mfa")
}

/** 多因素认证开关: 关闭 */
export async function fetchDisableMfa() {
  return api.post("nexus-api/iam/me/disable_mfa")
}

/** Hook - 启用 MFA */
export const useEnableMfa = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchEnableMfa,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["totp-status"] })
      void queryClient.invalidateQueries({ queryKey: ["auth", "user-profile"] })
    },
  })
}

/** Hook - 禁用 MFA */
export const useDisableMfa = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchDisableMfa,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["totp-status"] })
      void queryClient.invalidateQueries({ queryKey: ["auth", "user-profile"] })
    },
  })
}
