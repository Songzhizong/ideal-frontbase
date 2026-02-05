import type { ReactNode } from "react"
import { create } from "zustand"

export interface ConfirmOptions {
	title?: ReactNode
	description?: ReactNode | null
	confirmText?: string
	cancelText?: string
	variant?: "default" | "destructive"
	icon?: ReactNode
}

interface ConfirmStore {
	isOpen: boolean
	isMounted: boolean
	options: ConfirmOptions
	resolver: ((value: boolean) => void) | null
	confirm: (options: ConfirmOptions) => Promise<boolean>
	handleConfirm: () => void
	handleCancel: () => void
	setMounted: (mounted: boolean) => void
}

const defaultOptions: ConfirmOptions = {
	title: "提示",
	description: "您确定要执行此操作吗？",
	confirmText: "确认",
	cancelText: "取消",
	variant: "default",
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
	isOpen: false,
	isMounted: false,
	options: defaultOptions,
	resolver: null,
	confirm: (options) =>
		new Promise((resolve) => {
			const { resolver, isMounted } = get()
			if (!isMounted) {
				if (resolver) resolver(false)
				resolve(false)
				set({ isOpen: false, resolver: null, options: defaultOptions })
				return
			}
			if (resolver) resolver(false)
			set({
				isOpen: true,
				options: { ...defaultOptions, ...options },
				resolver: resolve,
			})
		}),
	handleConfirm: () => {
		const { resolver } = get()
		if (!resolver) return
		resolver(true)
		set({ isOpen: false, resolver: null, options: defaultOptions })
	},
	handleCancel: () => {
		const { resolver } = get()
		if (!resolver) return
		resolver(false)
		set({ isOpen: false, resolver: null, options: defaultOptions })
	},
	setMounted: (mounted) => {
		const { resolver } = get()
		if (!mounted && resolver) resolver(false)
		set((state) => ({
			isMounted: mounted,
			isOpen: mounted ? state.isOpen : false,
			resolver: mounted ? state.resolver : null,
			options: mounted ? state.options : defaultOptions,
		}))
	},
}))

export const confirm = (options: ConfirmOptions) => useConfirmStore.getState().confirm(options)
