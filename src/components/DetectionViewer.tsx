import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { DetectionFormat } from '../types';

// Temporary mock detections - will be replaced with actual detection generation logic
const mockDetections: Record<string, Record<DetectionFormat, string>> = {
  'T1548': {
    sigma: `title: Potential Privilege Escalation via Sudo
detection:
  SELECTION:
    EventID: 4688
    CommandLine|contains: 'sudo'
  condition: SELECTION
falsepositives:
  - Legitimate sudo usage
level: medium`,
    yara: `rule T1548_Privilege_Escalation {
    meta:
        description = "Detects potential privilege escalation attempts"
        author = "MITRE ATT&CK Detection Platform"
    strings:
        $s1 = "sudo" ascii wide
        $s2 = "runas" ascii wide
    condition:
        any of them
}`,
    kql: `SecurityEvent
| where EventID == 4688
| where CommandLine contains "sudo"
| where NewProcessName !endswith "sudo.exe"
| project TimeGenerated, Computer, Account, CommandLine`,
  },
  'T1548.001': {
    sigma: `title: Setuid/Setgid Privilege Escalation
detection:
  SELECTION:
    EventID: 4688
    CommandLine|contains|all:
      - 'chmod'
      - '+s'
  condition: SELECTION
falsepositives:
  - Legitimate setuid/setgid operations
level: high`,
    yara: `rule T1548_001_Setuid_Setgid {
    meta:
        description = "Detects setuid/setgid privilege escalation attempts"
        author = "MITRE ATT&CK Detection Platform"
    strings:
        $s1 = "chmod" ascii wide
        $s2 = "+s" ascii wide
    condition:
        all of them
}`,
    kql: `SecurityEvent
| where EventID == 4688
| where CommandLine contains "chmod"
| where CommandLine contains "+s"
| project TimeGenerated, Computer, Account, CommandLine`,
  },
  'M1001': {
    sigma: `title: App Store Abuse Detection
detection:
  SELECTION:
    EventID: 1234
    AppSource: 'unofficial_store'
  condition: SELECTION
falsepositives:
  - Developer testing
level: medium`,
    yara: `rule M1001_App_Store_Abuse {
    meta:
        description = "Detects potential app store abuse"
        author = "MITRE ATT&CK Detection Platform"
    strings:
        $s1 = "market.android.com" ascii wide
        $s2 = "play.google.com" ascii wide
    condition:
        any of them
}`,
    kql: `SecurityEvent
| where EventID == 1234
| where AppSource == "unofficial_store"
| project TimeGenerated, Device, AppName, AppSource`,
  },
  'I1001': {
    sigma: `title: Engineering Workstation Compromise
detection:
  SELECTION:
    EventID: 5678
    SystemType: 'engineering_workstation'
    AlertType: 'unauthorized_access'
  condition: SELECTION
falsepositives:
  - Authorized maintenance
level: critical`,
    yara: `rule I1001_Engineering_Workstation_Compromise {
    meta:
        description = "Detects potential engineering workstation compromise"
        author = "MITRE ATT&CK Detection Platform"
    strings:
        $s1 = "engineering.config" ascii wide
        $s2 = "plc.program" ascii wide
    condition:
        any of them
}`,
    kql: `SecurityEvent
| where EventID == 5678
| where SystemType == "engineering_workstation"
| where AlertType == "unauthorized_access"
| project TimeGenerated, Workstation, User, AccessType`,
  },
};

interface DetectionViewerProps {
  technique: string | null;
  format: DetectionFormat;
}

const DetectionViewer: React.FC<DetectionViewerProps> = ({ technique, format }) => {
  if (!technique) {
    return (
      <div className="p-8 text-center text-gray-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p>Select a technique to view its detection rules</p>
      </div>
    );
  }

  const detection = mockDetections[technique]?.[format];

  if (!detection) {
    return (
      <div className="p-8 text-center text-gray-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p>No detection rules available for this technique in {format.toUpperCase()} format</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{detection}</code>
      </pre>
    </div>
  );
};

export default DetectionViewer;