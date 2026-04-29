import type { CSSProperties } from "react";
import chatIcon from "../assets/figma/chat.svg";
import memoriesActiveIcon from "../assets/figma/home/nav-memories-active.svg";
import memoriesIcon from "../assets/figma/home/nav-memories.svg";
import settingsActiveIcon from "../assets/figma/home/nav-settings-active.svg";
import settingsIcon from "../assets/figma/home/nav-settings.svg";

export type PrimaryNavigationItemId = "ask-luci" | "memories" | "settings" | "shadcn" | "css-vars";

interface NavigationRailIconConfig {
  activeIcon: string;
  inactiveIcon: string;
  activeInsetClassName?: string;
  inactiveInsetClassName: string;
}

export interface PrimaryNavigationItem {
  active: boolean;
  activeIcon: string;
  activeInsetClassName?: string;
  id: PrimaryNavigationItemId;
  inactiveIcon: string;
  inactiveInsetClassName: string;
  label: string;
}

interface NavigationRailButtonProps {
  activeContainerClassName: string;
  buttonClassName?: string;
  inactiveContainerClassName: string;
  item: PrimaryNavigationItem;
  labelClassName: string;
  labelStyle?: CSSProperties;
  monoIconClassName?: string;
  onClick?: () => void;
}

const PRIMARY_NAVIGATION_LABELS: Record<PrimaryNavigationItemId, string> = {
  "ask-luci": "Ask LUCI",
  memories: "Memories",
  settings: "Settings",
  shadcn: "Shadcn",
  "css-vars": "CSS Vars",
};

const PRIMARY_NAVIGATION_ICONS: Record<PrimaryNavigationItemId, NavigationRailIconConfig> = {
  "ask-luci": {
    activeIcon: chatIcon,
    activeInsetClassName: "inset-0",
    inactiveIcon: chatIcon,
    inactiveInsetClassName: "inset-0",
  },
  memories: {
    activeIcon: memoriesActiveIcon,
    activeInsetClassName: "inset-[10.42%_10.42%_10.98%_10.92%]",
    inactiveIcon: memoriesIcon,
    inactiveInsetClassName: "inset-[10.42%_10.42%_11%_10.92%]",
  },
  settings: {
    activeIcon: settingsActiveIcon,
    inactiveIcon: settingsIcon,
    inactiveInsetClassName: "inset-[10.42%_12.51%]",
  },
  shadcn: {
    activeIcon: chatIcon,
    activeInsetClassName: "inset-0",
    inactiveIcon: chatIcon,
    inactiveInsetClassName: "inset-0",
  },
  "css-vars": {
    activeIcon: settingsActiveIcon,
    inactiveIcon: settingsIcon,
    inactiveInsetClassName: "inset-[10.42%_12.51%]",
  },
};

export function createPrimaryNavigationItems(
  activeId: PrimaryNavigationItemId | null,
): PrimaryNavigationItem[] {
  return (Object.keys(PRIMARY_NAVIGATION_LABELS) as PrimaryNavigationItemId[]).map((id) => ({
    active: id === activeId,
    id,
    label: PRIMARY_NAVIGATION_LABELS[id],
    ...PRIMARY_NAVIGATION_ICONS[id],
  }));
}

function NavigationRailIcon({
  item,
  monoIconClassName = "luci-mono-icon",
}: Pick<NavigationRailButtonProps, "item" | "monoIconClassName">) {
  const src = item.active ? item.activeIcon : item.inactiveIcon;
  const insetClassName = item.active
    ? item.activeInsetClassName ?? item.inactiveInsetClassName
    : item.inactiveInsetClassName;
  const iconClassName = item.active
    ? "block h-full w-full max-w-none select-none"
    : `block h-full w-full max-w-none select-none ${monoIconClassName}`;

  return (
    <div className="relative h-[24px] w-[24px] overflow-hidden">
      <div className={`absolute ${insetClassName}`}>
        <img src={src} alt="" className={iconClassName} draggable={false} />
      </div>
    </div>
  );
}

export function NavigationRailButton({
  activeContainerClassName,
  buttonClassName = "flex w-full flex-col items-center justify-center gap-1 py-[6px]",
  inactiveContainerClassName,
  item,
  labelClassName,
  labelStyle,
  monoIconClassName,
  onClick,
}: NavigationRailButtonProps) {
  return (
    <button type="button" onClick={onClick} className={buttonClassName}>
      <div
        className={`flex flex-col items-center justify-center overflow-hidden rounded-[28px] ${
          item.active ? activeContainerClassName : inactiveContainerClassName
        }`}
      >
        <div className="flex h-[56px] w-[56px] items-center justify-center">
          <NavigationRailIcon item={item} monoIconClassName={monoIconClassName} />
        </div>
      </div>
      <p className={labelClassName} style={labelStyle}>
        {item.label}
      </p>
    </button>
  );
}
