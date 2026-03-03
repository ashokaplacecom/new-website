import Image from "next/image";
import type { Department, TeamSection } from "@/lib/content-types";
import { getJsonData } from "@/lib/content";
import { cn } from "@/lib/utils";
import { DepartmentAnimWrapper } from "@/components/department-anim-wrapper";
import {
    Card,
    CardContent,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamSectionProps {
    section: TeamSection;
}

/**
 * Renders all departments from content/data/departments.json.
 *
 * Each department block shows:
 *  • Department name + writeup paragraph
 *  • Leadership row — shadcn Card components with next/image photo
 *  • Members list — shadcn Badge (outline) chips
 *
 * Server component — data loaded at build/request time via getJsonData.
 * Leader images use next/image for built-in caching & optimisation.
 * Animations are handled by the DepartmentAnimWrapper client boundary.
 */
export function TeamSectionBlock({ section }: TeamSectionProps) {
    const departments = getJsonData<Department[]>("departments");

    return (
        <section
            className={cn("py-16 px-4", section.className)}
            aria-label="Team departments"
        >
            <div className="max-w-5xl mx-auto">
                {departments.map((dept, deptIdx) => (
                    <DepartmentAnimWrapper key={dept.id} index={deptIdx}>
                        <DepartmentBlock dept={dept} index={deptIdx} />
                    </DepartmentAnimWrapper>
                ))}
            </div>
        </section>
    );
}

// ─── Department Block ────────────────────────────────────────────────────────

function DepartmentBlock({ dept, index }: { dept: Department; index: number }) {
    return (
        <div className="pt-16">
            {index > 0 && <div className="border-t border-border mb-16 -mt-0" />}

            {/* Department heading + writeup */}
            <div className="mb-10">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
                    {dept.name}
                </h2>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
                    {dept.writeup}
                </p>
            </div>

            {/* Leadership */}
            {dept.leaders.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-5">
                        Leadership
                    </h3>
                    <div
                        className={cn(
                            "grid gap-4",
                            dept.leaders.length === 1
                                ? "grid-cols-1 sm:grid-cols-2"
                                : dept.leaders.length === 2
                                    ? "grid-cols-1 sm:grid-cols-2"
                                    : dept.leaders.length === 3
                                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                        : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
                        )}
                    >
                        {dept.leaders.map((leader, i) => (
                            <LeaderCard
                                key={leader.name}
                                leader={leader}
                                priority={index === 0 && i === 0}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Members */}
            {dept.members.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-4">
                        Members
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {dept.members.map((member) => (
                            <MemberBadge key={member.name} member={member} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Leader Card (shadcn Card) ────────────────────────────────────────────────

interface LeaderCardProps {
    leader: { name: string; role: string; image: string };
    priority?: boolean;
}

function LeaderCard({ leader, priority = false }: LeaderCardProps) {
    return (
        <Card className="group overflow-hidden p-0 gap-0 hover:border-primary/25 hover:shadow-md transition-all duration-300">
            {/* Photo — aspect-[4/3], next/image with caching */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={priority}
                    className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                    quality={80}
                />
                {/* Subtle bottom fade on the photo */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
            </div>
            {/* Name + role */}
            <CardContent className="px-4 py-3">
                <CardTitle className="text-sm font-semibold leading-tight">
                    {leader.name}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                    {leader.role}
                </CardDescription>
            </CardContent>
        </Card>
    );
}

// ─── Member Badge (shadcn Badge, outline variant) ─────────────────────────────

function MemberBadge({ member }: { member: { name: string; role: string } }) {
    return (
        <Badge
            variant="outline"
            className="text-sm font-normal px-3 py-1.5 gap-1.5 rounded-full"
        >
            <span className="font-medium text-foreground">{member.name}</span>
            <span className="text-muted-foreground">{member.role}</span>
        </Badge>
    );
}
