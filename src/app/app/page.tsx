"use client";

import { AppShell } from "@/components/AppShell";
import { ToolProcessor } from "@/components/ToolProcessor";

export default function AppPage() {
  return (
    <AppShell>
      <ToolProcessor
        title="AI Notes Generator"
        description="Upload content and generate comprehensive study notes"
        sourceType="text"
        inputLabel="Enter your content or paste text"
        inputPlaceholder="Paste your lecture notes, article, or any text content here..."
      />
    </AppShell>
  );
}
