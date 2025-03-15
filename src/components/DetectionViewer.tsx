import React, { useState } from 'react';
import { AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import type { DetectionFormat } from '../types';

// Expanded detection rules with more comprehensive examples
const mockDetections: Record<string, Record<DetectionFormat, string>> = {
  T1548: {
    sigma: `title: Potential Privilege Escalation via Sudo
description: Detects potential privilege escalation attempts using sudo
author: MITRE ATT&CK Detection Platform
status: experimental
references:
  - https://attack.mitre.org/techniques/T1548/
logsource:
  category: process_creation
  product: linux
detection:
  SELECTION:
    CommandLine|contains: 
      - 'sudo'
      - 'pkexec'
      - 'doas'
    CommandLine|contains:
      - '-u root'
      - '-s'
  filter:
    User: 'root'
  condition: SELECTION and not filter
falsepositives:
  - Legitimate sudo usage
  - System administrators
level: medium`,
    yara: `rule T1548_Privilege_Escalation {
    meta:
        description = "Detects potential privilege escalation attempts"
        author = "MITRE ATT&CK Detection Platform"
        reference = "https://attack.mitre.org/techniques/T1548/"
        date = "2023-03-15"
        score = 60
    strings:
        $sudo = "sudo" ascii wide
        $pkexec = "pkexec" ascii wide
        $doas = "doas" ascii wide
        $runas = "runas" ascii wide
        
        $arg1 = "-u root" ascii wide
        $arg2 = "-s" ascii wide
        $arg3 = "/bin/bash" ascii wide
    condition:
        (any of ($sudo, $pkexec, $doas, $runas)) and (any of ($arg1, $arg2, $arg3))
}`,
    kql: `// Detect potential privilege escalation via sudo
// Author: MITRE ATT&CK Detection Platform
// Reference: https://attack.mitre.org/techniques/T1548/
SecurityEvent
| where EventID == 4688
| where CommandLine has_any ("sudo", "pkexec", "doas", "runas")
| where CommandLine has_any ("-u root", "-s", "/bin/bash")
| where AccountType != "System"
| project TimeGenerated, Computer, Account, CommandLine, NewProcessName
| extend Technique = "T1548 - Abuse Elevation Control Mechanism"
| extend TechniqueURL = "https://attack.mitre.org/techniques/T1548/"`,
  },
  'T1548.001': {
    sigma: `title: Setuid/Setgid Privilege Escalation
description: Detects potential privilege escalation via setuid/setgid
author: MITRE ATT&CK Detection Platform
status: experimental
references:
  - https://attack.mitre.org/techniques/T1548/001/
logsource:
  category: process_creation
  product: linux
detection:
  SELECTION:
    CommandLine|contains|all:
      - 'chmod'
      - '+s'
  SELECTION2:
    CommandLine|contains:
      - '+4000'
      - '+2000'
  condition: SELECTION or SELECTION2
falsepositives:
  - Legitimate setuid/setgid operations by system administrators
level: high`,
    yara: `rule T1548_001_Setuid_Setgid {
    meta:
        description = "Detects setuid/setgid privilege escalation attempts"
        author = "MITRE ATT&CK Detection Platform"
        reference = "https://attack.mitre.org/techniques/T1548/001/"
        date = "2023-03-15"
        score = 70
    strings:
        $chmod = "chmod" ascii wide
        $s1 = "+s" ascii wide
        $s2 = "+4000" ascii wide
        $s3 = "+2000" ascii wide
        $s4 = "u+s" ascii wide
        $s5 = "g+s" ascii wide
    condition:
        $chmod and (any of ($s1, $s2, $s3, $s4, $s5))
}`,
    kql: `// Detect potential setuid/setgid privilege escalation
// Author: MITRE ATT&CK Detection Platform
// Reference: https://attack.mitre.org/techniques/T1548/001/
SecurityEvent
| where EventID == 4688
| where CommandLine has "chmod" 
| where CommandLine has_any ("+s", "+4000", "+2000", "u+s", "g+s")
| where AccountType != "System"
| project TimeGenerated, Computer, Account, CommandLine, NewProcessName
| extend Technique = "T1548.001 - Setuid and Setgid"
| extend TechniqueURL = "https://attack.mitre.org/techniques/T1548/001/"`,
  },
  T1059: {
    sigma: `title: Suspicious Command and Scripting Interpreter Use
description: Detects suspicious use of command and scripting interpreters
author: MITRE ATT&CK Detection Platform
status: experimental
references:
  - https://attack.mitre.org/techniques/T1059/
logsource:
  category: process_creation
  product: windows
detection:
  SELECTION:
    CommandLine|contains: 
      - 'powershell.exe -enc'
      - 'cmd.exe /c'
      - 'wscript.exe'
      - 'cscript.exe'
  condition: SELECTION
falsepositives:
  - Administrative scripts
  - Legitimate use of scripting interpreters
level: medium`,
    yara: `rule T1059_Command_Scripting_Interpreter {
    meta:
        description = "Detects suspicious use of command and scripting interpreters"
        author = "MITRE ATT&CK Detection Platform"
        reference = "https://attack.mitre.org/techniques/T1059/"
        date = "2023-03-15"
        score = 55
    strings:
        $cmd1 = "cmd.exe /c" ascii wide nocase
        $cmd2 = "powershell.exe -enc" ascii wide nocase 
        $cmd3 = "wscript.exe" ascii wide nocase
        $cmd4 = "cscript.exe" ascii wide nocase
        
        $sus1 = "hidden" ascii wide
        $sus2 = "bypass" ascii wide
        $sus3 = "encodedcommand" ascii wide
    condition:
        any of ($cmd*) and any of ($sus*)
}`,
    kql: `// Detect suspicious use of command and scripting interpreters
// Author: MITRE ATT&CK Detection Platform
// Reference: https://attack.mitre.org/techniques/T1059/
SecurityEvent
| where EventID == 4688
| where NewProcessName has_any ("cmd.exe", "powershell.exe", "wscript.exe", "cscript.exe") 
| where CommandLine has_any ("-enc", "-encodedcommand", "/c", "-hidden", "-noprofile", "-windowstyle hidden")
| project TimeGenerated, Computer, Account, CommandLine, NewProcessName
| extend Technique = "T1059 - Command and Scripting Interpreter"
| extend TechniqueURL = "https://attack.mitre.org/techniques/T1059/"`,
  },
  'T1059.001': {
    sigma: `title: Suspicious PowerShell Execution
description: Detects suspicious PowerShell execution patterns
author: MITRE ATT&CK Detection Platform
status: experimental
references:
  - https://attack.mitre.org/techniques/T1059/001/
logsource:
  product: windows
  service: powershell
detection:
  SELECTION:
    EventID: 
      - 4103
      - 4104
    ScriptBlockText|contains: 
      - 'Invoke-Expression'
      - 'IEX'
      - 'Net.WebClient'
      - 'DownloadString'
      - 'DownloadFile'
      - 'Start-BitsTransfer'
  condition: SELECTION
falsepositives:
  - Legitimate administrative PowerShell scripts
level: high`,
    yara: `rule T1059_001_PowerShell {
    meta:
        description = "Detects suspicious PowerShell execution patterns"
        author = "MITRE ATT&CK Detection Platform"
        reference = "https://attack.mitre.org/techniques/T1059/001/"
        date = "2023-03-15"
        score = 65
    strings:
        $ps_invoke = "Invoke-Expression" ascii wide nocase
        $ps_iex = "IEX" ascii wide
        $ps_webclient = "Net.WebClient" ascii wide
        $ps_download1 = "DownloadString" ascii wide
        $ps_download2 = "DownloadFile" ascii wide
        $ps_bits = "Start-BitsTransfer" ascii wide
        $ps_enc = "-encodedcommand" ascii wide
    condition:
        any of them
}`,
    kql: `// Detect suspicious PowerShell execution
// Author: MITRE ATT&CK Detection Platform
// Reference: https://attack.mitre.org/techniques/T1059/001/
let suspiciousCmds = dynamic(["Invoke-Expression", "IEX", "Net.WebClient", "DownloadString", 
                              "DownloadFile", "Start-BitsTransfer", "FromBase64String"]);
SecurityEvent
| where EventID == 4688
| where NewProcessName has "powershell.exe"
| where CommandLine has_any (suspiciousCmds)
| project TimeGenerated, Computer, Account, CommandLine, NewProcessName
| extend Technique = "T1059.001 - PowerShell"
| extend TechniqueURL = "https://attack.mitre.org/techniques/T1059/001/"`,
  },
  M1001: {
    sigma: `title: App Store Abuse Detection
description: Detects potential app store abuse
author: MITRE ATT&CK Detection Platform
status: experimental
references:
  - https://attack.mitre.org/techniques/M1001/
logsource:
  product: android
  service: adb
detection:
  SELECTION:
    EventSource: 'package_installer'
    AppSource|contains: 
      - 'third_party_store'
      - 'side_loaded'
      - 'unknown_source'
  condition: SELECTION
falsepositives:
  - Developer testing
  - Alternative app stores used by organizations
level: medium`,
    yara: `rule M1001_App_Store_Abuse {
    meta:
        description = "Detects potential app store abuse"
        author = "MITRE ATT&CK Detection Platform"
        reference = "https://attack.mitre.org/techniques/M1001/"
        date = "2023-03-15"
        score = 50
    strings:
        $market1 = "market.android.com" ascii wide
        $market2 = "play.google.com" ascii wide
        $store1 = "alternative_store" ascii wide
        $store2 = "third_party_store" ascii wide
        $install = "pm install" ascii wide
    condition:
        any of ($market*) and any of ($store*) and $install
}`,
    kql: `// Detect potential app store abuse
// Author: MITRE ATT&CK Detection Platform
// Reference: https://attack.mitre.org/techniques/M1001/
MobileDeviceEvents
| where EventType == "AppInstallation" 
| where AppSource != "OfficialStore"
| where AppSource has_any ("ThirdPartyStore", "SideLoaded", "UnknownSource")
| project TimeGenerated, DeviceName, UserId, AppName, AppVersion, AppSource
| extend Technique = "M1001 - App Store Abuse"
| extend TechniqueURL = "https://attack.mitre.org/techniques/M1001/"`,
  },
  I1001: {
    sigma: `title: Engineering Workstation Compromise
description: Detects potential compromise of engineering workstations in ICS environments
author: MITRE ATT&CK Detection Platform
status: experimental
references:
  - https://attack.mitre.org/techniques/I1001/
logsource:
  product: ics
  service: security
detection:
  SELECTION:
    SystemType: 'engineering_workstation'
    AlertType: 
      - 'unauthorized_access'
      - 'suspicious_connection'
      - 'unauthorized_software'
  condition: SELECTION
falsepositives:
  - Authorized maintenance activities
  - Vendor support sessions
level: critical`,
    yara: `rule I1001_Engineering_Workstation_Compromise {
    meta:
        description = "Detects potential engineering workstation compromise"
        author = "MITRE ATT&CK Detection Platform"
        reference = "https://attack.mitre.org/techniques/I1001/"
        date = "2023-03-15"
        score = 80
    strings:
        $config1 = "engineering.config" ascii wide
        $config2 = "plc.program" ascii wide
        $config3 = "scada.config" ascii wide
        $config4 = ".pcwe" ascii wide
        $config5 = ".pcwx" ascii wide
        $executable = "executable_code" ascii wide
    condition:
        any of ($config*) and $executable
}`,
    kql: `// Detect potential engineering workstation compromise
// Author: MITRE ATT&CK Detection Platform
// Reference: https://attack.mitre.org/techniques/I1001/
SecurityEvent
| where SystemType == "engineering_workstation"
| where AlertType has_any ("unauthorized_access", "suspicious_connection", "unauthorized_software")
| where Severity >= 3
| project TimeGenerated, Workstation, User, AlertType, Severity
| extend Technique = "I1001 - Engineering Workstation Compromise"
| extend TechniqueURL = "https://attack.mitre.org/techniques/I1001/"`,
  },
};

interface DetectionViewerProps {
  technique: string | null;
  format: DetectionFormat;
}

const DetectionViewer: React.FC<DetectionViewerProps> = ({
  technique,
  format,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <p>
          No detection rules available for this technique in{' '}
          {format.toUpperCase()} format
        </p>
        <p className="mt-2 text-sm">
          Try selecting a different technique or detection format
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">
          Detection for {technique} in {format.toUpperCase()} format
        </span>
        <button
          onClick={() => copyToClipboard(detection)}
          className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 text-gray-600 text-sm"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{detection}</code>
      </pre>
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-medium mb-2">Usage Notes:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            This rule detects{' '}
            {technique.startsWith('T')
              ? 'technique'
              : technique.startsWith('M')
              ? 'mobile tactic'
              : 'ICS tactic'}{' '}
            {technique}
          </li>
          <li>
            Format:{' '}
            {format === 'sigma'
              ? 'Sigma rule for SIEM integration'
              : format === 'yara'
              ? 'YARA rule for file/memory scanning'
              : 'KQL query for Azure Sentinel'}
          </li>
          <li>
            Consider testing in a development environment before deploying to
            production
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DetectionViewer;
