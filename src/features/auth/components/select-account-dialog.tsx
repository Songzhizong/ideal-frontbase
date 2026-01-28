import { useState } from "react"
import { toast } from "sonner"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	type LoginResponse,
	LoginResponseType,
	type SelectAccountTicket,
	useSelectAccount,
} from "@/features/auth/api/login"
import { useLoginHandler } from "@/features/auth/hooks/use-login-handler"

type SelectAccountDialogProps = {
	ticket: SelectAccountTicket
	onSuccess: (response: LoginResponse) => void
	onClose: () => void
}

export function SelectAccountDialog({ ticket, onSuccess, onClose }: SelectAccountDialogProps) {
	const [selectedUid, setSelectedUid] = useState<string | null>(null)
	const selectMutation = useSelectAccount()
	const { handleLoginSuccess } = useLoginHandler()

	const handleSelect = (uid: string) => {
		setSelectedUid(uid)
		selectMutation.mutate(
			{ uid, ticket: ticket.ticket },
			{
				onSuccess: (response) => {
					if (response.type === LoginResponseType.TOKEN) {
						void handleLoginSuccess(response)
						onClose()
					} else {
						onSuccess(response)
					}
				},
				onError: () => {
					toast.error("Failed to select account")
					setSelectedUid(null)
				},
			},
		)
	}

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString()
	}

	return (
		<AlertDialog open onOpenChange={onClose}>
			<AlertDialogContent className="max-w-2xl">
				<AlertDialogHeader>
					<AlertDialogTitle>Select Account</AlertDialogTitle>
					<AlertDialogDescription>
						Multiple accounts are associated with this credential. Please select one to continue.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="space-y-2 max-h-96 overflow-y-auto">
					{ticket.accounts.map((account) => (
						<button
							key={account.uid}
							type="button"
							onClick={() => handleSelect(account.uid)}
							disabled={selectMutation.isPending && selectedUid === account.uid}
							className="w-full p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left disabled:opacity-50"
						>
							<div className="flex items-start gap-4">
								<Avatar className="h-12 w-12">
									<AvatarFallback>{account.account.substring(0, 2).toUpperCase()}</AvatarFallback>
								</Avatar>

								<div className="flex-1 space-y-1">
									<div className="flex items-center gap-2">
										<p className="font-medium">{account.account}</p>
										{account.blocked && <Badge variant="destructive">Blocked</Badge>}
										{account.accountExpired && <Badge variant="destructive">Expired</Badge>}
									</div>

									<div className="text-sm text-muted-foreground space-y-0.5">
										{account.email && <p>Email: {account.email}</p>}
										{account.phone && <p>Phone: {account.phone}</p>}
										<p>Registered: {formatDate(account.registrationTime)}</p>
										{account.lastActiveTime && (
											<p>Last Active: {formatDate(account.lastActiveTime)}</p>
										)}
									</div>
								</div>

								{selectMutation.isPending && selectedUid === account.uid && (
									<div className="text-sm text-muted-foreground">Loading...</div>
								)}
							</div>
						</button>
					))}
				</div>

				<div className="flex justify-end">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	)
}
