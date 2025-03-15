import axios from 'axios';
import type { Matrix, Tactic, Technique, SubTechnique } from '../types';

// Instead of relying solely on external API, let's implement a hybrid approach
// with mock data as fallback for reliability
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
              {
                id: 'T1548.002',
                name: 'Bypass User Account Control',
                description:
                  'Adversaries may bypass UAC mechanisms to elevate process privileges on system.',
              },
            ],
          },
          {
            id: 'T1195',
            name: 'Supply Chain Compromise',
            description:
              'Adversaries may manipulate products or product delivery mechanisms prior to receipt by a final consumer for the purpose of data or system compromise.',
            subTechniques: [
              {
                id: 'T1195.001',
                name: 'Compromise Software Dependencies and Development Tools',
                description:
                  'Adversaries may manipulate software dependencies and development tools prior to receipt by a final consumer for the purpose of data or system compromise.',
              },
              {
                id: 'T1195.002',
                name: 'Compromise Software Supply Chain',
                description:
                  'Adversaries may manipulate software prior to receipt by a final consumer for the purpose of data or system compromise.',
              },
            ],
          },
        ],
      },
      {
        id: 'TA0002',
        name: 'Execution',
        shortName: 'execution',
        description:
          'Techniques that result in adversary-controlled code running on a local or remote system',
        techniques: [
          {
            id: 'T1059',
            name: 'Command and Scripting Interpreter',
            description:
              'Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries.',
            subTechniques: [
              {
                id: 'T1059.001',
                name: 'PowerShell',
                description:
                  'Adversaries may abuse PowerShell commands and scripts for execution.',
              },
              {
                id: 'T1059.002',
                name: 'AppleScript',
                description: 'Adversaries may abuse AppleScript for execution.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile ATT&CK',
    type: 'mobile',
    tactics: [
      {
        id: 'TA0027',
        name: 'Initial Access',
        shortName: 'initial-access',
        description:
          'Techniques used to gain initial access to a mobile device',
        techniques: [
          {
            id: 'M1001',
            name: 'App Store Abuse',
            description:
              'Adversaries may abuse legitimate app stores to deliver malicious applications to users.',
            subTechniques: [],
          },
        ],
      },
    ],
  },
  {
    id: 'ics',
    name: 'ICS ATT&CK',
    type: 'ics',
    tactics: [
      {
        id: 'TA0108',
        name: 'Initial Access',
        shortName: 'initial-access',
        description:
          'Techniques used to gain initial access to an ICS environment',
        techniques: [
          {
            id: 'I1001',
            name: 'Engineering Workstation Compromise',
            description:
              'Adversaries may compromise engineering workstations to gain access to the ICS environment.',
            subTechniques: [],
          },
        ],
      },
    ],
  },
];

const MITRE_API_BASE = 'https://raw.githubusercontent.com/mitre/cti/master';

const api = axios.create({
  baseURL: MITRE_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout to prevent hanging requests
});

// Attempt to fetch from MITRE API but fall back to mock data
export async function fetchMatrices(): Promise<Matrix[]> {
  try {
    // Attempt to get real data from MITRE CTI
    const [enterpriseResponse, mobileResponse, icsResponse] = await Promise.all(
      [
        api.get('/enterprise-attack/enterprise-attack.json'),
        api.get('/mobile-attack/mobile-attack.json'),
        api.get('/ics-attack/ics-attack.json'),
      ]
    );

    // Process the data if successfully retrieved
    if (enterpriseResponse.data && mobileResponse.data && icsResponse.data) {
      try {
        const matrices: Matrix[] = [
          {
            id: 'enterprise',
            name: 'Enterprise ATT&CK',
            type: 'enterprise',
            tactics: extractTactics(enterpriseResponse.data.objects),
          },
          {
            id: 'mobile',
            name: 'Mobile ATT&CK',
            type: 'mobile',
            tactics: extractTactics(mobileResponse.data.objects),
          },
          {
            id: 'ics',
            name: 'ICS ATT&CK',
            type: 'ics',
            tactics: extractTactics(icsResponse.data.objects),
          },
        ];

        return matrices;
      } catch (processingError) {
        console.error('Error processing MITRE ATT&CK data:', processingError);
        return mockMatrices;
      }
    }

    return mockMatrices;
  } catch (fetchError) {
    console.error('Error fetching MITRE ATT&CK data:', fetchError);
    return mockMatrices;
  }
}

function extractTactics(objects: any[]): Tactic[] {
  try {
    if (!Array.isArray(objects)) {
      throw new Error('Invalid objects data structure');
    }

    const tactics = objects.filter(
      (obj) =>
        obj &&
        obj.type === 'x-mitre-tactic' &&
        obj.external_references &&
        Array.isArray(obj.external_references)
    );

    const techniques = objects.filter(
      (obj) =>
        obj &&
        obj.type === 'attack-pattern' &&
        obj.external_references &&
        Array.isArray(obj.external_references)
    );

    return tactics.map((tactic) => {
      const tacticRef = tactic.external_references.find(
        (ref: any) => ref && ref.source_name === 'mitre-attack'
      );

      const tacticId = tacticRef ? tacticRef.external_id : `TA-${tactic.name}`;

      return {
        id: tacticId,
        name: tactic.name || 'Unknown Tactic',
        shortName: tactic.x_mitre_shortname || tacticId.toLowerCase(),
        description: tactic.description || 'No description available',
        techniques: extractTechniques(techniques, tactic.x_mitre_shortname),
      };
    });
  } catch (error) {
    console.error('Error extracting tactics:', error);
    return [];
  }
}

function extractTechniques(techniques: any[], tacticName: string): Technique[] {
  try {
    if (!Array.isArray(techniques) || !tacticName) {
      return [];
    }

    return techniques
      .filter(
        (tech) =>
          tech &&
          tech.kill_chain_phases &&
          Array.isArray(tech.kill_chain_phases) &&
          tech.kill_chain_phases.some(
            (phase: any) => phase && phase.phase_name === tacticName
          )
      )
      .map((tech) => {
        const ref = tech.external_references.find(
          (ref: any) => ref && ref.source_name === 'mitre-attack'
        );

        const techId = ref ? ref.external_id : `T-${tech.name}`;

        return {
          id: techId,
          name: tech.name || 'Unknown Technique',
          description: tech.description || 'No description available',
          subTechniques: extractSubTechniques(techniques, techId),
        };
      });
  } catch (error) {
    console.error('Error extracting techniques:', error);
    return [];
  }
}

function extractSubTechniques(
  techniques: any[],
  parentId: string
): SubTechnique[] {
  try {
    if (!Array.isArray(techniques) || !parentId) {
      return [];
    }

    return techniques
      .filter(
        (tech) =>
          tech &&
          tech.x_mitre_is_subtechnique &&
          tech.x_mitre_parent_technique_id === parentId
      )
      .map((sub) => {
        const ref = sub.external_references.find(
          (ref: any) => ref && ref.source_name === 'mitre-attack'
        );

        const subId = ref ? ref.external_id : `${parentId}.sub`;

        return {
          id: subId,
          name: sub.name || 'Unknown Sub-technique',
          description: sub.description || 'No description available',
        };
      });
  } catch (error) {
    console.error('Error extracting sub-techniques:', error);
    return [];
  }
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
