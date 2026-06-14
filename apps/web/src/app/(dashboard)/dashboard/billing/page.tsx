import { CreditCard } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MOCK_INVOICES,
  MOCK_PLAN,
  PLAN_OPTIONS,
} from "@/lib/mock/data";

export default function BillingPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Billing"
        description="Manage your subscription, payment method, and invoices."
      />

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Current plan</CardTitle>
          <CardDescription>
            You&apos;re on the {MOCK_PLAN.name} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                ${MOCK_PLAN.price}
                <span className="text-base font-normal text-muted-foreground">
                  /{MOCK_PLAN.interval}
                </span>
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {MOCK_PLAN.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>
            <Button variant="outline">Manage subscription</Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Available plans</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLAN_OPTIONS.map((plan) => (
            <Card
              key={plan.id}
              className={`rounded-2xl ${
                plan.current ? "border-primary/30 bg-primary/5" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {plan.current ? (
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      Current
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>
                  ${plan.price}/mo · {plan.credits} credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mb-4 space-y-1.5 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
                <Button
                  variant={plan.current ? "outline" : "default"}
                  className="w-full"
                  disabled={plan.current}
                >
                  {plan.current ? "Current plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Payment method</CardTitle>
          <CardDescription>Your default payment method on file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <CreditCard className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Visa ending in 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/2027</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Invoice history</CardTitle>
          <CardDescription>Download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_INVOICES.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    {new Date(invoice.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{invoice.plan}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        invoice.status === "paid"
                          ? "border-[#5fc992]/30 text-[#5fc992]"
                          : ""
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
