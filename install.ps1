& {
    $ErrorActionPreference = 'Stop'
    $previousTls = [Net.ServicePointManager]::SecurityProtocol
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-RestMethod 'https://raw.githubusercontent.com/Pumkin4534/arc-mcp/main/install.ps1' | Invoke-Expression
    } finally { [Net.ServicePointManager]::SecurityProtocol = $previousTls }
}
