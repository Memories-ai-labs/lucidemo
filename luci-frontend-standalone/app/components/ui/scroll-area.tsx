import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn } from "~/lib/utils";

type Orientation = "vertical" | "horizontal" | "both";

interface ScrollAreaProps
  extends Omit<ScrollAreaPrimitive.Root.Props, "render" | "style"> {
  /** Extra classes on the Viewport element (the actually-scrolling `<div>`). */
  viewportClassName?: string;
  /**
   * `"vertical"` (default) only renders the vertical scrollbar,
   * `"horizontal"` only renders the horizontal one,
   * `"both"` renders both plus the corner.
   */
  orientation?: Orientation;
  /**
   * Inline styles applied to the Root element. Narrowed to `React.CSSProperties`
   * (Base UI also supports a function form, but we never use it and the function
   * form causes a type collision when the project has two `csstype` versions
   * installed alongside each other).
   */
  style?: React.CSSProperties;
}

/**
 * Thin wrapper around Base UI's ScrollArea primitive styled to match the
 * macOS overlay scrollbar:
 *
 *   - hidden native scrollbar, custom thumb drawn on top of content
 *   - fades in while the user is scrolling or hovering the area
 *   - thumb widens slightly on hover
 *   - thumb color is driven by `--luci-scrollbar-idle` / `--luci-scrollbar-active`
 *     so light/dark theming just works
 *
 * Forwards `ref` to the Viewport (the element that actually scrolls), so
 * existing consumers that used `CustomScrollArea ref={scrollParentRef}` for
 * `@tanstack/react-virtual`'s `getScrollElement` keep working unchanged.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea(
    {
      children,
      className,
      viewportClassName,
      orientation = "vertical",
      style,
      ...rootProps
    },
    forwardedRef,
  ) {
    const showVertical = orientation === "vertical" || orientation === "both";
    const showHorizontal =
      orientation === "horizontal" || orientation === "both";

    return (
      <ScrollAreaPrimitive.Root
        {...rootProps}
        // Cast via `unknown` to bridge across the dual `csstype` versions
        // pnpm ends up hoisting; see the `style` prop doc in `ScrollAreaProps`.
        style={style as unknown as ScrollAreaPrimitive.Root.Props["style"]}
        className={cn("relative overflow-hidden", className)}
      >
        <ScrollAreaPrimitive.Viewport
          className={cn("h-full w-full overscroll-contain", viewportClassName)}
          // Base UI's Viewport forwards the ref passed on `render` to the
          // underlying <div>, which is exactly the scroll container we want
          // to expose to consumers.
          render={<div ref={forwardedRef} />}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>

        {showVertical ? (
          <ScrollAreaPrimitive.Scrollbar
            orientation="vertical"
            className="pointer-events-none flex w-[10px] touch-none select-none justify-center p-[2px] opacity-0 transition-opacity duration-200 ease-out data-[hovering]:pointer-events-auto data-[hovering]:opacity-100 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-0"
          >
            <ScrollAreaPrimitive.Thumb className="w-[6px] flex-1 rounded-full bg-[var(--luci-scrollbar-idle)] transition-[width,background-color] duration-150 ease-out hover:w-[8px] hover:bg-[var(--luci-scrollbar-active)]" />
          </ScrollAreaPrimitive.Scrollbar>
        ) : null}

        {showHorizontal ? (
          <ScrollAreaPrimitive.Scrollbar
            orientation="horizontal"
            className="pointer-events-none flex h-[10px] touch-none select-none items-center p-[2px] opacity-0 transition-opacity duration-200 ease-out data-[hovering]:pointer-events-auto data-[hovering]:opacity-100 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-0"
          >
            <ScrollAreaPrimitive.Thumb className="h-[6px] flex-1 rounded-full bg-[var(--luci-scrollbar-idle)] transition-[height,background-color] duration-150 ease-out hover:h-[8px] hover:bg-[var(--luci-scrollbar-active)]" />
          </ScrollAreaPrimitive.Scrollbar>
        ) : null}

        {orientation === "both" ? <ScrollAreaPrimitive.Corner /> : null}
      </ScrollAreaPrimitive.Root>
    );
  },
);
