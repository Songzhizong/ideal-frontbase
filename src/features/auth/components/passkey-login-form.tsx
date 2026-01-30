import { Fingerprint } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function PasskeyLoginForm() {
	const handlePasskeyLogin = () => {
		// Mock functionality as per example
		toast.info("Passkey login functionality would call WebAuthn API here")
	}

	return (
		<div className="space-y-6">
			<div className="text-center py-7">
				<div className="flex justify-center mb-6">
					<div className="w-22 h-22 bg-linear-to-br from-[#2463EB] to-[#1e50c5] rounded-full flex items-center justify-center shadow-lg shadow-[#2463EB]/30">
						<Fingerprint className="w-14 h-14 text-white" />
					</div>
				</div>
				<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
					使用 Passkey 登录
				</h3>
				<p className="text-gray-600 dark:text-gray-400 mb-8 px-4">
					使生物识别、面容 ID 或设备密码快速安全登录
				</p>
				<Button
					onClick={handlePasskeyLogin}
					className="w-full h-12 bg-linear-to-r from-[#2463EB] to-[#1e50c5] hover:from-[#1e50c5] hover:to-[#1a46ad] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
				>
					使用 Passkey 登录
				</Button>
			</div>

			{/* Info Box */}
			{/*<div className="bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/60 rounded-xl p-4">*/}
			{/*	<p className="text-sm text-blue-800 dark:text-blue-200">*/}
			{/*		<strong>What is a Passkey?</strong>*/}
			{/*		<br />*/}
			{/*		Passkey is a safer and easier way to sign in without passwords, using your device's*/}
			{/*		biometrics or PIN.*/}
			{/*	</p>*/}
			{/*</div>*/}
		</div>
	)
}
