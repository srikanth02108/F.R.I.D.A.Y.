"use client";

import { motion } from "framer-motion";
import { Check, LayoutTemplate } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ExtendedTemplateMeta } from "@/hooks/use-templates";

type EditorTemplateSelectProps = {
  value: string;
  onValueChange: (templateId: string) => void;
  disabled?: boolean;
  templates: ExtendedTemplateMeta[];
};

export function EditorTemplateSelect({
  value,
  onValueChange,
  disabled,
  templates,
}: EditorTemplateSelectProps) {
  const active = templates.find((t) => t.id === value);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "h-9 w-[min(100%,200px)] border-[#c7c6cb] bg-white text-sm shadow-sm transition-shadow",
          "hover:border-[#2055FD]/40 hover:shadow-[0_2px_12px_rgba(32,85,253,0.08)]",
          "data-[state=open]:border-[#2055FD]/50 data-[state=open]:ring-2 data-[state=open]:ring-[#2055FD]/10",
        )}
        size="sm"
      >
        <span className="flex min-w-0 items-center gap-2">
          <LayoutTemplate className="size-3.5 shrink-0 text-[#2055FD]" />
          <SelectValue placeholder="Template">
            {active?.name ?? "Template"}
          </SelectValue>
        </span>
      </SelectTrigger>

      <SelectContent
        position="popper"
        sideOffset={6}
        className="w-[min(100vw-2rem,320px)] overflow-hidden border-[#e9e8e7] p-0 shadow-[0_12px_40px_rgba(15,17,23,0.12)]"
      >
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="p-1.5"
        >
          <p className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-[#6B6B6B] uppercase">
            Resume templates
          </p>
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 + index * 0.04, duration: 0.16 }}
            >
              <SelectItem
                value={template.id}
                className={cn(
                  "my-0.5 cursor-pointer rounded-lg py-2.5 pr-8 pl-2.5",
                  "focus:bg-[#2055FD]/8 data-[state=checked]:bg-[#2055FD]/10",
                )}
              >
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 font-medium text-[#0A0A0A]">
                    {template.name}
                    {value === template.id ? (
                      <Check className="size-3.5 text-[#2055FD]" />
                    ) : null}
                  </span>
                  <span className="text-xs leading-snug text-[#6B6B6B]">
                    {template.preview_description}
                  </span>
                </span>
              </SelectItem>
            </motion.div>
          ))}
        </motion.div>
      </SelectContent>
    </Select>
  );
}
