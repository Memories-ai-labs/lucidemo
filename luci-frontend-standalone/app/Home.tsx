import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { ScrollArea } from "~/components/ui/scroll-area";
import tasksIcon from "./v2/assets/figma/home/stat-tasks.svg";
import hoursSavedIcon from "./v2/assets/figma/home/stat-hours-saved.svg";
import statsDivider from "./v2/assets/figma/home/stat-divider.svg";
import channelAddIcon from "./v2/assets/figma/home/channel-add.svg";
import channelsEmptyIcon from "./v2/assets/figma/home/channels-empty.svg";
import ChannelTagIcon from "./v2/assets/figma/home/channel-tag.svg?react";
import chatSendIcon from "./v2/assets/figma/home/chat-send.svg";
import actionCopyIcon from "./v2/assets/figma/home/action-copy.svg";
import actionLikeIcon from "./v2/assets/figma/home/action-like.svg";
import actionDislikeIcon from "./v2/assets/figma/home/action-dislike.svg";

const channels = [
  {
    id: "main",
    name: "Agent Assistant",
    preview: "Plan the day and summarize work",
    time: "Now",
    fixed: true,
  },
  {
    id: "meeting",
    name: "Before meeting brief",
    preview: "Gather context for standup",
    time: "9:40",
  },
  {
    id: "followup",
    name: "Follow-up drafts",
    preview: "Write concise next steps",
    time: "Yesterday",
  },
];

const messages = [
  { sender: "self", text: "Summarize what I should focus on today." },
  {
    sender: "assistant",
    text: "Here are the highest-leverage items:\n\n- Close the design handoff loop for the standalone frontend.\n- Review the memory detail empty states.\n- Keep the recording settings copy short and direct.\n\nI can turn any of these into a checklist.",
  },
  { sender: "self", text: "Make it more actionable." },
  {
    sender: "assistant",
    text: "Start with the frontend package. If the designer can run it with one command, every visual iteration gets cheaper.",
  },
];

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-[150px] items-center gap-3 rounded-2xl border border-[var(--luci-border)] bg-[var(--luci-surface-tile)] px-4 py-3 shadow-[var(--luci-floating-shadow)]">
      <img src={icon} alt="" className="h-8 w-8" draggable={false} />
      <div>
        <div className="text-xl font-semibold leading-6 text-[var(--text-0)]">
          {value}
        </div>
        <div className="text-xs leading-4 text-[var(--text-3)]">{label}</div>
      </div>
    </div>
  );
}

