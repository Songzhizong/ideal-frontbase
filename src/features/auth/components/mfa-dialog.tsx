import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	FactorType,
	type LoginResponse,
	LoginResponseType,
	type MfaTicket,
	type MultifactorLoginRequest,
	MultifactorLoginRequestSchema,
	useMultifactorLogin,
	useSendMfaEmailCode,
	useSendMfaSmsCode,
} from "@/features/auth/api/login"
import { useLoginHandler } from "@/features/auth/hooks/use-login-handler"

type MfaDialogProps = {
	ticket: MfaTicket
	onSuccess: (response: LoginResponse) => void
	onClose: () => void
}

export function MfaDialog({ ticket, onSuccess, onClose }: MfaDialogProps) {
	const [activeMethod, setActiveMethod] = useState<FactorType>(ticket.methods[0] || FactorType.TOTP)
	const [countdown, setCountdown] = useState(0)

	const mfaMutation = useMultifactorLogin()
	const sendSmsMutation = useSendMfaSmsCode()
	const sendEmailMutation = useSendMfaEmailCode()
	const { handleLoginSuccess } = useLoginHandler()

	const form = useForm<MultifactorLoginRequest>({
		resolver: zodResolver(MultifactorLoginRequestSchema),
		defaultValues: {
			ticket: ticket.ticket,
			method: activeMethod,
			code: "",
		},
	})

	// Update method when tab changes
	useEffect(() => {
		form.setValue("method", activeMethod)
	}, [activeMethod, form])

	// Countdown timer
	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
			return () => clearTimeout(timer)
		}
	}, [countdown])

	const handleSendCode = (method: FactorType) => {
		if (method === FactorType.SMS) {
			sendSmsMutation.mutate(ticket.ticket, {
				onSuccess: () => {
					toast.success("SMS code sent successfully!")
					setCountdown(60)
				},
				onError: () => {
					toast.error("Failed to send SMS code")
				},
			})
		} else if (method === FactorType.EMAIL) {
			sendEmailMutation.mutate(ticket.ticket, {
				onSuccess: () => {
					toast.success("Email code sent successfully!")
					setCountdown(60)
				},
				onError: () => {
					toast.error("Failed to send email code")
				},
			})
		}
	}

	const onSubmit = (data: MultifactorLoginRequest) => {
		mfaMutation.mutate(data, {
			onSuccess: (response) => {
				if (response.type === LoginResponseType.TOKEN) {
					void handleLoginSuccess(response)
					onClose()
				} else {
					onSuccess(response)
				}
			},
			onError: () => {
				toast.error("Invalid verification code")
			},
		})
	}

	const getMethodLabel = (method: FactorType) => {
		switch (method) {
			case FactorType.TOTP:
				return "Authenticator App"
			case FactorType.SMS:
				return "SMS"
			case FactorType.EMAIL:
				return "Email"
			case FactorType.RECOVERY_CODE:
				return "Recovery Code"
		}
	}

	return (
		<AlertDialog open onOpenChange={onClose}>
			<AlertDialogContent className="max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle>Two-Factor Authentication</AlertDialogTitle>
					<AlertDialogDescription>
						Please verify your identity using one of the available methods
					</AlertDialogDescription>
				</AlertDialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<Tabs
						value={activeMethod}
						onValueChange={(v) => setActiveMethod(v as FactorType)}
						className="w-full"
					>
						<TabsList
							className="grid w-full"
							style={{ gridTemplateColumns: `repeat(${ticket.methods.length}, 1fr)` }}
						>
							{ticket.methods.map((method) => (
								<TabsTrigger key={method} value={method}>
									{getMethodLabel(method)}
								</TabsTrigger>
							))}
						</TabsList>

						{ticket.methods.map((method) => (
							<TabsContent key={method} value={method} className="space-y-4">
								{/* Send Code Button for SMS/Email */}
								{(method === FactorType.SMS || method === FactorType.EMAIL) && (
									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={() => handleSendCode(method)}
										disabled={
											countdown > 0 || sendSmsMutation.isPending || sendEmailMutation.isPending
										}
									>
										{countdown > 0
											? `Resend in ${countdown}s`
											: method === FactorType.SMS
												? "Send SMS Code"
												: "Send Email Code"}
									</Button>
								)}

								{/* Code Input */}
								<div className="space-y-2">
									<Label htmlFor="mfa-code">
										{method === FactorType.TOTP
											? "Enter 6-digit code from your authenticator app"
											: method === FactorType.RECOVERY_CODE
												? "Enter recovery code"
												: "Enter verification code"}
									</Label>
									<Input
										id="mfa-code"
										placeholder={method === FactorType.RECOVERY_CODE ? "Recovery code" : "000000"}
										autoComplete="one-time-code"
										maxLength={method === FactorType.RECOVERY_CODE ? undefined : 6}
										{...form.register("code")}
									/>
									{form.formState.errors.code && (
										<p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
									)}
								</div>
							</TabsContent>
						))}
					</Tabs>

					{/* Submit Button */}
					<div className="flex gap-2">
						<Button type="button" variant="outline" className="flex-1" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" className="flex-1" disabled={mfaMutation.isPending}>
							{mfaMutation.isPending ? "Verifying..." : "Verify"}
						</Button>
					</div>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	)
}
