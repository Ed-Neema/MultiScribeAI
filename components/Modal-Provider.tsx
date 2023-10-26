"use client";

import { useEffect, useState } from "react";
import ProModal from "./ProModal";

// will add to base layout to make it accessible from everywhere
export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <ProModal />
        </>
    );
};
