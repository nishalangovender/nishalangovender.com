import { PageHero } from "@/components/ui/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import SkillsBrowser from "@/components/ui/SkillsBrowser";
import SkillsVenn from "@/components/ui/SkillsVenn";

export default function SkillsPage() {
  return (
    <PageSection>
      <PageHero
        eyebrow="Toolkit"
        title="Skills & Technologies"
        description="Mechatronics sits at the intersection of software, electronics, and mechanical engineering. Explore each discipline — and the overlaps where they meet."
      >
        <SkillsVenn />
      </PageHero>

      <div className="circuit-divider mt-20 mb-16" />

      <SkillsBrowser />
    </PageSection>
  );
}
