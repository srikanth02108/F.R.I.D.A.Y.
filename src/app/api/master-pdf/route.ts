import { NextResponse } from "next/server";

import { compileLatexToPdfBuffer } from "@/lib/latex-compile-server";
import { buildMasterResumeLatex } from "@/lib/master-resume-latex";
import { PROFILE_VAULT_SLUG } from "@/lib/profile-vault";
import { createClient } from "@/lib/supabase/server";
import { createEmptyResumeContent } from "@/lib/resume-content";
import type { ResumeContent, UserProfile } from "@/types/database";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profileRow, error: profileError } = await supabase
      .from("user_profiles")
      .select(
        "full_name, email, headline, location, phone, linkedin_url, github_url, website_url",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const { data: vaultRow, error: vaultError } = await supabase
      .from("resumes")
      .select("content")
      .eq("user_id", user.id)
      .eq("slug", PROFILE_VAULT_SLUG)
      .maybeSingle();

    if (vaultError) {
      return NextResponse.json({ error: vaultError.message }, { status: 500 });
    }

    const vault = (vaultRow?.content ?? createEmptyResumeContent()) as ResumeContent;
    const latex = buildMasterResumeLatex({
      profile: (profileRow as UserProfile | null) ?? null,
      vault,
    });

    const pdfBuffer = await compileLatexToPdfBuffer(latex);
    const safeName =
      profileRow?.full_name?.trim().replace(/\s+/g, "-").toLowerCase() ||
      "master-portfolio";

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}-master.pdf"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Master PDF generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
