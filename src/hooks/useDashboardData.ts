import { useState, useCallback, useEffect } from "react";
import {
    getChildById,
    fetchChildRecords,
    uploadChildRecord,
    playChildRecord,
    RecordItem,
} from "@/lib/api";
import { Child } from "@/types/child";

export function useDashboardData(childId: string | undefined) {
    const [child, setChild] = useState<Child | null>(null);
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const loadChild = useCallback(async () => {
        if (!childId) return;
        try {
            setLoading(true);
            const data = await getChildById(childId);
            setChild(data);
        } catch (err) {
            console.error("Failed to load child:", err);
        } finally {
            setLoading(false);
        }
    }, [childId]);

    // ------ LOAD CHILD ------
    useEffect(() => {
        loadChild();
    }, [loadChild]);

    // ------ LOAD RECORDS ------
    const loadRecords = useCallback(async () => {
        if (!childId) return;
        try {
            setRecordsLoading(true);
            const list = await fetchChildRecords(childId);
            setRecords(list);
        } catch (err) {
            console.error("Failed to load records:", err);
        } finally {
            setRecordsLoading(false);
        }
    }, [childId]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    // ------ UPLOAD ------
    const handleUploadRecord = async (file: File) => {
        if (!childId) return;
        try {
            setUploading(true);
            await uploadChildRecord(childId, file);
            await loadRecords();
        } catch (err) {
            console.error("Failed to upload record:", err);
        } finally {
            setUploading(false);
        }
    };

    // ------ PLAY ------
    const handlePlayRecord = async (path: string) => {
        try {
            await playChildRecord(path);
        } catch (err) {
            console.error("Failed to play record:", err);
        }
    };

    return {
        child,
        loading,
        records,
        recordsLoading,
        uploading,
        handleUploadRecord,
        handlePlayRecord,
        reloadChild: loadChild,
    };
}
