import axios from 'axios';
import type { Matrix, Tactic, Technique, SubTechnique } from '../types';

const MITRE_API_BASE = 'https://raw.githubusercontent.com/mitre/cti/master';

const api = axios.create({
  baseURL: MITRE_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchMatrices(): Promise<Matrix[]> {
  const enterpriseMatrix = await api.get('/enterprise-attack/enterprise-attack.json');
  const mobileMatrix = await api.get('/mobile-attack/mobile-attack.json');
  const icsMatrix = await api.get('/ics-attack/ics-attack.json');

  const matrices: Matrix[] = [
    {
      id: 'enterprise',
      name: 'Enterprise',
      type: 'enterprise',
      tactics: extractTactics(enterpriseMatrix.data.objects),
    },
    {
      id: 'mobile',
      name: 'Mobile',
      type: 'mobile',
      tactics: extractTactics(mobileMatrix.data.objects),
    },
    {
      id: 'ics',
      name: 'ICS',
      type: 'ics',
      tactics: extractTactics(icsMatrix.data.objects),
    },
  ];

  return matrices;
}

function extractTactics(objects: any[]): Tactic[] {
  const tactics = objects.filter(obj => obj.type === 'x-mitre-tactic');
  const techniques = objects.filter(obj => obj.type === 'attack-pattern');

  return tactics.map(tactic => ({
    id: tactic.external_references.find((ref: any) => ref.source_name === 'mitre-attack').external_id,
    name: tactic.name,
    shortName: tactic.x_mitre_shortname,
    description: tactic.description,
    techniques: extractTechniques(techniques, tactic.x_mitre_shortname),
  }));
}

function extractTechniques(techniques: any[], tacticName: string): Technique[] {
  return techniques
    .filter(tech => tech.kill_chain_phases?.some((phase: any) => phase.phase_name === tacticName))
    .map(tech => {
      const ref = tech.external_references.find((ref: any) => ref.source_name === 'mitre-attack');
      return {
        id: ref.external_id,
        name: tech.name,
        description: tech.description,
        subTechniques: extractSubTechniques(techniques, ref.external_id),
      };
    });
}

function extractSubTechniques(techniques: any[], parentId: string): SubTechnique[] {
  return techniques
    .filter(tech => tech.x_mitre_is_subtechnique && tech.x_mitre_parent_technique_id === parentId)
    .map(sub => {
      const ref = sub.external_references.find((ref: any) => ref.source_name === 'mitre-attack');
      return {
        id: ref.external_id,
        name: sub.name,
        description: sub.description,
      };
    });
}

// These functions are no longer needed as we load all data at once
export async function fetchTactics(): Promise<Tactic[]> {
  return [];
}

export async function fetchTechniques(): Promise<Technique[]> {
  return [];
}

export async function fetchSubTechniques(): Promise<SubTechnique[]> {
  return [];
}