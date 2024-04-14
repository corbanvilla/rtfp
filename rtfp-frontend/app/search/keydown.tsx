"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {

    const router = useRouter();

    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
          const keyK = event.key === 'k' || event.key === 'K';
          const cmdOrCtrl = event.metaKey || event.ctrlKey;
    
          if (cmdOrCtrl && keyK) {
            event.preventDefault();  // prevent browser default action
          
            // reset
            router.push("/");

          }
        };
    
        window.addEventListener("keydown", keyDownHandler);
    
        // Clean up function
        return () => {
          window.removeEventListener("keydown", keyDownHandler);
        };
      }, []);  // The empty array causes this effect to only run once on mount and clean up on unmount   

      return <></>;
}