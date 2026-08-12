import type { ReactNode } from "react";

interface MenuFrameProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly children: ReactNode;
}

export function MenuFrame({ eyebrow, title, children }: MenuFrameProps) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-[#03110d]/48 p-5 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-label={title}>
      <section className="w-full max-w-xl rounded-sm border border-[#d9b867]/65 bg-[#08251e]/95 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.56)] sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[#d9b867]">{eyebrow}</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-[#f7e9c2] sm:text-4xl">{title}</h2>
        {children}
      </section>
    </div>
  );
}

export interface SaveSlotView {
  readonly slot: number;
  readonly label: string;
  readonly updatedAt: Date;
}

interface TitleMenuProps {
  readonly signedIn: boolean;
  readonly online: boolean;
  readonly canInstall: boolean;
  readonly slots: readonly SaveSlotView[];
  readonly selectedSlot: number;
  readonly busy: boolean;
  readonly onSelectSlot: (slot: number) => void;
  readonly onBegin: () => void;
  readonly onSignIn: () => void;
  readonly onInstall: () => void;
  readonly onSettings: () => void;
  readonly onDeleteSlot: (slot: number) => void;
}

function formatSavedAt(value: Date): string {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(value);
}

export function TitleMenu({ signedIn, online, canInstall, slots, selectedSlot, busy, onSelectSlot, onBegin, onSignIn, onInstall, onSettings, onDeleteSlot }: TitleMenuProps) {
  const slotByNumber = new Map(slots.map((slot) => [slot.slot, slot]));
  return (
    <MenuFrame eyebrow="Aurastria · Founding Season" title="Spirits of the First Dawn">
      <p className="mt-3 max-w-lg text-sm leading-6 text-[#f0dfb6]/85">Begin at the Great River Spine, listen for the Tideglass, and return what the camp needs to steward the coming season.</p>
      {!online ? <div className="mt-5 rounded-sm border border-[#d9b867]/35 bg-[#061d17] px-4 py-3 text-sm leading-6 text-[#c8d7b6]">Offline journey mode. Your archive cannot be reached until this device reconnects.</div> : null}
      {signedIn ? (
        <div className="mt-6 grid gap-2" aria-label="Journey archive slots">
          {[1, 2, 3].map((slot) => {
            const saved = slotByNumber.get(slot);
            const selected = selectedSlot === slot;
            return (
              <div key={slot} className={`flex items-center gap-3 rounded-sm border px-3 py-3 ${selected ? "border-[#d9b867] bg-[#12382d]" : "border-[#d9b867]/30 bg-[#061d17]"}`}>
                <button type="button" className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onClick={() => onSelectSlot(slot)}>
                  <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-[#d9b867]">Archive {slot}</span>
                  <span className="mt-1 block truncate font-serif text-lg text-[#f7e9c2]">{saved?.label ?? "Unwritten journey"}</span>
                  <span className="mt-1 block text-xs text-[#c8d7b6]">{saved ? `Last tended ${formatSavedAt(saved.updatedAt)}` : "A new river record will be created here."}</span>
                </button>
                {saved ? <button type="button" className="rounded-sm border border-[#d9b867]/50 px-2 py-1 text-xs uppercase tracking-[0.12em] text-[#f0dfb6] transition hover:bg-[#d9b867]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onClick={() => onDeleteSlot(slot)}>Clear</button> : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-sm border border-[#d9b867]/35 bg-[#061d17] px-4 py-3 text-sm leading-6 text-[#c8d7b6]">You can explore a practice journey now. Sign in when you are ready to preserve it in the river archive.</div>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" autoFocus className="rounded-sm bg-[#d9b867] px-4 py-2.5 font-serif text-lg text-[#08251e] transition active:scale-[0.97] hover:bg-[#efd488] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2] disabled:cursor-wait disabled:opacity-70" onClick={onBegin} disabled={busy}>{busy ? "Opening archive…" : signedIn ? "Enter journey" : "Begin practice journey"}</button>
        {signedIn ? null : <button type="button" className="rounded-sm border border-[#d9b867]/60 px-4 py-2.5 text-sm uppercase tracking-[0.14em] text-[#f0dfb6] transition active:scale-[0.97] hover:bg-[#d9b867]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onClick={onSignIn}>Sign in to archive</button>}
        {canInstall ? <button type="button" className="rounded-sm border border-[#3dd4cc]/65 px-4 py-2.5 text-sm uppercase tracking-[0.14em] text-[#bceee5] transition active:scale-[0.97] hover:bg-[#3dd4cc]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onClick={onInstall}>Install app</button> : null}
        <button type="button" className="rounded-sm border border-[#d9b867]/40 px-4 py-2.5 text-sm uppercase tracking-[0.14em] text-[#f0dfb6] transition active:scale-[0.97] hover:bg-[#d9b867]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onClick={onSettings}>Settings</button>
      </div>
    </MenuFrame>
  );
}

interface PauseMenuProps {
  readonly signedIn: boolean;
  readonly online: boolean;
  readonly saving: boolean;
  readonly onResume: () => void;
  readonly onSave: () => void;
  readonly onSettings: () => void;
  readonly onTitle: () => void;
}

export function PauseMenu({ signedIn, online, saving, onResume, onSave, onSettings, onTitle }: PauseMenuProps) {
  return (
    <MenuFrame eyebrow="Journey paused" title="The river keeps its counsel.">
      <p className="mt-3 text-sm leading-6 text-[#f0dfb6]/85">Your place is held at the riverbank. Resume when you are ready to continue the shared founding task.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" autoFocus className="rounded-sm bg-[#d9b867] px-4 py-2.5 font-serif text-lg text-[#08251e] transition active:scale-[0.97] hover:bg-[#efd488] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onClick={onResume}>Resume</button>
        {signedIn ? <button type="button" className="rounded-sm border border-[#d9b867]/60 px-4 py-2.5 text-sm uppercase tracking-[0.14em] text-[#f0dfb6] transition active:scale-[0.97] hover:bg-[#d9b867]/10 disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onClick={onSave} disabled={saving || !online}>{saving ? "Archiving…" : online ? "Save journey" : "Archive offline"}</button> : null}
        <button type="button" className="rounded-sm border border-[#d9b867]/40 px-4 py-2.5 text-sm uppercase tracking-[0.14em] text-[#f0dfb6] transition active:scale-[0.97] hover:bg-[#d9b867]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onClick={onSettings}>Settings</button>
        <button type="button" className="rounded-sm border border-[#d9b867]/40 px-4 py-2.5 text-sm uppercase tracking-[0.14em] text-[#f0dfb6] transition active:scale-[0.97] hover:bg-[#d9b867]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onClick={onTitle}>Return to title</button>
      </div>
    </MenuFrame>
  );
}

interface SettingsMenuProps {
  readonly uiScale: number;
  readonly onUiScaleChange: (value: number) => void;
  readonly onClose: () => void;
}

export function SettingsMenu({ uiScale, onUiScaleChange, onClose }: SettingsMenuProps) {
  return (
    <MenuFrame eyebrow="Journey settings" title="Set your reading pace.">
      <label className="mt-6 block text-sm text-[#f0dfb6]" htmlFor="aurastria-ui-scale">Interface scale <span className="text-[#d9b867]">{uiScale}%</span></label>
      <input id="aurastria-ui-scale" className="mt-3 w-full accent-[#d9b867]" type="range" min="90" max="120" step="5" value={uiScale} onChange={(event) => onUiScaleChange(Number(event.target.value))} />
      <p className="mt-5 rounded-sm border border-[#d9b867]/25 bg-[#061d17] px-4 py-3 text-sm leading-6 text-[#c8d7b6]">Environmental motion follows your device’s reduced-motion preference. Keyboard and gamepad controls remain available throughout the journey.</p>
      <button type="button" autoFocus className="mt-6 rounded-sm bg-[#d9b867] px-4 py-2.5 font-serif text-lg text-[#08251e] transition active:scale-[0.97] hover:bg-[#efd488] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onClick={onClose}>Return</button>
    </MenuFrame>
  );
}
