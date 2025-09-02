import type Mithril from "mithril";
import type DepositPlatform from "../models/DepositPlatform";
import type WithdrawalPlatform from "../models/WithdrawalPlatform";

declare const m: Mithril.Static;

/**
 * Simple icon representation interface
 */
export interface IconRepresentation {
  type: "url" | "class" | "fallback";
  value: string;
  alt?: string;
}

/**
 * Helper function to get the platform icon
 */
export function getBestPlatformIcon(
  platform: DepositPlatform | WithdrawalPlatform
): IconRepresentation {
  const platformIconUrl = platform.platformIconUrl();
  if (platformIconUrl) {
    return {
      type: "url",
      value: platformIconUrl,
      alt: platform.name() || "Platform icon",
    };
  } else {
    console.log("No platform icon URL found");
  }

  const platformIconClass = platform.platformIconClass();
  if (platformIconClass) {
    return {
      type: "class",
      value: platformIconClass,
    };
  } else {
    console.log("No platform icon class found");
  }

  // Fallback
  return {
    type: "fallback",
    value: "fas fa-coins",
  };
}

/**
 * Render an icon representation as a Mithril element
 */
export function renderIcon(
  iconRep: IconRepresentation,
  additionalClasses: string = ""
): Mithril.Children {
  const baseClasses = "icon";
  const classes = additionalClasses
    ? `${baseClasses} ${additionalClasses}`
    : baseClasses;

  switch (iconRep.type) {
    case "url":
      return m("img", {
        src: iconRep.value,
        alt: iconRep.alt || "Icon",
        className: `${classes} icon--image`,
        style: {
          width: "1em",
          height: "1em",
          objectFit: "contain",
          display: "inline-block",
          verticalAlign: "middle",
        },
      });

    case "class":
      return m("i", {
        className: `${classes} ${iconRep.value}`,
        "aria-hidden": "true",
      });

    case "fallback":
    default:
      return m("i", {
        className: `${classes} ${iconRep.value}`,
        "aria-hidden": "true",
      });
  }
}
