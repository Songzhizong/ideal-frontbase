import { DataTableSearch } from "@/components/table"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UsersFilters } from "@/features/core/users"
import { UserGroupEnum, UserStatusEnum } from "../types"

interface UsersFilterFormProps {
  urlFilters: UsersFilters
  onInputChange: (key: "username" | "email" | "phone", value: string) => void
  onSelectChange: (key: "status" | "mfaEnabled" | "userGroups", value: string) => void
}

export function UsersFilterForm({
  urlFilters,
  onInputChange,
  onSelectChange,
}: UsersFilterFormProps) {
  return (
    <>
      {/* Main filters - always visible */}
      <div className="flex items-center gap-2">
        <DataTableSearch
          placeholder="搜索 ID / 名称 / 账号..."
          className="w-64"
          value={urlFilters.username ?? ""}
          onValueChange={(value) => onInputChange("username", value)}
          debounceMs={500}
        />

        <Select
          value={urlFilters.status || "all"}
          onValueChange={(value) => onSelectChange("status", value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            {Object.entries(UserStatusEnum).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

interface UsersExtraFiltersProps {
  urlFilters: UsersFilters
  onInputChange: (key: "username" | "email" | "phone", value: string) => void
  onSelectChange: (key: "status" | "mfaEnabled" | "userGroups", value: string) => void
}

export function UsersExtraFilters({
  urlFilters,
  onInputChange,
  onSelectChange,
}: UsersExtraFiltersProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="user-group-filter" className="text-sm font-medium">
          用户组
        </Label>
        <Select
          value={urlFilters.userGroups || "all"}
          onValueChange={(value) => onSelectChange("userGroups", value)}
        >
          <SelectTrigger id="user-group-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部用户组</SelectItem>
            {Object.entries(UserGroupEnum).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone-filter" className="text-sm font-medium">
          搜索手机号
        </Label>
        <DataTableSearch
          placeholder="输入手机号"
          value={urlFilters.phone ?? ""}
          onValueChange={(value) => onInputChange("phone", value)}
          debounceMs={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-filter" className="text-sm font-medium">
          搜索邮箱
        </Label>
        <DataTableSearch
          placeholder="输入邮箱地址"
          value={urlFilters.email ?? ""}
          onValueChange={(value) => onInputChange("email", value)}
          debounceMs={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mfa-filter" className="text-sm font-medium">
          MFA状态
        </Label>
        <Select
          value={urlFilters.mfaEnabled || "all"}
          onValueChange={(value) => onSelectChange("mfaEnabled", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="true">已启用</SelectItem>
            <SelectItem value="false">未启用</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
