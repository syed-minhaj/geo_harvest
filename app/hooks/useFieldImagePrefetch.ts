"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageType } from "@/app/types";
import { FIELD_IMAGE_TYPES, fieldImageUrl } from "@/app/utils/fieldImage";

type UseFieldImagePrefetchOptions = {
    fieldId: string;
    imageType: string;
    imagesDate: string;
};

export function useFieldImagePrefetch({ fieldId, imageType, imagesDate }: UseFieldImagePrefetchOptions) {
    const [visibleDates, setVisibleDates] = useState<string[]>([]);
    const [pageReady, setPageReady] = useState(false);
    const [initialOverlaySettled, setInitialOverlaySettled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [visibilityEpoch, setVisibilityEpoch] = useState(0);
    const imagesDateRef = useRef(imagesDate);
    const visibleDatesRef = useRef<string[]>(visibleDates);
    const prefetchedRef = useRef<Set<string>>(new Set());
    const prefetchImagesRef = useRef<HTMLImageElement[]>([]);
    const prefetchGenerationRef = useRef(0);
    const prefetchScheduledRef = useRef<Set<string>>(new Set());
    const prefetchTimersRef = useRef<Set<number>>(new Set());
    const prefetchScopeRef = useRef<string | null>(null);

    const activeType: ImageType | null = FIELD_IMAGE_TYPES.find((type) => type === imageType) ?? null;
    const prefetchScope = `${fieldId}:${activeType}`;

    const handleVisibleDatesChange = useCallback((dates: string[]) => {
        setVisibleDates((prev) => {
            if (prev.length === dates.length && prev.every((date, i) => date === dates[i])) return prev;
            return dates;
        });
    }, []);

    const handleInitialOverlaySettled = useCallback(() => {
        setInitialOverlaySettled(true);
    }, []);

    useEffect(() => {
        let cancelled = false;
        const start = () => {
            const run = () => {
                if (!cancelled) setPageReady(true);
            };
            if (typeof window.requestIdleCallback === "function") {
                window.requestIdleCallback(run, { timeout: 2000 });
            } else {
                window.setTimeout(run, 200);
            }
        };
        if (document.readyState === "complete") start();
        else window.addEventListener("load", start, { once: true });
        return () => {
            cancelled = true;
            window.removeEventListener("load", start);
        };
    }, []);

    useEffect(() => {
        const update = () => {
            setIsVisible(document.visibilityState === "visible");
            setVisibilityEpoch((epoch) => epoch + 1);
        };
        update();
        document.addEventListener("visibilitychange", update);
        return () => document.removeEventListener("visibilitychange", update);
    }, []);

    useEffect(() => {
        if (initialOverlaySettled) return;
        const timer = window.setTimeout(() => setInitialOverlaySettled(true), 2500);
        return () => window.clearTimeout(timer);
    }, [initialOverlaySettled]);

    useEffect(() => {
        imagesDateRef.current = imagesDate;
    }, [imagesDate]);

    useEffect(() => {
        visibleDatesRef.current = visibleDates;
    }, [visibleDates]);

    useEffect(() => {
        if (prefetchScopeRef.current === prefetchScope) return;
        prefetchScopeRef.current = prefetchScope;
        prefetchGenerationRef.current++;
        for (const timer of prefetchTimersRef.current) window.clearTimeout(timer);
        prefetchTimersRef.current.clear();
        prefetchScheduledRef.current.clear();
    }, [prefetchScope]);

    useEffect(() => {
        return () => {
            prefetchGenerationRef.current++;
            for (const timer of prefetchTimersRef.current) window.clearTimeout(timer);
            prefetchTimersRef.current.clear();
            prefetchScheduledRef.current.clear();
        };
    }, []);

    useEffect(() => {
        if (!pageReady || !initialOverlaySettled || !isVisible || !activeType) return;

        const connection = (navigator as Navigator & {
            connection?: { saveData?: boolean; effectiveType?: string };
        }).connection;
        if (connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") return;

        const generation = prefetchGenerationRef.current;

        visibleDates.forEach((date, index) => {
            if (date === imagesDateRef.current) return;
            const key = `${fieldId}:${activeType}:${date}`;
            if (prefetchedRef.current.has(key) || prefetchScheduledRef.current.has(key)) return;

            prefetchScheduledRef.current.add(key);
            const timer = window.setTimeout(() => {
                prefetchScheduledRef.current.delete(key);
                prefetchTimersRef.current.delete(timer);
                if (generation !== prefetchGenerationRef.current) return;
                if (document.visibilityState !== "visible") return;
                if (date === imagesDateRef.current) return;
                if (!visibleDatesRef.current.includes(date)) return;
                if (prefetchedRef.current.has(key)) return;

                prefetchedRef.current.add(key);
                const img = new window.Image();
                img.fetchPriority = "low";
                img.src = fieldImageUrl(fieldId, date, activeType);
                prefetchImagesRef.current.push(img);

                const release = () => {
                    const i = prefetchImagesRef.current.indexOf(img);
                    if (i >= 0) prefetchImagesRef.current.splice(i, 1);
                };
                img.addEventListener("load", release, { once: true });
                img.addEventListener("error", () => {
                    prefetchedRef.current.delete(key);
                    release();
                }, { once: true });
            }, index * 75);
            prefetchTimersRef.current.add(timer);
        });
    }, [activeType, fieldId, initialOverlaySettled, isVisible, pageReady, visibilityEpoch, visibleDates]);

    return { handleVisibleDatesChange, handleInitialOverlaySettled };
}