export function HomeMock() {
  const [activeChannel, setActiveChannel] = useState("main");
  const [input, setInput] = useState("");
  const active = useMemo(
    () => channels.find((item) => item.id === activeChannel) ?? channels[0],
    [activeChannel],
  );

  return (
    <div className="flex h-full min-h-0 bg-[var(--page-surface-bg,var(--luci-surface-bg))] text-[var(--text-0)]">
      <aside className="hidden h-full w-[280px] shrink-0 flex-col border-r border-[var(--luci-border)] bg-[var(--luci-surface-muted)]/60 md:flex">
        <div className="flex h-[68px] items-center justify-between px-5">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em]">Home</h2>
            <p className="text-xs text-[var(--text-3)]">Chat channels</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--luci-accent)] text-black shadow-[var(--luci-floating-shadow)]">
            <img src={channelAddIcon} alt="" className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-3">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-[var(--luci-border)] bg-[var(--luci-surface-bg)] px-3 text-[var(--text-3)]">
            <SearchIcon className="h-4 w-4" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-0)] outline-none placeholder:text-[var(--text-3)]"
              placeholder="Search channels"
            />
          </label>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-3">
          <div className="flex flex-col gap-1 pb-4">
            {channels.map((channel) => {
              const selected = channel.id === activeChannel;
              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`flex w-full items-center justify-between rounded-xl p-[18px] text-left transition-colors ${
                    selected
                      ? "bg-[var(--luci-surface-bg)] shadow-[var(--luci-floating-shadow)]"
                      : "hover:bg-[var(--luci-surface-hover)]"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-[var(--luci-border-strong)] bg-[var(--grey-0)]">
                      <ChannelTagIcon
                        className={`h-[17px] w-[17px] ${selected ? "text-[var(--luci-accent)]" : "text-[var(--text-1)]"}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium leading-5 text-[var(--text-1)]">
                        {channel.name}
                      </p>
                      <p className="truncate text-[11px] leading-4 text-[var(--luci-text-tertiary)]">
                        {channel.preview}
                      </p>
                    </div>
                  </div>
                  <span className="ml-3 shrink-0 text-[11px] leading-4 text-[var(--luci-text-tertiary)]">
                    {channel.time}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="m-4 rounded-2xl border border-dashed border-[var(--luci-border-strong)] p-4 text-center">
          <img
            src={channelsEmptyIcon}
            alt=""
            className="mx-auto h-10 w-10 opacity-70"
          />
          <p className="mt-2 text-xs text-[var(--text-3)]">
            Empty states are copied over too.
          </p>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-[68px] items-center justify-between border-b border-[var(--luci-border)] px-5 md:px-7">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-[-0.03em] md:text-2xl">
                {active.name}
              </h1>
              {active.fixed && (
                <span className="rounded-full bg-[var(--luci-warm-tag)] px-2 py-0.5 text-[10px] font-semibold text-[var(--luci-link)]">
                  Fixed
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--text-3)]">
              Standalone mock data. Edit freely without backend.
            </p>
          </div>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5 px-5 py-8 md:px-8">
            <div className="rounded-[28px] border border-[var(--luci-border)] bg-[var(--luci-warm-surface)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-0)]">
                    Design handoff mode
                  </p>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--luci-text-tertiary)]">
                    This page keeps the current LUCI sidebar, home colors,
                    shadcn setup, fonts, and assets, but removes Tauri/Rust
                    dependencies.
                  </p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--luci-accent)]" />
              </div>
            </div>

            {messages.map((message, index) => {
              const isSelf = message.sender === "self";
              return (
                <div
                  key={index}
                  className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-[var(--luci-floating-shadow)] ${
                      isSelf
                        ? "bg-[var(--luci-accent)] text-black"
                        : "border border-[var(--luci-border)] bg-[var(--luci-surface-tile)] text-[var(--text-0)]"
                    }`}
                  >
                    {isSelf ? (
                      <p>{message.text}</p>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    )}
                    {!isSelf && (
                      <div className="mt-3 flex items-center gap-2 opacity-70">
                        <img
                          src={actionCopyIcon}
                          alt="copy"
                          className="h-4 w-4"
                        />
                        <img
                          src={actionLikeIcon}
                          alt="like"
                          className="h-4 w-4"
                        />
                        <img
                          src={actionDislikeIcon}
                          alt="dislike"
                          className="h-4 w-4"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="border-t border-[var(--luci-border)] bg-[var(--luci-surface-bg)] px-5 py-4 md:px-7">
          <div className="mx-auto flex max-w-[880px] items-end gap-3 rounded-[24px] border border-[var(--luci-border-strong)] bg-[var(--luci-surface-tile)] p-3 shadow-[var(--luci-floating-shadow)]">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-2xl"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask LUCI anything..."
              className="max-h-32 min-h-10 flex-1 resize-none border-0 bg-transparent px-0 py-2 shadow-none focus-visible:ring-0"
            />
            <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--luci-accent)] text-black transition-transform hover:scale-105 active:scale-95">
              {input.trim() ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                <img src={chatSendIcon} alt="send" className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="mx-auto mt-2 flex max-w-[880px] items-center justify-center gap-1 text-[10px] text-[var(--text-3)]">
            <ArrowDownIcon className="h-3 w-3" /> Scroll mock content, resize
            sidebar, toggle theme.
          </div>
        </div>
      </section>
    </div>
  );
}
