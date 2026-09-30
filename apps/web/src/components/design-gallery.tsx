"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback } from "@winnow/ui/components/avatar";
import { Badge } from "@winnow/ui/components/badge";
import { Button } from "@winnow/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@winnow/ui/components/card";
import { Checkbox } from "@winnow/ui/components/checkbox";
import { ConfirmDialog } from "@winnow/ui/components/confirm-dialog";
import { DataTable } from "@winnow/ui/components/data-table";
import { EmptyState } from "@winnow/ui/components/empty-state";
import { ErrorState } from "@winnow/ui/components/error-state";
import { Field, FieldError, FieldLabel } from "@winnow/ui/components/field";
import { Input } from "@winnow/ui/components/input";
import { Label } from "@winnow/ui/components/label";
import { MatchPercent } from "@winnow/ui/components/match-percent";
import { PageHeader } from "@winnow/ui/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@winnow/ui/components/select";
import { Separator } from "@winnow/ui/components/separator";
import { Skeleton } from "@winnow/ui/components/skeleton";
import {
  type ApplicationStatus,
  applicationStatuses,
  StatusBadge,
} from "@winnow/ui/components/status-badge";
import { Textarea } from "@winnow/ui/components/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@winnow/ui/components/tooltip";
import { InboxIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { type ReactNode, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const sampleDate = new Date("2026-09-30T09:00:00.000Z");
const sampleNumber = 12840.5;

export function DesignGallery() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("design");
  const errors = useTranslations("error");
  const format = useFormatter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const companySchema = useMemo(
    () =>
      z.object({
        company: z.string().min(1, t("form.companyRequired")),
      }),
    [t],
  );
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: { company: "" },
  });
  const statusLabels: Record<ApplicationStatus, string> = {
    saved: t("statuses.saved"),
    applied: t("statuses.applied"),
    screening: t("statuses.screening"),
    technical: t("statuses.technical"),
    "home-assignment": t("statuses.homeAssignment"),
    final: t("statuses.final"),
    offer: t("statuses.offer"),
    accepted: t("statuses.accepted"),
    rejected: t("statuses.rejected"),
    ghosted: t("statuses.ghosted"),
    withdrawn: t("statuses.withdrawn"),
  };
  const sampleColumns = [
    { key: "company", header: t("table.company") },
    { key: "role", header: t("table.role") },
    { key: "status", header: t("table.status") },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <div className="flex gap-2">
            {(
              [
                ["light", t("light")],
                ["dark", t("dark")],
                ["system", t("system")],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={theme === value ? "default" : "outline"}
                onClick={() => setTheme(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        }
      />

      <GallerySection title={t("sections.buttons")}>
        <div className="flex flex-wrap gap-2">
          <Button type="button">{t("buttons.primary")}</Button>
          <Button type="button" variant="secondary">
            {t("buttons.secondary")}
          </Button>
          <Button type="button" variant="outline">
            {t("buttons.outline")}
          </Button>
          <Button type="button" variant="ghost">
            {t("buttons.ghost")}
          </Button>
          <Button type="button" variant="destructive">
            {t("buttons.destructive")}
          </Button>
          <Button type="button" variant="link">
            {t("buttons.link")}
          </Button>
          <Button type="button" disabled>
            {t("buttons.disabled")}
          </Button>
        </div>
      </GallerySection>

      <GallerySection title={t("sections.badges")}>
        <div className="flex flex-wrap gap-2">
          <Badge>{t("badges.default")}</Badge>
          <Badge variant="secondary">{t("badges.secondary")}</Badge>
          <Badge variant="outline">{t("badges.outline")}</Badge>
          <Badge variant="destructive">{t("badges.destructive")}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {applicationStatuses.map((status) => (
            <StatusBadge
              key={status}
              status={status}
              label={statusLabels[status]}
            />
          ))}
        </div>
      </GallerySection>

      <GallerySection title={t("sections.match")}>
        <div className="flex flex-wrap gap-6">
          <MatchPercent
            value={82}
            reason={t("match.strong")}
            matchLabel={t("match.label")}
          />
          <MatchPercent
            value={55}
            reason={t("match.partial")}
            matchLabel={t("match.label")}
          />
          <MatchPercent
            value={20}
            reason={t("match.weak")}
            matchLabel={t("match.label")}
          />
        </div>
      </GallerySection>

      <GallerySection title={t("sections.form")}>
        <form
          className="max-w-sm space-y-4"
          onSubmit={form.handleSubmit(() => {
            toast.success(t("form.companySaved"));
          })}
        >
          <Field
            data-invalid={form.formState.errors.company ? true : undefined}
          >
            <FieldLabel htmlFor="company">{t("form.company")}</FieldLabel>
            <Input
              id="company"
              aria-invalid={form.formState.errors.company ? true : undefined}
              {...form.register("company")}
            />
            <FieldError errors={[form.formState.errors.company]} />
          </Field>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("form.notes")}</Label>
            <Textarea id="notes" placeholder={t("form.notesPlaceholder")} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="follow-up" />
            <Label htmlFor="follow-up">{t("form.followUp")}</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stage">{t("form.stage")}</Label>
            <Select defaultValue="applied">
              <SelectTrigger id="stage" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saved">{t("form.saved")}</SelectItem>
                <SelectItem value="applied">{t("form.applied")}</SelectItem>
                <SelectItem value="screening">{t("form.screening")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">{t("form.save")}</Button>
        </form>
      </GallerySection>

      <GallerySection title={t("sections.table")}>
        <DataTable
          columns={sampleColumns}
          emptyTitle={t("table.empty")}
          rows={[
            {
              company: t("table.sampleCompany"),
              role: t("table.sampleRole"),
              status: (
                <StatusBadge
                  status="screening"
                  label={statusLabels.screening}
                />
              ),
            },
          ]}
        />
        <DataTable
          columns={sampleColumns}
          rows={[]}
          emptyTitle={t("table.empty")}
        />
        <DataTable columns={sampleColumns} rows={[]} loading />
      </GallerySection>

      <GallerySection title={t("sections.feedback")}>
        <EmptyState
          icon={<InboxIcon />}
          title={t("feedback.emptyTitle")}
          description={t("feedback.emptyDescription")}
          action={
            <Button type="button" size="sm">
              {t("feedback.addOne")}
            </Button>
          }
        />
        <ErrorState
          title={errors("title")}
          description={errors("description")}
          retryLabel={errors("retry")}
          onRetry={() => toast.message(t("feedback.retryClicked"))}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => toast.success(t("feedback.saved"))}
          >
            {t("feedback.showToast")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmOpen(true)}
          >
            {t("feedback.openConfirm")}
          </Button>
          <Tooltip>
            <TooltipTrigger render={<Button type="button" variant="outline" />}>
              {t("feedback.hoverTip")}
            </TooltipTrigger>
            <TooltipContent>{t("feedback.tooltip")}</TooltipContent>
          </Tooltip>
          <Avatar>
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <Skeleton className="h-8 w-32" />
        </div>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={t("feedback.archiveTitle")}
          description={t("feedback.archiveDescription")}
          confirmLabel={t("feedback.archive")}
          cancelLabel={t("feedback.cancel")}
          destructive
          onConfirm={() => {
            setConfirmOpen(false);
            toast.success(t("feedback.archived"));
          }}
        />
      </GallerySection>

      <GallerySection title={t("sections.card")}>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>{t("card.title")}</CardTitle>
            <CardDescription>{t("card.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-3" />
            <p className="text-sm text-muted-foreground">{t("card.body")}</p>
          </CardContent>
        </Card>
      </GallerySection>

      <GallerySection title={t("sections.formats")}>
        <p className="text-sm">
          {t("formats.dateLabel")}:{" "}
          {format.dateTime(sampleDate, { dateStyle: "medium" })}
        </p>
        <p className="text-sm">
          {t("formats.numberLabel")}: {format.number(sampleNumber)}
        </p>
      </GallerySection>
    </div>
  );
}

function GallerySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">{title}</h2>
      {children}
    </section>
  );
}
