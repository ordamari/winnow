"use client";

import {
  Document,
  Font,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  DEFAULT_STYLE,
  type MarkdownRun,
  markdownRuns,
  type PersonalInfo,
  type RenderedSection,
  type ResumeStyle,
  safeMarkdownUrl,
  type SkillCategoryView,
  type TextVersion,
} from "@winnow/core";
import { useMemo } from "react";

Font.registerHyphenationCallback((word) => [word]);

function buildStyles(t: ResumeStyle) {
  return StyleSheet.create({
    page: {
      fontFamily: t.fontFamily,
      fontSize: t.bodyFontSize + 0.5,
      color: "#1a1a1a",
      paddingTop: t.pageMarginTop,
      paddingBottom: t.pageMarginBottom,
      paddingRight: t.pageMarginRight,
      paddingLeft: t.pageMarginLeft,
      lineHeight: t.lineHeight,
    },

    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    name: {
      fontSize: t.nameFontSize,
      fontWeight: 700,
    },
    subtitle: {
      fontSize: t.subtitleFontSize,
      fontWeight: 700,
      letterSpacing: 0,
      color: t.accentColor,
      marginTop: 15,
    },
    contactCol: {
      alignItems: "flex-start",
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 2,
    },
    contactIcon: {
      width: 8,
      height: 8,
      marginRight: 4,
    },
    contactText: {
      fontSize: t.bodyFontSize - 0.5,
      color: "#444",
    },
    contactLink: {
      fontSize: t.bodyFontSize - 0.5,
      color: "#444",
      textDecoration: "none",
    },

    sectionHeader: {
      fontSize: t.sectionHeaderFontSize,
      fontWeight: 700,
      color: t.accentColor,
      marginTop: t.sectionSpacing,
      marginBottom: 2,
      paddingBottom: 3,
      borderBottomWidth: t.showSectionBorders ? 1 : 0,
      borderBottomColor: t.accentColor,
    },

    summaryWrap: {
      marginTop: 4,
      marginBottom: 2,
    },
    summaryText: {
      fontSize: t.bodyFontSize,
      lineHeight: 1.5,
    },

    companyName: {
      fontSize: t.subtitleFontSize,
      fontWeight: 700,
      marginTop: 6,
    },
    roleLine: {
      fontSize: t.bodyFontSize,
      color: "#555",
      marginBottom: 3,
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: 2,
      paddingLeft: t.bulletIndent,
    },
    bulletDot: {
      width: 8,
      fontSize: t.bodyFontSize,
    },
    bulletText: {
      flex: 1,
      fontSize: t.bodyFontSize,
      lineHeight: 1.45,
    },

    skillRow: {
      marginBottom: 1.5,
      paddingLeft: t.bulletIndent,
    },
    skillText: {
      fontSize: t.bodyFontSize,
    },
    skillLabel: {
      fontWeight: 700,
      fontSize: t.bodyFontSize,
    },

    eduInstitution: {
      fontSize: t.subtitleFontSize,
      fontWeight: 700,
      marginTop: 4,
    },
    eduProgram: {
      fontSize: t.bodyFontSize,
      color: "#555",
    },

    bold: {
      fontWeight: 700,
    },
    italic: {
      fontStyle: "italic" as const,
    },
    inlineCode: {
      fontFamily: "Courier",
    },
    inlineLink: {
      color: t.accentColor,
      textDecoration: "underline" as const,
    },
    entryLink: {
      fontSize: t.bodyFontSize,
      color: t.accentColor,
      textDecoration: "underline" as const,
      marginBottom: 3,
    },
  });
}

function PhoneIcon({ color }: { color: string }) {
  return (
    <Svg
      viewBox="0 0 24 24"
      style={{
        width: 7,
        height: 7,
        marginRight: 4,
        position: "relative" as const,
        top: -1.5,
      }}
    >
      <Path
        d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"
        fill={color}
      />
    </Svg>
  );
}

function MailIcon({ color }: { color: string }) {
  return (
    <Svg
      viewBox="0 0 24 24"
      style={{
        width: 7,
        height: 7,
        marginRight: 4,
        position: "relative" as const,
        top: -1.5,
      }}
    >
      <Path
        d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
        fill={color}
      />
    </Svg>
  );
}

function LinkedInIcon({ color }: { color: string }) {
  return (
    <Svg
      viewBox="0 0 24 24"
      style={{
        width: 7,
        height: 7,
        marginRight: 4,
        position: "relative" as const,
        top: -1.5,
      }}
    >
      <Path
        d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
        fill={color}
      />
    </Svg>
  );
}

function GitHubIcon({ color }: { color: string }) {
  return (
    <Svg
      viewBox="0 0 24 24"
      style={{
        width: 7,
        height: 7,
        marginRight: 4,
        position: "relative" as const,
        top: -1.5,
      }}
    >
      <Path
        d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5A10.01 10.01 0 0022 12 10 10 0 0012 2z"
        fill={color}
      />
    </Svg>
  );
}

