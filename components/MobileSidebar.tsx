"use client"
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Sidebar from './Sidebar'

const MobileSidebar = ({
    apiLimitCount = 0,
    isPro = false
}: {
    apiLimitCount: number;
    isPro: boolean;
}) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true)
    }, [])
    if (!isMounted) {
        return null;
    }
    if (isPro) {
        return null;
    }
    return (
        <Sheet>
            {/* button */}
            <SheetTrigger>
                <Button variant={"ghost"} size={"icon"} className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
                <Sidebar
                    isPro={isPro}
                    apiLimitCount={apiLimitCount} />
            </SheetContent>
        </Sheet>
    )
}

export default MobileSidebar
