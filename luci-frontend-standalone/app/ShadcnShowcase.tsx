import { useState } from "react";
import { toast } from "sonner";
import { CheckIcon, CopyIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button, DialogButton, DialogRedButton } from "~/components/ui/button";
import ChannelItem, { type Channel } from "~/components/ui/ChannelItem";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogCloseWhite,
  DialogCloseYellow,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  SettingsDropdownMenuContent,
  SubscriptionDropdownMenuContent,
  SurveyDropdownMenuContent,
  SurveyDropdownMenuRadioItem,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { IconAskLuci, IconCollapse, IconMemories, IconSettings } from "~/components/ui/icons";
import { LogoIcon, LuciWordmark } from "~/components/ui/Logo";
import MenuBarTab from "~/components/ui/MenuBarTab";
import LuciModal from "~/components/ui/Modal";
import RegularButton from "~/components/ui/RegularButton";
import RegularIconButton from "~/components/ui/RegularIconButton";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { Toaster } from "~/components/ui/sonner";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import Title from "~/components/ui/Title";

function ShowcaseSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-[var(--luci-border)] bg-[var(--luci-surface-tile)] p-5 shadow-[var(--luci-floating-shadow)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--text-0)]">{title}</h2>
        {description && <p className="mt-1 text-sm leading-5 text-[var(--text-3)]">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[var(--luci-border)] bg-[var(--luci-surface-bg)] p-2">
      <span className={`h-7 w-7 rounded-lg ${className}`} />
      <span className="text-xs text-[var(--text-1)]">{label}</span>
    </div>
  );
}

function ComponentTray({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[var(--luci-border)] bg-[var(--luci-surface-bg)] p-4">
      {children}
    </div>
  );
}

