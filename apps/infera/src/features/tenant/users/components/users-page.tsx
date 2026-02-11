import { Plus } from "lucide-react"
import { useState } from "react"
import { ContentLayout } from "@/components/content-layout"
import { Button } from "@/packages/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import { useTenantUserActions } from "../hooks"
import { InvitationsTable } from "./invitations-table"
import { InviteUserDialog } from "./invite-user-dialog"
import { UsersTable } from "./users-table"

interface UsersPageProps {
  tenantId: string
}

export function UsersPage({ tenantId }: UsersPageProps) {
  const [activeTab, setActiveTab] = useState("users")
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const actions = useTenantUserActions(tenantId)

  const headerActions = (
    <Button onClick={() => setInviteDialogOpen(true)} className="cursor-pointer">
      <Plus className="mr-2 size-4" />
      邀请用户
    </Button>
  )

  return (
    <>
      <ContentLayout
        title="用户与邀请"
        description="管理租户下的所有用户及其进入租户的角色权限，并跟踪待处理的邀请。"
        actions={headerActions}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="users" className="cursor-pointer px-4">
              用户
            </TabsTrigger>
            <TabsTrigger value="invitations" className="cursor-pointer px-4">
              邀请记录
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="space-y-4 border-none p-0 outline-none">
            <UsersTable tenantId={tenantId} />
          </TabsContent>
          <TabsContent value="invitations" className="space-y-4 border-none p-0 outline-none">
            <InvitationsTable tenantId={tenantId} />
          </TabsContent>
        </Tabs>
      </ContentLayout>

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onConfirm={(emails, role) => {
          actions.invite.mutate({ tenantId, emails, role })
          setInviteDialogOpen(false)
        }}
        submitting={actions.invite.isPending}
      />
    </>
  )
}
