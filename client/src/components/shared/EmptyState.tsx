interface Props {
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ message, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="text-4xl">🍽️</div>
      <p className="text-muted-foreground text-sm">{message}</p>
      {action}
    </div>
  );
}
