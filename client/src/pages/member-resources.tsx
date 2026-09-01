import { useQuery } from "@tanstack/react-query";
import { BookOpen, ExternalLink } from "lucide-react";
import { MemberShell } from "@/components/member-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  externalUrl?: string;
}

export default function MemberResources() {
  const { data } = useQuery<{ resources: Resource[] }>({ queryKey: ["/api/hub/resources"] });

  return (
    <MemberShell eyebrow="Preparation Library">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10 max-w-3xl">
          <BookOpen className="mb-4 h-8 w-8 text-primary" />
          <h1 className="font-serif text-4xl text-white md:text-5xl">Practices for the path</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Shared preparation and integration resources. Retreat-specific material lives inside each private container.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data?.resources.map((resource) => (
            <a key={resource.id} href={resource.externalUrl} target="_blank" rel="noreferrer" className="group">
              <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <Badge variant="outline">{resource.category}</Badge>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <h2 className="mt-5 font-serif text-2xl text-white">{resource.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
        {!data?.resources.length && (
          <Card className="border-dashed"><CardContent className="py-14 text-center text-muted-foreground">The shared resource library is being prepared.</CardContent></Card>
        )}
      </div>
    </MemberShell>
  );
}
