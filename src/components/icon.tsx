"use client";

import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";

type Props = FontAwesomeIconProps;

export default function Icon(props: Props) {
  return <FontAwesomeIcon {...props} />;
}
