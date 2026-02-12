import { useState } from "react"
import { ContentLayout } from "@/packages/layout-core"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import { TenantCostAllocationTab } from "./tenant-cost-allocation-tab"
import { TenantInvoicesTab } from "./tenant-invoices-tab"
import { TenantPaymentMethodsTab } from "./tenant-payment-methods-tab"
import { TenantUsageCostTab } from "./tenant-usage-cost-tab"

interface TenantBillingPageProps {
  tenantId: string
}

const BILLING_TAB_VALUES = ["usage-cost", "invoices", "payment-methods", "cost-allocation"] as const

type BillingTabValue = (typeof BILLING_TAB_VALUES)[number]

export function TenantBillingPage({ tenantId }: TenantBillingPageProps) {
  const [activeTab, setActiveTab] = useState<BillingTabValue>("usage-cost")

  return (
    <ContentLayout
      title="账单与发票"
      description="查看租户成本趋势、账期发票、支付方式与成本分摊明细。"
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (BILLING_TAB_VALUES.includes(value as BillingTabValue)) {
            setActiveTab(value as BillingTabValue)
          }
        }}
        className="space-y-4"
      >
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="usage-cost" className="cursor-pointer px-4">
            Usage & Cost
          </TabsTrigger>
          <TabsTrigger value="invoices" className="cursor-pointer px-4">
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="cursor-pointer px-4">
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="cost-allocation" className="cursor-pointer px-4">
            Cost Allocation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usage-cost" className="border-none p-0 outline-none">
          <TenantUsageCostTab tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="invoices" className="border-none p-0 outline-none">
          <TenantInvoicesTab tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="payment-methods" className="border-none p-0 outline-none">
          <TenantPaymentMethodsTab tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="cost-allocation" className="border-none p-0 outline-none">
          <TenantCostAllocationTab tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  )
}
