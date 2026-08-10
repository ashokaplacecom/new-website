import { getJsonData } from "@/lib/content";
import type { TeamMember } from "@/lib/content-types";
import { TeamMemberCard } from "@/components/team-member-card";

export const metadata = {
    title: "Team - Connect PlaceCom",
    description: "Meet the people who make it happen.",
};

export default function TeamPage() {
    // Attempt to load team data, fallback to empty array if it doesn't exist yet
    let teamData = { members: [] as TeamMember[] };
    try {
        teamData = getJsonData<{ members: TeamMember[] }>("team");
    } catch (e) {
        console.warn("Could not load team.json. Ensure data is added in Keystatic.");
    }

    return (
        <main className="min-h-screen bg-background">
            <section className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="mb-16 md:mb-24">
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-4">
                        The Team
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
                        The people who set the questions and hold the standard.
                    </p>
                </div>

                {teamData.members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                        {teamData.members.map((member, index) => (
                            <TeamMemberCard key={index} member={member} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">
                            No team members added yet. Go to the /backend to add them!
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}
