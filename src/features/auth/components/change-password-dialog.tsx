import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	type ChangePasswordLoginRequest,
	ChangePasswordLoginRequestSchema,
	type ChangePasswordTicket,
	type LoginResponse,
	LoginResponseType,
	useChangePasswordLogin,
} from "@/features/auth/api/login"
import { useLoginHandler } from "@/features/auth/hooks/use-login-handler"

type ChangePasswordDialogProps = {
	ticket: ChangePasswordTicket
	type: LoginResponseType.PASSWORD_EXPIRED | LoginResponseType.PASSWORD_ILLEGAL
	onSuccess: (response: LoginResponse) => void
	onClose: () => void
}

export function ChangePasswordDialog({
	ticket,
	type,
	onSuccess,
	onClose,
}: ChangePasswordDialogProps) {
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const changeMutation = useChangePasswordLogin()
	const { handleLoginSuccess } = useLoginHandler()

	const form = useForm<ChangePasswordLoginRequest & { confirmPassword: string }>({
		resolver: zodResolver(
			ChangePasswordLoginRequestSchema.extend({
				confirmPassword: ChangePasswordLoginRequestSchema.shape.newPassword,
			}).refine((data) => data.newPassword === data.confirmPassword, {
				message: "Passwords do not match",
				path: ["confirmPassword"],
			}),
		),
		defaultValues: {
			ticket: ticket.ticket,
			newPassword: "",
			confirmPassword: "",
		},
	})

	const onSubmit = (data: ChangePasswordLoginRequest & { confirmPassword: string }) => {
		changeMutation.mutate(
			{ ticket: data.ticket, newPassword: data.newPassword },
			{
				onSuccess: (response) => {
					if (response.type === LoginResponseType.TOKEN) {
						toast.success("Password updated successfully!")
						void handleLoginSuccess(response)
						onClose()
					} else {
						onSuccess(response)
					}
				},
				onError: () => {
					toast.error("Failed to update password")
				},
			},
		)
	}

	const getTitle = () => {
		return type === LoginResponseType.PASSWORD_EXPIRED
			? "Password Expired"
			: "Password Update Required"
	}

	const getDescription = () => {
		return type === LoginResponseType.PASSWORD_EXPIRED
			? "Your password has expired. Please set a new password to continue."
			: "Your password does not meet security requirements. Please set a new password."
	}

	return (
		<AlertDialog open onOpenChange={onClose}>
			<AlertDialogContent className="max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle>{getTitle()}</AlertDialogTitle>
					<AlertDialogDescription>{getDescription()}</AlertDialogDescription>
				</AlertDialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					{/* New Password */}
					<div className="space-y-2">
						<Label htmlFor="new-password">New Password</Label>
						<div className="relative">
							<Input
								id="new-password"
								type={showPassword ? "text" : "password"}
								placeholder="Enter new password"
								autoComplete="new-password"
								{...form.register("newPassword")}
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4 text-muted-foreground" />
								) : (
									<Eye className="h-4 w-4 text-muted-foreground" />
								)}
							</Button>
						</div>
						{form.formState.errors.newPassword && (
							<p className="text-sm text-destructive">
								{form.formState.errors.newPassword.message}
							</p>
						)}
					</div>

					{/* Confirm Password */}
					<div className="space-y-2">
						<Label htmlFor="confirm-password">Confirm Password</Label>
						<div className="relative">
							<Input
								id="confirm-password"
								type={showConfirmPassword ? "text" : "password"}
								placeholder="Confirm new password"
								autoComplete="new-password"
								{...form.register("confirmPassword")}
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							>
								{showConfirmPassword ? (
									<EyeOff className="h-4 w-4 text-muted-foreground" />
								) : (
									<Eye className="h-4 w-4 text-muted-foreground" />
								)}
							</Button>
						</div>
						{form.formState.errors.confirmPassword && (
							<p className="text-sm text-destructive">
								{form.formState.errors.confirmPassword.message}
							</p>
						)}
					</div>

					{/* Password Requirements */}
					<div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
						<p className="font-medium mb-1">Password requirements:</p>
						<ul className="list-disc list-inside space-y-0.5">
							<li>At least 6 characters long</li>
							<li>Mix of letters and numbers recommended</li>
						</ul>
					</div>

					{/* Submit Button */}
					<div className="flex gap-2">
						<Button type="button" variant="outline" className="flex-1" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" className="flex-1" disabled={changeMutation.isPending}>
							{changeMutation.isPending ? "Updating..." : "Update Password"}
						</Button>
					</div>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	)
}
