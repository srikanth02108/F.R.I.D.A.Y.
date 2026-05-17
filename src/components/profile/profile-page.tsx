"use client";

import { useCallback, useEffect, useState } from "react";
import { Info, Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react";
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
import { createEmptyResumeContent } from "@/lib/resume-content";
import { createClient } from "@/lib/supabase/client";
import type { ParsedLinkedInProfile } from "@/types/linkedin-import";
import type {
  Education,
  ResumeContent,
  Skill,
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

export function ProfilePage() {
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

      const { data: profileRow } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileRow) {
        setFullName(profileRow.full_name ?? "");
        setHeadline(profileRow.headline ?? "");
        setLocation(profileRow.location ?? "");
        setPhone(profileRow.phone ?? "");
        setLinkedinUrl(profileRow.linkedin_url ?? "");
        setGithubUrl(profileRow.github_url ?? "");
        setWebsiteUrl(profileRow.website_url ?? "");
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

      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          full_name: fullName.trim() || null,
          headline: headline.trim() || null,
          location: location.trim() || null,
          phone: phone.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          github_url: githubUrl.trim() || null,
          website_url: websiteUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        throw new Error(profileError.message);
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
            title: PROFILE_VAULT_TITLE,
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
            title: PROFILE_VAULT_TITLE,
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto h-full w-full max-w-4xl space-y-8 overflow-y-auto px-8 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            My Profile
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your professional vault powers AI resume generation and tailoring.
          </p>
        </div>

        <Dialog
          open={importOpen}
          onOpenChange={(open) => {
            setImportOpen(open);
            if (!open) resetImportState();
          }}
        >
          <DialogTrigger asChild>
            <Button variant="secondary" className="shrink-0 gap-2">
              <Sparkles className="size-4" />
              Import from LinkedIn ✨
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Import from LinkedIn</DialogTitle>
              <DialogDescription>
                Paste exported profile text and let AI structure it for your
                vault.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                <Input
                  id="linkedin-url"
                  placeholder="https://www.linkedin.com/in/your-handle"
                  value={importLinkedinUrl}
                  onChange={(e) => setImportLinkedinUrl(e.target.value)}
                  disabled={isParsing}
                />
              </div>

              <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50/80 p-3 text-sm text-blue-900">
                <Info className="mt-0.5 size-4 shrink-0 text-blue-600" />
                <p>
                  <span className="font-medium">How to import:</span> Go to your
                  LinkedIn profile page → click the &apos;More&apos; button in
                  your top card → select &apos;Save to PDF&apos; or manually
                  highlight and copy your &apos;About&apos; and &apos;Experience&apos;
                  sections, then paste the text payload directly below.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-text">Profile text</Label>
                <Textarea
                  id="profile-text"
                  rows={10}
                  placeholder="Paste your copied LinkedIn text data directly here..."
                  value={importProfileText}
                  onChange={(e) => setImportProfileText(e.target.value)}
                  disabled={isParsing}
                  className="min-h-[200px] resize-y"
                />
              </div>

              {!parsedPreview && (
                <Button
                  type="button"
                  className="w-full"
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
                <div className="space-y-4 rounded-lg border bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">
                    Review extracted data
                  </p>
                  <dl className="grid gap-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Extracted Name</dt>
                      <dd className="font-medium text-slate-900">
                        {parsedPreview.fullName ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">
                        Detected Experience Items Count
                      </dt>
                      <dd className="font-medium text-slate-900">
                        {Array.isArray(parsedPreview.workExperience)
                          ? parsedPreview.workExperience.length
                          : 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Identified Skills Matrix</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {previewSkillLabels}
                        {Array.isArray(parsedPreview.skills) &&
                          parsedPreview.skills.length > 12 && (
                            <span className="text-slate-500">
                              {" "}
                              +{parsedPreview.skills.length - 12} more
                            </span>
                          )}
                      </dd>
                    </div>
                  </dl>
                  <Button
                    type="button"
                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={handleConfirmImport}
                  >
                    Confirm & Save to Profile
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Basics shown across generated resumes</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Senior Software Engineer · Full Stack"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="summary">Professional summary</Label>
            <Textarea
              id="summary"
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A concise overview of your experience and strengths..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Work experience</CardTitle>
            <CardDescription>Roles, impact, and achievements</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addWorkExperience}>
            <Plus className="size-4" />
            Add role
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {workExperience.length === 0 ? (
            <p className="text-sm text-slate-500">
              No roles yet. Add manually or import from LinkedIn.
            </p>
          ) : (
            workExperience.map((job, index) => (
              <div key={job.id}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={job.company}
                      onChange={(e) =>
                        updateWorkExperience(job.id, { company: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={job.title}
                      onChange={(e) =>
                        updateWorkExperience(job.id, { title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start date</Label>
                    <Input
                      value={job.startDate}
                      onChange={(e) =>
                        updateWorkExperience(job.id, {
                          startDate: e.target.value,
                        })
                      }
                      placeholder="2022-01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End date</Label>
                    <Input
                      value={job.endDate ?? ""}
                      onChange={(e) =>
                        updateWorkExperience(job.id, {
                          endDate: e.target.value || null,
                        })
                      }
                      placeholder="Present"
                      disabled={job.current}
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
                      className="size-4 rounded border-slate-300"
                    />
                    <Label htmlFor={`current-${job.id}`}>Current role</Label>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={job.description}
                      onChange={(e) =>
                        updateWorkExperience(job.id, {
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-destructive hover:text-destructive"
                  onClick={() => removeWorkExperience(job.id)}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Education</CardTitle>
            <CardDescription>Degrees and institutions</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addEducation}>
            <Plus className="size-4" />
            Add education
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {education.length === 0 ? (
            <p className="text-sm text-slate-500">No education entries yet.</p>
          ) : (
            education.map((edu, index) => (
              <div key={edu.id}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(edu.id, { institution: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, { degree: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field of study</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) =>
                        updateEducation(edu.id, { field: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-destructive hover:text-destructive"
                  onClick={() => removeEducation(edu.id)}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Tools, languages, and competencies</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addSkill}>
            <Plus className="size-4" />
            Add skill
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {skills.length === 0 ? (
            <p className="text-sm text-slate-500">No skills listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-1 rounded-lg border bg-white px-2 py-1"
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
                    className="text-slate-400 hover:text-destructive"
                    onClick={() => removeSkill(skill.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {skills
                .filter((s) => s.name.trim())
                .map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pb-8">
        <Button
          type="button"
          size="lg"
          onClick={() => void handleSave()}
          disabled={saving}
          className="gap-2"
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
  );
}

