export type Toast = {
  id?: string | number;
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export function useToast() {
  return {
    toast: (_toast?: Toast) => {},
    dismiss: (_id?: Toast['id']) => {},
    toasts: [] as Toast[],
  };
}
