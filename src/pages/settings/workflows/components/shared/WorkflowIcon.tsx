import { ComponentType } from 'react';
import {
  MdMail,
  MdDescription,
  MdPerson,
  MdEditNote,
  MdTask,
  MdCreditCard,
  MdNotifications,
  MdWebhook,
  MdArchive,
  MdHourglassTop,
  MdSchedule,
  MdAltRoute,
  MdFlag,
  MdSell,
  MdPayments,
  MdGroupAdd,
  MdWarning,
  MdBolt,
  MdWidgets,
  MdDragIndicator,
  MdInfo,
  MdClose,
  MdReceiptLong,
  MdTripOrigin,
} from 'react-icons/md';

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  mail: MdMail,
  receipt_long: MdReceiptLong,
  description: MdDescription,
  person: MdPerson,
  edit_note: MdEditNote,
  task: MdTask,
  credit_card: MdCreditCard,
  notifications: MdNotifications,
  webhook: MdWebhook,
  archive: MdArchive,
  hourglass_top: MdHourglassTop,
  schedule: MdSchedule,
  alt_route: MdAltRoute,
  flag: MdFlag,
  sell: MdSell,
  payments: MdPayments,
  group_add: MdGroupAdd,
  warning: MdWarning,
  bolt: MdBolt,
  widgets: MdWidgets,
  drag_indicator: MdDragIndicator,
  info: MdInfo,
  close: MdClose,
  trip_origin: MdTripOrigin,
};

export function WorkflowIcon({
  name,
  size = 16,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = iconMap[name] ?? MdTripOrigin;
  return <Icon size={size} className={className} />;
}
