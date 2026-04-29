import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Loader2Icon } from "lucide-react";
import successIcon from "../../v2/assets/figma/success.svg";
import infoIcon from "../../v2/assets/figma/info.svg";
import warningIcon from "../../v2/assets/figma/warning.svg";
import errorIcon from "../../v2/assets/figma/error.svg";

const SuccessIcon = () => <img src={successIcon} alt="" className="size-5 select-none" />;
const InfoIcon = () => <img src={infoIcon} alt="" className="size-5 select-none" />;
const WarningIcon = () => <img src={warningIcon} alt="" className="size-5 select-none" />;
const ErrorIcon = () => <img src={errorIcon} alt="" className="size-5 select-none" />;
const LoadingIcon = () => (
  <Loader2Icon className="size-5 animate-spin text-[var(--text-0)]" />
);

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <SuccessIcon />,
        info: <InfoIcon />,
        warning: <WarningIcon />,
        error: <ErrorIcon />,
        loading: <LoadingIcon />,
      }}
      style={
        {
          "--normal-bg": "var(--bg-0)",
          "--normal-text": "var(--text-0)",
          "--normal-border": "transparent",
          "--border-radius": "1000px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "!bg-[var(--bg-0)] !text-[var(--text-0)] !border-0 !rounded-full  !px-5 !py-[8px] !gap-2 !items-center !text-[14px] !leading-[20px] ",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
