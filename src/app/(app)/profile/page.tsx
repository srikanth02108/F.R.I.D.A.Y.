"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  FolderOpen,
  GraduationCap,
  Info,
  Link2,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspacePageHeader,
  workspaceAzureButtonClass,
  workspaceCardClass,
  workspaceInputClass,
  workspaceLabelClass,
  workspaceOutlineButtonClass,
  workspacePageClass,
  workspacePrimaryButtonClass,
  workspaceScrollClass,
} from "@/components/workspace/workspace-styles";
import { createEmptyResumeContent } from "@/lib/resume-content";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ParsedLinkedInProfile } from "@/types/linkedin-import";
import {
  buildUserProfileUpdatePayload,
  buildUserProfileUpsertRow,
  mapRowToProfileFormState,
  USER_PROFILE_FORM_SELECT,
} from "@/lib/user-profile-persistence";
import type {
  Education,
  ResumeContent,
  Skill,
  UserProfile,
  WorkExperience,
} from "@/types/database";

const PROFILE_VAULT_SLUG = "profile-vault";
const PROFILE_VAULT_TITLE = "Profile Vault";

function newId(): string {
  return crypto.randomUUID();
}

function mapParsedWorkExperience(
  items: ParsedLinkedInProfile["workExperience"],
): WorkExperience[] {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    id: newId(),
    company: item.company,
    title: item.title,
    startDate: item.startDate,
    endDate: item.current ? null : item.endDate === "Present" ? null : item.endDate,
    current: item.current,
    description: item.description,
    achievements: Array.isArray(item.achievements) ? item.achievements : [],
  }));
}

function mapParsedEducation(
  items: ParsedLinkedInProfile["education"],
): Education[] {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    id: newId(),
    institution: item.institution,
    degree: item.degree,
    field: item.fieldOfStudy,
    startDate: item.startDate,
    endDate: item.endDate === "Present" ? null : item.endDate,
    grade: null,
  }));
}

function mapParsedSkills(skillNames: string[]): Skill[] {
  if (!Array.isArray(skillNames)) return [];

  return skillNames.map((name) => ({
    id: newId(),
    name,
    level: "intermediate" as const,
    category: "General",
  }));
}

function ProfileSectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-2 border-b border-[#e9e8e7] pb-4">
      <Icon className="size-5 text-[#2055FD]" />
      <h3 className="text-lg font-semibold text-[#0A0A0A]">{title}</h3>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vaultResumeId, setVaultResumeId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  const [importOpen, setImportOpen] = useState(false);
  const [importLinkedinUrl, setImportLinkedinUrl] = useState("");
  const [importProfileText, setImportProfileText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedLinkedInProfile | null>(
    null,
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("You must be signed in to view your profile");
        return;
      }

      const { data: profileRow, error: profileLoadError } = await supabase
        .from("user_profiles")
        .select(USER_PROFILE_FORM_SELECT)
        .eq("id", user.id)
        .maybeSingle();

      if (profileLoadError) {
        throw new Error(profileLoadError.message);
      }

      if (profileRow) {
        const profile = profileRow as UserProfile;
        const formState = mapRowToProfileFormState(profile);
        setFullName(formState.fullName);
        setHeadline(formState.headline);
        setLocation(formState.location);
        setPhone(formState.phone);
        setLinkedinUrl(formState.linkedinUrl);
        setGithubUrl(formState.githubUrl);
        setWebsiteUrl(formState.websiteUrl);
      }

      const { data: vaultRow } = await supabase
        .from("resumes")
        .select("id, content")
        .eq("user_id", user.id)
        .eq("slug", PROFILE_VAULT_SLUG)
        .maybeSingle();

      if (vaultRow) {
        setVaultResumeId(vaultRow.id);
        const content = (vaultRow.content ?? createEmptyResumeContent()) as ResumeContent;
        setSummary(content.summary ?? "");
        setWorkExperience(content.workExperience ?? []);
        setEducation(content.education ?? []);
        setSkills(content.skills ?? []);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load profile";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be signed in to save your profile");
      }

      const profileForm = {
        fullName,
        headline,
        location,
        phone,
        linkedinUrl,
        githubUrl,
        websiteUrl,
      };

      const profileUpdate = buildUserProfileUpdatePayload(profileForm);

      const { data: existingProfile, error: existingError } = await supabase
        .from("user_profiles")
        .select("id, plan, resumes_used")
        .eq("id", user.id)
        .maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }

      if (existingProfile) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .update(profileUpdate)
          .eq("id", user.id);

        if (profileError) {
          throw new Error(profileError.message);
        }
      } else {
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert(
            buildUserProfileUpsertRow(
              user.id,
              user.email ?? "",
              profileForm,
            ),
          );

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      const vaultContent: ResumeContent = {
        ...createEmptyResumeContent(),
        summary: summary.trim() || null,
        workExperience,
        education,
        skills,
        projects: [],
      };

      if (vaultResumeId) {
        const { error: vaultError } = await supabase
          .from("resumes")
          .update({
            name: PROFILE_VAULT_TITLE,
            content: vaultContent,
            updated_at: new Date().toISOString(),
          })
          .eq("id", vaultResumeId);

        if (vaultError) {
          throw new Error(vaultError.message);
        }
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("resumes")
          .insert({
            user_id: user.id,
            name: PROFILE_VAULT_TITLE,
            template: "classic",
            slug: PROFILE_VAULT_SLUG,
            content: vaultContent,
            ats_score: null,
            is_public: false,
          })
          .select("id")
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        setVaultResumeId(inserted.id);
      }

      toast.success("Profile saved successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const resetImportState = () => {
    setParsedPreview(null);
    setImportProfileText("");
    setIsParsing(false);
  };

  const handleParseProfile = async () => {
    if (!importProfileText.trim()) {
      toast.error("Paste your LinkedIn profile text before parsing");
      return;
    }

    setIsParsing(true);
    setParsedPreview(null);

    try {
      const response = await fetch("/api/import-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinUrl: importLinkedinUrl.trim(),
          profileText: importProfileText.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | ParsedLinkedInProfile
        | { error?: string }
        | null;

      if (!response.ok) {
        const message =
          payload && "error" in payload && payload.error
            ? payload.error
            : "Failed to parse LinkedIn profile";
        throw new Error(message);
      }

      if (!payload || typeof payload !== "object" || "error" in payload) {
        throw new Error("Received an invalid parse response");
      }

      setParsedPreview(payload as ParsedLinkedInProfile);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not parse LinkedIn text. Try a fuller paste.";
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedPreview) return;

    try {
      if (parsedPreview.fullName) {
        setFullName(parsedPreview.fullName);
      }
      if (parsedPreview.headline) {
        setHeadline(parsedPreview.headline);
      }
      if (parsedPreview.location) {
        setLocation(parsedPreview.location);
      }
      if (parsedPreview.summary) {
        setSummary(parsedPreview.summary);
      }
      if (importLinkedinUrl.trim()) {
        setLinkedinUrl(importLinkedinUrl.trim());
      }

      const parsedWork = Array.isArray(parsedPreview.workExperience)
        ? parsedPreview.workExperience
        : [];
      if (parsedWork.length > 0) {
        setWorkExperience(mapParsedWorkExperience(parsedWork));
      }

      const parsedEducation = Array.isArray(parsedPreview.education)
        ? parsedPreview.education
        : [];
      if (parsedEducation.length > 0) {
        setEducation(mapParsedEducation(parsedEducation));
      }

      const parsedSkills = Array.isArray(parsedPreview.skills)
        ? parsedPreview.skills
        : [];
      if (parsedSkills.length > 0) {
        setSkills(mapParsedSkills(parsedSkills));
      }

      setImportOpen(false);
      resetImportState();

      toast.success(
        "LinkedIn data loaded successfully! Review your information and click Save at the base of the page to commit changes.",
        { duration: 6000 },
      );
    } catch {
      toast.error(
        "Could not apply parsed data. The text payload may be unparseable — try pasting more complete profile sections.",
      );
    }
  };

  const addWorkExperience = () => {
    setWorkExperience((prev) => [
      ...prev,
      {
        id: newId(),
        company: "",
        title: "",
        startDate: "",
        endDate: null,
        current: false,
        description: "",
        achievements: [],
      },
    ]);
  };

  const updateWorkExperience = (
    id: string,
    patch: Partial<WorkExperience>,
  ) => {
    setWorkExperience((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const removeWorkExperience = (id: string) => {
    setWorkExperience((prev) => prev.filter((item) => item.id !== id));
  };

  const addEducation = () => {
    setEducation((prev) => [
      ...prev,
      {
        id: newId(),
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: null,
        grade: null,
      },
    ]);
  };

  const updateEducation = (id: string, patch: Partial<Education>) => {
    setEducation((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const removeEducation = (id: string) => {
    setEducation((prev) => prev.filter((item) => item.id !== id));
  };

  const addSkill = () => {
    setSkills((prev) => [
      ...prev,
      { id: newId(), name: "", level: "intermediate", category: "General" },
    ]);
  };

  const updateSkill = (id: string, name: string) => {
    setSkills((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item)),
    );
  };

  const removeSkill = (id: string) => {
    setSkills((prev) => prev.filter((item) => item.id !== id));
  };

  const previewSkills = parsedPreview?.skills ?? [];
  const previewSkillLabels =
    Array.isArray(previewSkills) && previewSkills.length > 0
      ? previewSkills.slice(0, 12).join(", ")
      : "None detected";

  const vaultItemCount =
    workExperience.length + education.length + skills.length + (summary.trim() ? 1 : 0);

  if (loading) {
    return (
      <div className={cn(workspacePageClass, "items-center justify-center")}>
        <Loader2 className="size-8 animate-spin text-[#2055FD]" />
      </div>
    );
  }

  return (
    <div className={workspacePageClass}>
      <div className={cn(workspaceScrollClass, "pb-28")}>
        <div className="mx-auto max-w-6xl">
          <WorkspacePageHeader
            badge="Identity vault"
            title="Profile Settings"
            description="Manage your executive identity, professional links, and structured data that powers AI resume generation and tailoring."
          >
            <Dialog
              open={importOpen}
              onOpenChange={(open) => {
                setImportOpen(open);
                if (!open) resetImportState();
              }}
            >
              <DialogTrigger asChild>
                <Button className={cn(workspaceAzureButtonClass, "gap-2")}>
                  <Sparkles className="size-4" />
                  <span className="hidden sm:inline">Import from LinkedIn</span>
                  <span className="sm:hidden">Import</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto border-[#c7c6cb] sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Import from LinkedIn</DialogTitle>
                  <DialogDescription>
                    Paste exported profile text and let AI structure it for your
                    vault.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-url" className={workspaceLabelClass}>
                      LinkedIn profile URL
                    </Label>
                    <Input
                      id="linkedin-url"
                      placeholder="https://www.linkedin.com/in/your-handle"
                      value={importLinkedinUrl}
                      onChange={(e) => setImportLinkedinUrl(e.target.value)}
                      disabled={isParsing}
                      className={workspaceInputClass}
                    />
                  </div>

                  <div className="flex gap-3 rounded-lg border border-[#2055FD]/20 bg-[#2055FD]/5 p-3 text-sm text-[#1b1c1c]">
                    <Info className="mt-0.5 size-4 shrink-0 text-[#2055FD]" />
                    <p>
                      <span className="font-semibold">How to import:</span> Go to
                      your LinkedIn profile page → click the &apos;More&apos; button
                      in your top card → select &apos;Save to PDF&apos; or manually
                      highlight and copy your &apos;About&apos; and
                      &apos;Experience&apos; sections, then paste the text payload
                      directly below.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-text" className={workspaceLabelClass}>
                      Profile text
                    </Label>
                    <Textarea
                      id="profile-text"
                      rows={10}
                      placeholder="Paste your copied LinkedIn text data directly here..."
                      value={importProfileText}
                      onChange={(e) => setImportProfileText(e.target.value)}
                      disabled={isParsing}
                      className={cn(workspaceInputClass, "min-h-[200px] resize-y")}
                    />
                  </div>

                  {!parsedPreview && (
                    <Button
                      type="button"
                      className={cn(workspacePrimaryButtonClass, "w-full")}
                      onClick={() => void handleParseProfile()}
                      disabled={isParsing}
                    >
                      {isParsing ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Parsing Data...
                        </>
                      ) : (
                        "Analyze & Parse Profile"
                      )}
                    </Button>
                  )}

                  {parsedPreview && (
                    <div className="space-y-4 rounded-lg border border-[#c7c6cb] bg-[#f5f3f3] p-4">
                      <p className="text-sm font-semibold text-[#0A0A0A]">
                        Review extracted data
                      </p>
                      <dl className="grid gap-3 text-sm">
                        <div>
                          <dt className={workspaceLabelClass}>Extracted name</dt>
                          <dd className="mt-1 font-medium text-[#0A0A0A]">
                            {parsedPreview.fullName ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className={workspaceLabelClass}>
                            Experience items
                          </dt>
                          <dd className="mt-1 font-medium text-[#0A0A0A]">
                            {Array.isArray(parsedPreview.workExperience)
                              ? parsedPreview.workExperience.length
                              : 0}
                          </dd>
                        </div>
                        <div>
                          <dt className={workspaceLabelClass}>Skills matrix</dt>
                          <dd className="mt-1 font-medium text-[#0A0A0A]">
                            {previewSkillLabels}
                            {Array.isArray(parsedPreview.skills) &&
                              parsedPreview.skills.length > 12 && (
                                <span className="text-[#6B6B6B]">
                                  {" "}
                                  +{parsedPreview.skills.length - 12} more
                                </span>
                              )}
                          </dd>
                        </div>
                      </dl>
                      <Button
                        type="button"
                        className={cn(
                          "w-full bg-[#0EB87A] text-white hover:bg-[#0da06f]",
                        )}
                        onClick={handleConfirmImport}
                      >
                        Confirm & Save to Profile
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </WorkspacePageHeader>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="flex flex-col gap-6 lg:col-span-8">
              <section className={cn(workspaceCardClass, "p-6 md:p-8")}>
                <ProfileSectionHeader icon={User} title="Personal Information" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="full-name" className={workspaceLabelClass}>
                      Full name
                    </Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={workspaceInputClass}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="headline" className={workspaceLabelClass}>
                      Headline
                    </Label>
                    <Input
                      id="headline"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Senior Software Engineer · Full Stack"
                      className={workspaceInputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className={workspaceLabelClass}>
                      Current location
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={workspaceInputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={workspaceLabelClass}>
                      Phone number
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={workspaceInputClass}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="summary" className={workspaceLabelClass}>
                      Professional summary
                    </Label>
                    <Textarea
                      id="summary"
                      rows={4}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="A concise overview of your experience and strengths..."
                      className={cn(workspaceInputClass, "resize-y")}
                    />
                  </div>
                </div>
              </section>

              <section className={cn(workspaceCardClass, "p-6 md:p-8")}>
                <ProfileSectionHeader icon={Link2} title="Professional Links" />
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className={workspaceLabelClass}>
                      LinkedIn URL
                    </Label>
                    <Input
                      id="linkedin"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="linkedin.com/in/your-handle"
                      className={workspaceInputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github" className={workspaceLabelClass}>
                      GitHub / portfolio
                    </Label>
                    <Input
                      id="github"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="github.com/your-handle"
                      className={workspaceInputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className={workspaceLabelClass}>
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yoursite.com"
                      className={workspaceInputClass}
                    />
                  </div>
                </div>
              </section>

              <section className={cn(workspaceCardClass, "overflow-hidden")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#e9e8e7] px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-5 text-[#2055FD]" />
                    <div>
                      <CardTitle className="text-lg text-[#0A0A0A]">
                        Work experience
                      </CardTitle>
                      <CardDescription className="text-[#6B6B6B]">
                        Roles, impact, and achievements
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={workspaceOutlineButtonClass}
                    onClick={addWorkExperience}
                  >
                    <Plus className="size-4" />
                    Add role
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {workExperience.length === 0 ? (
                    <p className="text-sm text-[#6B6B6B]">
                      No roles yet. Add manually or import from LinkedIn.
                    </p>
                  ) : (
                    workExperience.map((job, index) => (
                      <div key={job.id}>
                        {index > 0 && <Separator className="mb-6 bg-[#e9e8e7]" />}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label className={workspaceLabelClass}>Company</Label>
                            <Input
                              value={job.company}
                              onChange={(e) =>
                                updateWorkExperience(job.id, {
                                  company: e.target.value,
                                })
                              }
                              className={workspaceInputClass}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={workspaceLabelClass}>Title</Label>
                            <Input
                              value={job.title}
                              onChange={(e) =>
                                updateWorkExperience(job.id, {
                                  title: e.target.value,
                                })
                              }
                              className={workspaceInputClass}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={workspaceLabelClass}>Start date</Label>
                            <Input
                              value={job.startDate}
                              onChange={(e) =>
                                updateWorkExperience(job.id, {
                                  startDate: e.target.value,
                                })
                              }
                              placeholder="2022-01"
                              className={workspaceInputClass}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={workspaceLabelClass}>End date</Label>
                            <Input
                              value={job.endDate ?? ""}
                              onChange={(e) =>
                                updateWorkExperience(job.id, {
                                  endDate: e.target.value || null,
                                })
                              }
                              placeholder="Present"
                              disabled={job.current}
                              className={workspaceInputClass}
                            />
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <input
                              type="checkbox"
                              id={`current-${job.id}`}
                              checked={job.current}
                              onChange={(e) =>
                                updateWorkExperience(job.id, {
                                  current: e.target.checked,
                                  endDate: e.target.checked ? null : job.endDate,
                                })
                              }
                              className="size-4 rounded border-[#c7c6cb] accent-[#2055FD]"
                            />
                            <Label
                              htmlFor={`current-${job.id}`}
                              className="text-sm font-medium text-[#46464b]"
                            >
                              Current role
                            </Label>
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label className={workspaceLabelClass}>Description</Label>
                            <Textarea
                              rows={3}
                              value={job.description}
                              onChange={(e) =>
                                updateWorkExperience(job.id, {
                                  description: e.target.value,
                                })
                              }
                              className={cn(workspaceInputClass, "resize-y")}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => removeWorkExperience(job.id)}
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </section>

              <section className={cn(workspaceCardClass, "overflow-hidden")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#e9e8e7] px-6 py-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-5 text-[#2055FD]" />
                    <div>
                      <CardTitle className="text-lg text-[#0A0A0A]">Education</CardTitle>
                      <CardDescription className="text-[#6B6B6B]">
                        Degrees and institutions
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={workspaceOutlineButtonClass}
                    onClick={addEducation}
                  >
                    <Plus className="size-4" />
                    Add education
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {education.length === 0 ? (
                    <p className="text-sm text-[#6B6B6B]">No education entries yet.</p>
                  ) : (
                    education.map((edu, index) => (
                      <div key={edu.id}>
                        {index > 0 && <Separator className="mb-6 bg-[#e9e8e7]" />}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2 sm:col-span-2">
                            <Label className={workspaceLabelClass}>Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) =>
                                updateEducation(edu.id, {
                                  institution: e.target.value,
                                })
                              }
                              className={workspaceInputClass}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={workspaceLabelClass}>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) =>
                                updateEducation(edu.id, { degree: e.target.value })
                              }
                              className={workspaceInputClass}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={workspaceLabelClass}>
                              Field of study
                            </Label>
                            <Input
                              value={edu.field}
                              onChange={(e) =>
                                updateEducation(edu.id, { field: e.target.value })
                              }
                              className={workspaceInputClass}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => removeEducation(edu.id)}
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </section>

              <section className={cn(workspaceCardClass, "overflow-hidden")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#e9e8e7] px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Wrench className="size-5 text-[#2055FD]" />
                    <div>
                      <CardTitle className="text-lg text-[#0A0A0A]">Skills</CardTitle>
                      <CardDescription className="text-[#6B6B6B]">
                        Tools, languages, and competencies
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={workspaceOutlineButtonClass}
                    onClick={addSkill}
                  >
                    <Plus className="size-4" />
                    Add skill
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {skills.length === 0 ? (
                    <p className="text-sm text-[#6B6B6B]">No skills listed yet.</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-center gap-1 rounded-lg border border-[#c7c6cb] bg-[#fbf9f8] px-2 py-1"
                          >
                            <Input
                              value={skill.name}
                              onChange={(e) => updateSkill(skill.id, e.target.value)}
                              className="h-7 w-32 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                              placeholder="Skill name"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-[#77777c] hover:text-red-600"
                              onClick={() => removeSkill(skill.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5 border-t border-[#e9e8e7] pt-4">
                        {skills
                          .filter((s) => s.name.trim())
                          .map((skill) => (
                            <Badge
                              key={skill.id}
                              className="border border-[#2055FD]/20 bg-[#2055FD]/10 text-[#2055FD]"
                            >
                              {skill.name}
                            </Badge>
                          ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </section>
            </div>

            <aside className="flex flex-col gap-6 lg:col-span-4">
              <section
                className={cn(
                  workspaceCardClass,
                  "relative overflow-hidden p-6",
                )}
              >
                <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-[#2055FD]/10 blur-2xl" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="flex size-24 items-center justify-center rounded-full border-4 border-white bg-[#efeded] text-2xl font-bold text-[#0A0A0A] shadow-sm">
                      {getInitials(fullName || "Profile")}
                    </div>
                    {fullName.trim() ? (
                      <span
                        className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#0EB87A] text-white"
                        title="Profile active"
                      >
                        <CheckCircle2 className="size-4" />
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-xl font-semibold text-[#0A0A0A]">
                    {fullName.trim() || "Your name"}
                  </h3>
                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    {headline.trim() || "Add a professional headline"}
                  </p>
                  {location.trim() ? (
                    <p className="mt-1 font-mono text-[12px] tracking-wide text-[#77777c] uppercase">
                      {location}
                    </p>
                  ) : null}
                  <div className="mt-6 w-full rounded-lg border border-[#c7c6cb]/50 bg-[#f5f3f3] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-left">
                        <span className={workspaceLabelClass}>Vault status</span>
                        <p className="text-sm font-semibold text-[#0A0A0A]">
                          {vaultResumeId ? "Synced" : "Not saved yet"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase",
                          vaultResumeId
                            ? "border border-[#0EB87A]/30 bg-[#0EB87A]/10 text-[#005233]"
                            : "border border-[#c7c6cb] bg-[#efeded] text-[#6B6B6B]",
                        )}
                      >
                        {vaultResumeId ? "Active" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className={cn(workspaceCardClass, "flex flex-col p-6")}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="size-5 text-[#2055FD]" />
                    <h3 className="text-lg font-semibold text-[#0A0A0A]">
                      Resume Vault
                    </h3>
                  </div>
                </div>
                <p className="mb-4 text-sm text-[#6B6B6B]">
                  Your verified master data store for AI generation and tailoring.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="group flex items-center justify-between rounded-lg border border-[#c7c6cb] bg-[#fbf9f8] p-3 transition-all hover:border-[#2055FD]/40 hover:shadow-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#0A0A0A] text-white">
                        <FolderOpen className="size-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="truncate text-sm font-semibold text-[#0A0A0A]">
                          {PROFILE_VAULT_TITLE}
                        </p>
                        <p className="font-mono text-[11px] text-[#6B6B6B]">
                          Structured · {vaultItemCount} sections
                        </p>
                      </div>
                    </div>
                  </div>
                  {workExperience.length > 0 && (
                    <div className="rounded-lg border border-dashed border-[#c7c6cb] bg-white p-3 text-left text-xs text-[#6B6B6B]">
                      <span className="font-semibold text-[#0A0A0A]">
                        {workExperience.length}
                      </span>{" "}
                      work {workExperience.length === 1 ? "entry" : "entries"} ·{" "}
                      <span className="font-semibold text-[#0A0A0A]">
                        {education.length}
                      </span>{" "}
                      education ·{" "}
                      <span className="font-semibold text-[#0A0A0A]">
                        {skills.filter((s) => s.name.trim()).length}
                      </span>{" "}
                      skills
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#c7c6cb] bg-white/90 px-4 py-4 backdrop-blur-md md:left-60">
        <div className="mx-auto flex max-w-6xl justify-end">
          <Button
            type="button"
            size="lg"
            onClick={() => void handleSave()}
            disabled={saving}
            className={cn(workspacePrimaryButtonClass, "gap-2 px-8")}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
