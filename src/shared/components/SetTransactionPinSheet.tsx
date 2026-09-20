import { SetPinFullScreen } from './PinFullScreen';

/** @deprecated Prefer SetPinFullScreen — kept as alias so existing imports keep working. */
export function SetTransactionPinSheet(props: {
  open: boolean;
  userId: string;
  onClose: () => void;
  onComplete: () => void;
  title?: string;
}) {
  return (
    <SetPinFullScreen
      open={props.open}
      userId={props.userId}
      onClose={props.onClose}
      onComplete={props.onComplete}
    />
  );
}
