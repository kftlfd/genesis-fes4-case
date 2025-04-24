import { useRef, useState } from 'react';

export const useModal = (unmountDelay = 1_000) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const unmountTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toggle = (open: boolean) => {
    if (open) {
      setIsOpen(true);
      setIsMounted(true);
      clearTimeout(unmountTimeout.current);
      unmountTimeout.current = undefined;
    } else {
      setIsOpen(false);
      unmountTimeout.current = setTimeout(() => {
        setIsMounted(false);
      }, unmountDelay);
    }
  };

  return {
    isMounted,
    isOpen,
    toggle,
  };
};
