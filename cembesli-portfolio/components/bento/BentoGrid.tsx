// Composes the asymmetric Apple style bento grid of feature cards
// Anschreiben generator and live solar dashboard sit alongside the AI assistant for German recruiter wow
import { GitHubCard } from './GitHubCard';
import { PythonRunner } from './PythonRunner';
import { GamesCard } from './GamesCard';
import { TechStackCard } from './TechStackCard';
import { ArchitectureCard } from './ArchitectureCard';
import { CVModal } from './CVModal';
import { ContactCard } from './ContactCard';
import { AIChatCard } from './AIChatCard';
import { SolarDashboardCard } from './SolarDashboardCard';
import { TechRadarCard } from './TechRadarCard';
import { TimelineCard } from './TimelineCard';
import { AchievementsCard } from './AchievementsCard';
import { AnschreibenCard } from './AnschreibenCard';

export function BentoGrid() {
  return (
    <section
      id="projects"
      aria-label="Project bento grid"
      className="grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12"
    >
      <div className="col-span-1 row-span-3 sm:col-span-6 lg:col-span-7">
        <AIChatCard />
      </div>
      <div className="col-span-1 row-span-3 sm:col-span-6 lg:col-span-5">
        <AnschreibenCard />
      </div>
      <div className="col-span-1 row-span-2 sm:col-span-6 lg:col-span-7">
        <GitHubCard />
      </div>
      <div className="col-span-1 row-span-2 sm:col-span-6 lg:col-span-5">
        <PythonRunner />
      </div>
      <div id="games" className="col-span-1 row-span-4 sm:col-span-6 lg:col-span-8">
        <GamesCard />
      </div>
      <div className="col-span-1 row-span-3 sm:col-span-6 lg:col-span-4">
        <SolarDashboardCard />
      </div>
      <div className="col-span-1 row-span-1 sm:col-span-6 lg:col-span-4">
        <CVModal />
      </div>
      <div id="stack" className="col-span-1 row-span-2 sm:col-span-6 lg:col-span-4">
        <TechStackCard />
      </div>
      <div className="col-span-1 row-span-3 sm:col-span-6 lg:col-span-7">
        <ArchitectureCard />
      </div>
      <div className="col-span-1 row-span-3 sm:col-span-6 lg:col-span-5">
        <TechRadarCard />
      </div>
      <div className="col-span-1 row-span-3 sm:col-span-6 lg:col-span-5">
        <TimelineCard />
      </div>
      <div className="col-span-1 row-span-3 sm:col-span-6 lg:col-span-4">
        <AchievementsCard />
      </div>
      <div id="contact" className="col-span-1 row-span-3 sm:col-span-6 lg:col-span-3">
        <ContactCard />
      </div>
    </section>
  );
}
