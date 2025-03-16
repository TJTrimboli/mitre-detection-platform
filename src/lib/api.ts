import axios from 'axios';
import type { Matrix } from '../types';

interface MitreObject {
  type: string;
  name?: string;
  description?: string;
  external_references?: { external_id: string }[];
  x_mitre_shortname?: string;
  kill_chain_phases?: { phase_name: string }[];
  x_mitre_is_subtechnique?: boolean;
  x_mitre_parent_technique_id?: string;
}

interface MitreData {
  objects: MitreObject[];
}

const MITRE_API_BASE = 'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/refs/heads/master';

const api = axios.create({
  baseURL: MITRE_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Mock data as fallback
const mockMatrices: Matrix[] = [
  {
    id: 'enterprise',
    name: 'Enterprise ATT&CK',
    type: 'enterprise',
    tactics: [
      {
        id: 'TA0001',
        name: 'Initial Access',
        shortName: 'initial-access',
        description: 'Techniques used to gain initial access to a network',
        techniques: [
          {
            id: 'T1548',
            name: 'Abuse Elevation Control Mechanism',
            description:
              'Adversaries may bypass UAC mechanisms to elevate process privileges on system.',
            subTechniques: [
              {
                id: 'T1548.001',
                name: 'Setuid and Setgid',
                description:
                  'Adversaries may perform shell escapes or exploit vulnerabilities in an application with the setuid or setgid bits to get code running in a different users context.',
              },
            ],
          },
        ],
      },
    ],
  },
];

export async function fetchMatrices(): Promise<Matrix[]> {
  try {
    const [enterpriseResponse, mobileResponse, icsResponse] = await Promise.all([
      api.get<MitreData>('/enterprise-attack/enterprise-attack.json'),
      api.get<MitreData>('/mobile-attack/mobile-attack.json'),
      api.get<MitreData>('/ics-attack/ics-attack.json'),
    ]);

    const processData = (data: MitreData, type: 'enterprise' | 'mobile' | 'ics'): Matrix => {
      const objects = data.objects || [];
      
      // Extract tactics
      const tactics = objects.filter((obj: MitreObject) => 
        obj.type === 'x-mitre-tactic'
      );

      // Extract techniques
      const techniques = objects.filter((obj: MitreObject) => 
        obj.type === 'attack-pattern'
      );

      // Process tactics with their techniques
      const processedTactics = tactics.map((tactic: MitreObject) => {
        const tacticTechniques = techniques.filter((technique: MitreObject) =>
          technique.kill_chain_phases?.some((phase) => 
            phase.phase_name === tactic.x_mitre_shortname
          )
        );

        // Process techniques and their sub-techniques
        const processedTechniques = tacticTechniques.map((technique: MitreObject) => {
          const subTechniques = techniques.filter((sub: MitreObject) =>
            sub.x_mitre_is_subtechnique === true &&
            sub.x_mitre_parent_technique_id === technique.external_references?.[0]?.external_id
          ).map((sub) => ({
            id: sub.external_references?.[0]?.external_id || '',
            name: sub.name || '',
            description: sub.description || '',
          }));

          return {
            id: technique.external_references?.[0]?.external_id || '',
            name: technique.name || '',
            description: technique.description || '',
            subTechniques,
          };
        });

        return {
          id: tactic.external_references?.[0]?.external_id || '',
          name: tactic.name || '',
          shortName: tactic.x_mitre_shortname || '',
          description: tactic.description || '',
          techniques: processedTechniques,
        };
      });

      return {
        id: type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} ATT&CK`,
        type,
        tactics: processedTactics,
      };
    };

    const matrices: Matrix[] = [
      processData(enterpriseResponse.data, 'enterprise'),
      processData(mobileResponse.data, 'mobile'),
      processData(icsResponse.data, 'ics'),
    ];

    return matrices;
  } catch (error) {
    console.error('Error fetching MITRE ATT&CK data:', error);
    return mockMatrices; // Return mock data as fallback
  }
}