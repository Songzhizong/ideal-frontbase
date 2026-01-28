import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PasswordLoginForm } from "./password-login-form"
import { SmsLoginForm } from "./sms-login-form"

/**
 * Login Page Component
 * Modern login page with multiple authentication methods
 */
export function LoginPage() {
	const [activeTab, setActiveTab] = useState<"password" | "sms">("password")

	return (
		<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
			<div className="w-full max-w-md space-y-6">
				{/* Logo & Title */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
					<p className="text-muted-foreground">Sign in to your account to continue</p>
				</div>

				{/* Login Card */}
				<Card className="border-border/50 shadow-lg">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl">Sign In</CardTitle>
						<CardDescription>Choose your preferred login method</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "password" | "sms")}>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="password">Password</TabsTrigger>
								<TabsTrigger value="sms">SMS Code</TabsTrigger>
							</TabsList>

							<TabsContent value="password" className="mt-6">
								<PasswordLoginForm />
							</TabsContent>

							<TabsContent value="sms" className="mt-6">
								<SmsLoginForm />
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