export function ShadcnShowcase() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [luciModalOpen, setLuciModalOpen] = useState(false);
  const [tab, setTab] = useState("preview");
  const [lineTab, setLineTab] = useState("one");
  const [pillTab, setPillTab] = useState("account");
  const [activeMenuTab, setActiveMenuTab] = useState<"ask" | "memories" | "settings">("ask");
  const [radioValue, setRadioValue] = useState("daily");
  const [surveyValue, setSurveyValue] = useState("11-50");
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);

  const buttonVariants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const;
  const buttonSizes = ["xs", "sm", "default", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"] as const;
  const sampleChannel: Channel = {
    id: 1,
    name: "Sales Pipeline",
    desc: "Follow-ups, CRM notes, and meeting context",
    time: "2:18 PM",
  };

  return (
    <div className="h-full bg-[var(--luci-surface-bg)] text-[var(--text-0)]">
      <Toaster position="top-center" richColors />
      <LuciModal
        title="Delete recording?"
        open={luciModalOpen}
        confirmLabel="Delete"
        confirmDanger
        onCancel={() => setLuciModalOpen(false)}
        onConfirm={() => {
          setLuciModalOpen(false);
          toast.success("Legacy modal confirmed");
        }}
      >
        <p className="modal-desc">
          This is the classic LUCI modal component rendered inside the shadcn showcase.
        </p>
      </LuciModal>
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-6xl space-y-5 px-8 py-8">
          <header className="rounded-[28px] border border-[var(--luci-border)] bg-[var(--luci-surface-tile)] p-6 shadow-[var(--luci-floating-shadow)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luci-accent)]">Design system</p>
            <h1 className="mt-2 text-[32px] font-extrabold leading-10 tracking-[-0.05em]">Shadcn components</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--luci-text-tertiary)]">
              当前 standalone 项目里所有 shadcn / Base UI wrapper 组件和变体预览。这里不接 API，只用于设计调样式。
            </p>
          </header>

          <ShowcaseSection title="LUCI app components" description="从 app/components/ui 读取的新增 LUCI 组件：Logo、Sidebar tab、Channel item、Title、Regular buttons、legacy Modal 和自定义图标。">
            <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
              <ComponentTray>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <LogoIcon />
                    <LuciWordmark />
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-[var(--luci-warm-surface)] px-3 py-1 text-xs font-semibold text-[var(--luci-link)]">
                    <CheckIcon size={13} />
                    Brand lockup
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[210px_1fr]">
                  <div className="rounded-[18px] border border-[var(--luci-border)] bg-[var(--luci-surface-tile)] p-3">
                    <div className="mb-3 flex items-center justify-between px-2 text-xs font-semibold text-[var(--luci-text-muted)]">
                      Navigation
                      <RegularIconButton icon={<IconCollapse size={16} />} />
                    </div>
                    <div className="space-y-1">
                      <MenuBarTab
                        icon={<IconAskLuci size={20} active={activeMenuTab === "ask"} />}
                        label="Ask LUCI"
                        active={activeMenuTab === "ask"}
                        onClick={() => setActiveMenuTab("ask")}
                      />
                      <MenuBarTab
                        icon={<IconMemories size={20} active={activeMenuTab === "memories"} />}
                        label="Memories"
                        active={activeMenuTab === "memories"}
                        onClick={() => setActiveMenuTab("memories")}
                      />
                      <MenuBarTab
                        icon={<IconSettings size={20} active={activeMenuTab === "settings"} />}
                        label="Settings"
                        active={activeMenuTab === "settings"}
                        onClick={() => setActiveMenuTab("settings")}
                      />
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-[var(--luci-border)] bg-[var(--luci-surface-tile)] p-4">
                    <Title
                      rightBtn={
                        <RegularIconButton
                          icon={<PlusIcon size={15} />}
                          variant="outlined"
                          onClick={() => toast.info("Create channel")}
                        />
                      }
                    >
                      Sessions
                    </Title>
                    <ChannelItem
                      channel={sampleChannel}
                      onClick={(channel) => toast.info(`Open ${channel.name}`)}
                      onRename={(channel) => toast.info(`Rename ${channel.name}`)}
                      onDelete={() => setLuciModalOpen(true)}
                    />
                  </div>
                </div>
              </ComponentTray>

              <ComponentTray>
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--luci-accent)]">Legacy controls</p>
                  <h3 className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-[var(--text-0)]">Classic LUCI controls beside shadcn</h3>
                  <p className="mt-1 text-sm leading-5 text-[var(--luci-text-tertiary)]">
                    These are the compact app-shell controls copied into the same preview page for quick visual regression checks.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-xs font-semibold text-[var(--luci-text-muted)]">RegularButton</p>
                    <div className="flex flex-wrap gap-3">
                      <RegularButton onClick={() => toast.info("Default button")}>Restart</RegularButton>
                      <RegularButton variant="primary" onClick={() => toast.success("Primary action")}>Upgrade</RegularButton>
                      <RegularButton onClick={() => setLuciModalOpen(true)}>Open modal</RegularButton>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold text-[var(--luci-text-muted)]">RegularIconButton</p>
                    <div className="flex flex-wrap gap-3">
                      <RegularIconButton icon={<PlusIcon size={15} />} onClick={() => toast.info("Add")} />
                      <RegularIconButton icon={<PencilIcon size={15} />} variant="outlined" onClick={() => toast.info("Edit")} />
                      <RegularIconButton icon={<Trash2Icon size={15} />} variant="outlined" onClick={() => setLuciModalOpen(true)} />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold text-[var(--luci-text-muted)]">Custom icons</p>
                    <div className="grid grid-cols-4 gap-2 text-[var(--luci-text-tertiary)] sm:grid-cols-8">
                      {[
                        <IconAskLuci size={20} />,
                        <IconAskLuci size={20} active />,
                        <IconMemories size={20} />,
                        <IconMemories size={20} active />,
                        <IconSettings size={20} />,
                        <IconSettings size={20} active />,
                        <IconCollapse size={20} />,
                      ].map((icon, index) => (
                        <div key={index} className="grid h-12 place-items-center rounded-xl border border-[var(--luci-border)] bg-[var(--luci-surface-tile)]">
                          {icon}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ComponentTray>
            </div>
          </ShowcaseSection>

          <ShowcaseSection title="Button" description="variant、size、Dialog 专用按钮都在这里。">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3">
                {buttonVariants.map((variant) => (
                  <Button key={variant} variant={variant}>{variant}</Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {buttonSizes.map((size) => (
                  <Button key={size} size={size}>{size.startsWith("icon") ? <PlusIcon /> : size}</Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <DialogButton>Dialog</DialogButton>
                <DialogRedButton>Delete</DialogRedButton>
                <Button disabled>Disabled</Button>
                <Button variant="outline"><CopyIcon /> With icon</Button>
              </div>
            </div>
          </ShowcaseSection>

          <ShowcaseSection title="Form controls" description="Input、Textarea、Checkbox、Switch。">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Input placeholder="Regular input" />
                <Input aria-invalid placeholder="Invalid input" />
                <Textarea placeholder="Textarea content..." />
              </div>
              <div className="space-y-4 rounded-2xl bg-[var(--luci-surface-bg)] p-4">
                <label className="flex items-center gap-3 text-sm"><Checkbox checked={checked} onCheckedChange={(value) => setChecked(value === true)} /> Checkbox checked</label>
                <label className="flex items-center gap-3 text-sm"><Checkbox /> Checkbox empty</label>
                <label className="flex items-center gap-3 text-sm"><Checkbox disabled /> Checkbox disabled</label>
                <div className="flex items-center gap-4"><Switch checked={switchOn} onCheckedChange={setSwitchOn} /> <span className="text-sm">Switch default</span></div>
                <div className="flex items-center gap-4"><Switch size="sm" /> <span className="text-sm">Switch sm</span></div>
              </div>
            </div>
          </ShowcaseSection>

          <ShowcaseSection title="Tabs" description="default、line、pill 三种 TabsList variant。">
            <div className="grid gap-5 lg:grid-cols-3">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList><TabsTrigger value="preview">Preview</TabsTrigger><TabsTrigger value="code">Code</TabsTrigger></TabsList>
                <TabsContent value="preview" className="rounded-xl bg-[var(--luci-surface-bg)] p-4">Default preview</TabsContent>
                <TabsContent value="code" className="rounded-xl bg-[var(--luci-surface-bg)] p-4">Default code</TabsContent>
              </Tabs>
              <Tabs value={lineTab} onValueChange={setLineTab}>
                <TabsList variant="line"><TabsTrigger value="one">Line one</TabsTrigger><TabsTrigger value="two">Line two</TabsTrigger></TabsList>
                <TabsContent value="one" className="rounded-xl bg-[var(--luci-surface-bg)] p-4">Line content one</TabsContent>
                <TabsContent value="two" className="rounded-xl bg-[var(--luci-surface-bg)] p-4">Line content two</TabsContent>
              </Tabs>
              <Tabs value={pillTab} onValueChange={setPillTab}>
                <TabsList variant="pill"><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="recording">Recording</TabsTrigger></TabsList>
                <TabsContent value="account" className="rounded-xl bg-[var(--luci-surface-bg)] p-4">Pill account</TabsContent>
                <TabsContent value="recording" className="rounded-xl bg-[var(--luci-surface-bg)] p-4">Pill recording</TabsContent>
              </Tabs>
            </div>
          </ShowcaseSection>

          <ShowcaseSection title="Dialog" description="DialogContent、Header、Footer、Close variants。">
            <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upgrade your plan?</DialogTitle>
                  <DialogDescription>This dialog previews the current LUCI modal styling in isolation.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogCloseWhite>Cancel</DialogCloseWhite>
                  <DialogCloseYellow>Upgrade</DialogCloseYellow>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="mt-4 flex flex-wrap gap-3">
              <DialogButton onClick={() => setDialogOpen(true)}>Dialog button style</DialogButton>
              <DialogRedButton>Dialog red style</DialogRedButton>
            </div>
          </ShowcaseSection>

          <ShowcaseSection title="Dropdown menu" description="Default、Settings、Subscription、Survey 内容样式和 item variants。">
            <div className="flex flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline">Default <MoreHorizontalIcon /></Button>} />
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem><CopyIcon /> Copy <DropdownMenuShortcut>⌘C</DropdownMenuShortcut></DropdownMenuItem>
                    <DropdownMenuCheckboxItem checked>Show sidebar</DropdownMenuCheckboxItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent><DropdownMenuItem>Sub action</DropdownMenuItem></DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive"><Trash2Icon /> Delete</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline">Radio menu</Button>} />
                <DropdownMenuContent className="w-52">
                  <DropdownMenuRadioGroup value={radioValue} onValueChange={setRadioValue}>
                    <DropdownMenuRadioItem value="daily">Daily</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="weekly">Weekly</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="monthly">Monthly</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline">Settings content</Button>} />
                <SettingsDropdownMenuContent><DropdownMenuItem>Backup today</DropdownMenuItem><DropdownMenuItem>Backup yesterday</DropdownMenuItem></SettingsDropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline">Subscription content</Button>} />
                <SubscriptionDropdownMenuContent><DropdownMenuItem>Starter</DropdownMenuItem><DropdownMenuItem>Pro</DropdownMenuItem></SubscriptionDropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline">Survey content</Button>} />
                <SurveyDropdownMenuContent>
                  <DropdownMenuRadioGroup value={surveyValue} onValueChange={setSurveyValue}>
                    <SurveyDropdownMenuRadioItem value="1-10">1-10</SurveyDropdownMenuRadioItem>
                    <SurveyDropdownMenuRadioItem value="11-50">11-50</SurveyDropdownMenuRadioItem>
                    <SurveyDropdownMenuRadioItem value="51+">51+</SurveyDropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </SurveyDropdownMenuContent>
              </DropdownMenu>
            </div>
          </ShowcaseSection>

          <ShowcaseSection title="Feedback" description="Sonner toast variants and Skeleton。">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => toast.success("Success toast")}>Success</Button>
              <Button variant="outline" onClick={() => toast.info("Info toast")}>Info</Button>
              <Button variant="secondary" onClick={() => toast.warning("Warning toast")}>Warning</Button>
              <Button variant="destructive" onClick={() => toast.error("Error toast")}>Error</Button>
              <Button variant="ghost" onClick={() => toast.loading("Loading toast")}>Loading</Button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </ShowcaseSection>

          <ShowcaseSection title="ScrollArea & tokens" description="自定义滚动条和当前 theme tokens。">
            <div className="grid gap-5 md:grid-cols-[1fr_260px]">
              <ScrollArea className="h-48 rounded-2xl border border-[var(--luci-border)] bg-[var(--luci-surface-bg)] p-4" orientation="both">
                <div className="w-[900px] space-y-3 pr-6">
                  {Array.from({ length: 10 }).map((_, index) => <p key={index} className="text-sm text-[var(--text-1)]">Scrollable row {index + 1}: LUCI component preview content with enough width to show horizontal scrollbar.</p>)}
                </div>
              </ScrollArea>
              <div className="grid gap-2">
                <Swatch label="accent" className="bg-[var(--luci-accent)]" />
                <Swatch label="surface" className="bg-[var(--luci-surface-bg)]" />
                <Swatch label="muted" className="bg-[var(--luci-surface-muted)]" />
                <Swatch label="border" className="bg-[var(--luci-border)]" />
              </div>
            </div>
          </ShowcaseSection>
        </div>
      </ScrollArea>
    </div>
  );
}
