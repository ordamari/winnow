"use client";

import { useTranslations } from "next-intl";
import type { ResumeStyle } from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { Checkbox } from "@winnow/ui/components/checkbox";
import { Input } from "@winnow/ui/components/input";
import { Label } from "@winnow/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@winnow/ui/components/select";

import { useBuilderStore } from "../store/builder-store";
import { SectionHeading } from "./section-heading";
import { StyleNumberField } from "./style-number-field";

const fontOptions: { value: ResumeStyle["fontFamily"]; label: "helvetica" | "times" | "courier" }[] = [
  { value: "Helvetica", label: "helvetica" },
  { value: "Times-Roman", label: "times" },
  { value: "Courier", label: "courier" },
];

export function StylePanel() {
  const t = useTranslations("builder");
  const style = useBuilderStore((state) => state.style);
  const updateStyle = useBuilderStore((state) => state.updateStyle);
  const resetStyle = useBuilderStore((state) => state.resetStyle);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" variant="link" size="xs" onClick={resetStyle}>
          {t("reset")}
        </Button>
      </div>

      <section>
        <SectionHeading>{t("colors")}</SectionHeading>
        <div className="flex items-center justify-between">
          <Label htmlFor="accent-color" className="text-xs text-muted-foreground">
            {t("accentColor")}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="accent-color"
              type="color"
              value={style.accentColor}
              onChange={(event) => updateStyle("accentColor", event.target.value)}
              className="h-8 w-14 cursor-pointer p-1"
            />
            <span className="font-mono text-xs text-muted-foreground">
              {style.accentColor}
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading>{t("typography")}</SectionHeading>
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs text-muted-foreground">{t("fontFamily")}</Label>
          <Select
            value={style.fontFamily}
            onValueChange={(value) => {
              if (value === "Helvetica" || value === "Times-Roman" || value === "Courier") {
                updateStyle("fontFamily", value);
              }
            }}
          >
            <SelectTrigger size="sm" aria-label={t("fontFamily")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {t(`fonts.${font.label}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <StyleNumberField
          label={t("nameSize")}
          value={style.nameFontSize}
          onChange={(value) => updateStyle("nameFontSize", value)}
          min={14}
          max={28}
        />
        <StyleNumberField
          label={t("subtitleSize")}
          value={style.subtitleFontSize}
          onChange={(value) => updateStyle("subtitleFontSize", value)}
          min={7}
          max={16}
        />
        <StyleNumberField
          label={t("sectionHeaderSize")}
          value={style.sectionHeaderFontSize}
          onChange={(value) => updateStyle("sectionHeaderFontSize", value)}
          min={7}
          max={14}
        />
        <StyleNumberField
          label={t("bodySize")}
          value={style.bodyFontSize}
          onChange={(value) => updateStyle("bodyFontSize", value)}
          min={6}
          max={12}
          step={0.5}
        />
        <StyleNumberField
          label={t("lineHeight")}
          value={style.lineHeight}
          onChange={(value) => updateStyle("lineHeight", value)}
          min={1}
          max={2}
          step={0.05}
          unit="x"
        />
      </section>

      <section className="space-y-3">
        <SectionHeading>{t("spacing")}</SectionHeading>
        <StyleNumberField
          label={t("sectionSpacing")}
          value={style.sectionSpacing}
          onChange={(value) => updateStyle("sectionSpacing", value)}
          min={4}
          max={24}
        />
        <StyleNumberField
          label={t("bulletIndent")}
          value={style.bulletIndent}
          onChange={(value) => updateStyle("bulletIndent", value)}
          min={0}
          max={20}
        />
      </section>

      <section className="space-y-3">
        <SectionHeading>{t("margins")}</SectionHeading>
        <StyleNumberField
          label={t("marginTop")}
          value={style.pageMarginTop}
          onChange={(value) => updateStyle("pageMarginTop", value)}
          min={10}
          max={60}
        />
        <StyleNumberField
          label={t("marginBottom")}
          value={style.pageMarginBottom}
          onChange={(value) => updateStyle("pageMarginBottom", value)}
          min={10}
          max={60}
        />
        <StyleNumberField
          label={t("marginLeft")}
          value={style.pageMarginLeft}
          onChange={(value) => updateStyle("pageMarginLeft", value)}
          min={15}
          max={60}
        />
        <StyleNumberField
          label={t("marginRight")}
          value={style.pageMarginRight}
          onChange={(value) => updateStyle("pageMarginRight", value)}
          min={15}
          max={60}
        />
      </section>

      <section>
        <SectionHeading>{t("decorations")}</SectionHeading>
        <div className="flex items-center gap-2">
          <Checkbox
            id="section-borders"
            checked={style.showSectionBorders}
            onCheckedChange={(checked) => updateStyle("showSectionBorders", checked)}
          />
          <Label htmlFor="section-borders" className="text-xs font-normal text-muted-foreground">
            {t("sectionBorders")}
          </Label>
        </div>
      </section>
    </div>
  );
}
