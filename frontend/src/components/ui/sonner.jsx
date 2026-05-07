import { Toaster as SonnerToaster } from 'sonner';

export function Toaster(props) {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      theme={typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
}
