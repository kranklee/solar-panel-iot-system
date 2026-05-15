// Composes the asymmetric Apple style bento grid of feature cards
// Each card declares its own column and row span via Tailwind utilities
import { GitHubCard } from './GitHubCard';
import { PythonRunner } from './PythonRunner';
import { GamesCard } from './GamesCard';
import { TechStackCard } from './TechStackCard';
import { ArchitectureCard } from './ArchitectureCard';
import { CVModal } from './CVModal';
import { ContactCard } from './ContactCard';

export function BentoGrid() {
  return (
    <section
      id="projects"
      aria-label="Project bento grid"
      className="grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12"
    >
      <div className="col-span-1 row-span-2 sm:col-span-6 lg:col-span-7">
        <GitHubCard />
      </div>
      <div className="col-span-1 row-span-2 sm:col-span-6 lg:col-span-5">
        <PythonRunner />
      </div>
      <div id="games" className="col-span-1 row-span-4 sm:col-span-6 lg:col-span-8">
        <GamesCard />
      </div>
      <div id="stack" className="col-span-1 row-span-2 sm:col-span-6 lg:col-span-4">
        <TechStackCard />
      </div>
      <div className="col-span-1 row-span-2 sm:col-span-6 lg:col-span-4">
        <CVModal />
      </div>
      <div className="col-span-1 row-span-3 sm:col-span-6 lg:col-span-7">
        <ArchitectureCard />
      </div>
      <div id="contact" className="col-span-1 row-span-3 sm:col-span-6 lg:col-span-5">
        <ContactCard />
      </div>
    </section>
  );
}
