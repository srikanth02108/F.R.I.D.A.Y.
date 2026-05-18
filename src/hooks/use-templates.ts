import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TEMPLATES, getTemplateLatex, type TemplateMeta } from "@/lib/templates";

export type ExtendedTemplateMeta = TemplateMeta & { latex_code?: string; isCustom?: boolean };

type CustomTemplateRow = {
  id: string;
  name: string;
  latex_code: string;
};

export function useTemplates() {
  const [templates, setTemplates] = useState<ExtendedTemplateMeta[]>(TEMPLATES);
  const [loading, setLoading] = useState(true);

  const fetchCustom = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // custom_templates isn't in the generated Database type, bypass type checking
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("custom_templates")
        .select("id, name, latex_code")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !data) {
        setLoading(false);
        return;
      }

      const rows = data as unknown as CustomTemplateRow[];
      const custom: ExtendedTemplateMeta[] = rows.map(d => ({
        id: d.id,
        name: `[Custom] ${d.name}`,
        description: "Custom template from your library.",
        preview_description: "Custom template from your library.",
        latex_code: d.latex_code,
        isCustom: true
      }));
      setTemplates([...TEMPLATES, ...custom]);
    } catch {
      // If the table doesn't exist yet, silently fall back to system templates
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustom();
  }, []);

  const getLatex = (id: string) => {
    const custom = templates.find(t => t.id === id);
    if (custom?.isCustom && custom.latex_code) {
      return custom.latex_code;
    }
    return getTemplateLatex(id);
  };

  return { templates, loading, getLatex, refreshTemplates: fetchCustom };
}