function MarkdownRuns({
  runs,
  styles,
}: {
  runs: MarkdownRun[];
  styles: {
    bold: { fontWeight: number };
    italic: { fontStyle: "italic" };
    inlineCode: { fontFamily: string };
    inlineLink: { color: string; textDecoration: "underline" };
  };
}) {
  return runs.map((run, index) => {
    if (run.type === "text") return <Text key={index}>{run.value}</Text>;
    if (run.type === "break") return <Text key={index}>{"\n"}</Text>;
    if (run.type === "code") {
      return (
        <Text key={index} style={styles.inlineCode}>
          {run.value}
        </Text>
      );
    }
    if (run.type === "bold") {
      return (
        <Text key={index} style={styles.bold}>
          <MarkdownRuns runs={run.children} styles={styles} />
        </Text>
      );
    }
    if (run.type === "italic") {
      return (
        <Text key={index} style={styles.italic}>
          <MarkdownRuns runs={run.children} styles={styles} />
        </Text>
      );
    }
    return (
      <Link key={index} src={run.url} style={styles.inlineLink}>
        <MarkdownRuns runs={run.children} styles={styles} />
      </Link>
    );
  });
}

function MarkdownText({
  text,
  styles,
}: {
  text: string;
  styles: {
    bold: { fontWeight: number };
    italic: { fontStyle: "italic" };
    inlineCode: { fontFamily: string };
    inlineLink: { color: string; textDecoration: "underline" };
  };
}) {
  return <MarkdownRuns runs={markdownRuns(text)} styles={styles} />;
}

export interface ResumePDFProps {
  personalInfo: PersonalInfo;
  title: string;
  summary: TextVersion | undefined;
  skillCategories: SkillCategoryView[];
  sections: RenderedSection[];
  styleOverrides?: ResumeStyle;
}

export function ResumePDF({
  personalInfo,
  title,
  summary,
  skillCategories,
  sections,
  styleOverrides,
}: ResumePDFProps) {
  const theme = styleOverrides ?? DEFAULT_STYLE;
  const s = useMemo(() => buildStyles(theme), [theme]);
  const iconColor = "#666";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.name}>{personalInfo.name}</Text>
            <Text style={s.subtitle}>{title}</Text>
          </View>
          <View style={s.contactCol}>
            <View style={s.contactRow}>
              <PhoneIcon color={iconColor} />
              <Link
                src={`tel:${personalInfo.phone.replace(/-/g, "")}`}
                style={s.contactLink}
              >
                {personalInfo.phone}
              </Link>
            </View>
            <View style={s.contactRow}>
              <MailIcon color={iconColor} />
              <Link src={`mailto:${personalInfo.email}`} style={s.contactLink}>
                {personalInfo.email}
              </Link>
            </View>
            <View style={s.contactRow}>
              <LinkedInIcon color={iconColor} />
              <Link
                src={`https://${personalInfo.linkedin}`}
                style={s.contactLink}
              >
                {personalInfo.linkedin}
              </Link>
            </View>
            <View style={s.contactRow}>
              <GitHubIcon color={iconColor} />
              <Link
                src={`https://${personalInfo.github}`}
                style={s.contactLink}
              >
                {personalInfo.github}
              </Link>
            </View>
          </View>
        </View>

        {sections.map((section) => {
          if (section.kind === "summary") {
            if (!summary) return null;
            return (
              <View key={section.id}>
                <Text style={s.sectionHeader}>{section.title}</Text>
                <View style={s.summaryWrap}>
                  <Text style={s.summaryText}>
                    <MarkdownText text={summary.text} styles={s} />
                  </Text>
                </View>
              </View>
            );
          }

          if (section.kind === "skills") {
            return (
              <View key={section.id}>
                <Text style={s.sectionHeader}>{section.title}</Text>
                {skillCategories.map((cat) => (
                  <View key={cat.id} style={s.skillRow}>
                    <Text style={s.skillText}>
                      <Text style={s.skillLabel}>{cat.label}: </Text>
                      {cat.skills.map((sk) => sk.name).join(", ")}
                    </Text>
                  </View>
                ))}
              </View>
            );
          }

          return (
            <View key={section.id}>
              <Text style={s.sectionHeader}>{section.title}</Text>
              {section.entries.map((entry) => {
                const role = [entry.title, entry.period]
                  .filter((part) => part && part.length > 0)
                  .join(" • ");
                return (
                  <View key={entry.id}>
                    {entry.organization ? (
                      <Text style={s.companyName}>{entry.organization}</Text>
                    ) : null}
                    {role ? <Text style={s.roleLine}>{role}</Text> : null}
                    {entry.url ? (
                      safeMarkdownUrl(entry.url) ? (
                        <Link
                          src={safeMarkdownUrl(entry.url) ?? entry.url}
                          style={s.entryLink}
                        >
                          {entry.url}
                        </Link>
                      ) : (
                        <Text style={s.roleLine}>{entry.url}</Text>
                      )
                    ) : null}
                    {entry.bullets.map((bullet) => (
                      <View key={bullet.id} style={s.bulletRow}>
                        <Text style={s.bulletDot}>•</Text>
                        <Text style={s.bulletText}>
                          <MarkdownText text={bullet.text} styles={s} />
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
