// MITRE ATT&CK Types
export type MatrixType = 'enterprise' | 'mobile' | 'ics';

export interface Matrix {
  id: string;
  name: string;
  type: MatrixType;
  tactics: Tactic[];
}

export interface Tactic {
  id: string;
  name: string;
  shortName: string;
  description: string;
  techniques: Technique[];
}

export interface Technique {
  id: string;
  name: string;
  description: string;
  subTechniques: SubTechnique[];
}

export interface SubTechnique {
  id: string;
  name: string;
  description: string;
}

export type DetectionFormat = 'sigma' | 'yara' | 'kql';

export interface Detection {
  id: string;
  techniqueId: string;
  format: DetectionFormat;
  rule: string;
  metadata: {
    author: string;
    created: string;
    modified: string;
    platforms: string[];
  };
}