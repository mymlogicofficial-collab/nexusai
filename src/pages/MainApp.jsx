import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import ChatPanel from "../components/panels/ChatPanel";
import SandboxPanel from "../components/panels/SandboxPanel";
import TerminalPanel from "../components/panels/TerminalPanel";
import GeneratePanel from "../components/panels/GeneratePanel";
import FilesPanel from "../components/panels/FilesPanel";
import MemoryPanel from "../components/panels/MemoryPanel";
import IdentityPanel from "../components/panels/IdentityPanel";
import AppEditorPanel from "../components/panels/AppEditorPanel";

const PANELS = {
  chat: ChatPanel,
  sandbox: SandboxPanel,
  terminal: TerminalPanel,
  generate: GeneratePanel,
  files: FilesPanel,
  memory: MemoryPanel,
  identity: IdentityPanel,
  editor: AppEditorPanel,
};

export default function MainApp() {
  const [activePanel, setActivePanel] = useState("chat");
  const Panel = PANELS[activePanel] || ChatPanel;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#050508" }}>
      <Sidebar active={activePanel} onSelect={setActivePanel} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar panel={activePanel} />
        <div className="flex-1 overflow-hidden">
          <Panel />
        </div>
      </div>
    </div>
  );
}