import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleUserRound, Loader2, Save, ShieldCheck } from "lucide-react";
import { MemberShell } from "@/components/member-shell";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  displayName: string;
  bio: string;
  location: string;
  interests: string[];
  directoryVisible: boolean;
  buddyContact: string;
  photoConsent: boolean;
}

export default function MemberProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const profileQuery = useQuery<{ profile: Profile }>({ queryKey: ["/api/hub/profile"] });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interestText, setInterestText] = useState("");

  useEffect(() => {
    if (profileQuery.data?.profile && !profile) {
      setProfile(profileQuery.data.profile);
      setInterestText(profileQuery.data.profile.interests.join(", "));
    }
  }, [profileQuery.data, profile]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiRequest("PUT", "/api/hub/profile", {
        ...profile,
        interests: interestText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 12),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hub/profile"] });
      toast({ title: "Community profile saved" });
    },
    onError: (error: Error) =>
      toast({ title: "Could not save profile", description: error.message, variant: "destructive" }),
  });

  if (!profile) {
    return (
      <MemberShell eyebrow="Community Profile">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MemberShell>
    );
  }

  return (
    <MemberShell eyebrow="Community Profile">
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <CircleUserRound className="mb-4 h-8 w-8 text-primary" />
          <h1 className="font-serif text-4xl text-white">How you show up</h1>
          <p className="mt-2 text-muted-foreground">
            You control what the cohort sees. Your account email is never shown in the directory.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Public to opted-in cohorts</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display name</Label>
                <Input id="display-name" value={profile.displayName} maxLength={120} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Short introduction</Label>
                <Textarea id="bio" value={profile.bio} maxLength={600} rows={4} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">General location</Label>
                  <Input id="location" value={profile.location} maxLength={120} placeholder="e.g. Eastern Ontario" onChange={(event) => setProfile({ ...profile, location: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests, separated by commas</Label>
                  <Input id="interests" value={interestText} placeholder="Hiking, breathwork, fatherhood" onChange={(event) => setInterestText(event.target.value)} />
                </div>
              </div>
              <div className="flex items-start justify-between gap-5 rounded-md border border-white/10 p-4">
                <div>
                  <Label htmlFor="directory-visible">Appear in cohort directories</Label>
                  <p className="mt-1 text-sm text-muted-foreground">Only people with access to the same retreat can see you.</p>
                </div>
                <Switch id="directory-visible" checked={profile.directoryVisible} onCheckedChange={(checked) => setProfile({ ...profile, directoryVisible: checked })} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Private consent and contact</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="buddy-contact">Buddy contact details</Label>
                <Input id="buddy-contact" value={profile.buddyContact} maxLength={200} placeholder="Phone, Signal, or another preferred method" onChange={(event) => setProfile({ ...profile, buddyContact: event.target.value })} />
                <p className="text-xs text-muted-foreground">Visible only to a staff-created accountability match.</p>
              </div>
              <div className="flex items-start justify-between gap-5 rounded-md border border-white/10 p-4">
                <div>
                  <Label htmlFor="photo-consent">Retreat photo participation</Label>
                  <p className="mt-1 text-sm text-muted-foreground">Allow yourself to upload and participate in the private, moderated retreat gallery.</p>
                </div>
                <Switch id="photo-consent" checked={profile.photoConsent} onCheckedChange={(checked) => setProfile({ ...profile, photoConsent: checked })} />
              </div>
            </CardContent>
          </Card>

          <Button size="lg" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || profile.displayName.trim().length < 2}>
            {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save profile
          </Button>
        </div>
      </div>
    </MemberShell>
  );
}
